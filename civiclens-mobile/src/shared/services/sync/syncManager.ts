/**
 * Sync Manager
 * Handles offline queue management and automatic synchronization
 */

import { networkService } from '@shared/services/network/networkService';
import { database } from '@shared/database/database';
import { conflictResolver } from './conflictResolver';
import { createLogger } from '@shared/utils/logger';

const log = createLogger('SyncManager');


export interface SyncQueueItem {
  id: number;
  item_type: 'report' | 'task' | 'media';
  operation: 'create' | 'update' | 'delete' | 'acknowledge' | 'start-work' | 'complete' | 'add-update';
  data: string; // JSON stringified data
  retry_count: number;
  last_attempt: number | null;
  error: string | null;
  created_at: number;
}

export interface SyncStatus {
  isSyncing: boolean;
  queueSize: number;
  lastSyncTime: number | null;
  errors: string[];
}

class SyncManager {
  private isSyncing = false;
  private syncListeners: Set<(status: SyncStatus) => void> = new Set();
  private networkUnsubscribe: (() => void) | null = null;
  private lastSyncTime: number | null = null;
  private syncErrors: string[] = [];

  // Exponential backoff configuration
  private readonly MAX_RETRY_COUNT = 5;
  private readonly BASE_DELAY_MS = 1000; // 1 second
  private readonly MAX_DELAY_MS = 30000; // 30 seconds

  /**
   * Initialize sync manager and start listening to network changes
   */
  async initialize(): Promise<void> {
    log.info('Initializing Sync Manager...');

    // Listen to network changes
    this.networkUnsubscribe = networkService.addListener((status) => {
      if (status.isConnected && status.isInternetReachable && !this.isSyncing) {
        log.info('Network restored, starting sync...');
        this.syncAllData();
      }
    });

    // Perform initial sync if online
    if (networkService.isOnline()) {
      await this.syncAllData();
    }

    log.info('Sync Manager initialized successfully');
  }


  /**
   * Add a listener for sync status changes
   */
  addListener(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.add(listener);
    return () => {
      this.syncListeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of sync status change
   */
  private notifyListeners(): void {
    const status = this.getStatus();
    this.syncListeners.forEach((listener) => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return {
      isSyncing: this.isSyncing,
      queueSize: 0, // Will be updated by getQueueSize()
      lastSyncTime: this.lastSyncTime,
      errors: [...this.syncErrors],
    };
  }

  /**
   * Get the size of the sync queue
   * Returns 0 if database is not ready
   */
  async getQueueSize(): Promise<number> {
    if (!database.isReady()) {
      return 0;
    }

    try {
      const { useAuthStore } = await import('@store/authStore');
      const user = useAuthStore.getState().user;
      if (!user) return 0;

      const result = await database.getAllAsync<{ data: string }>(
        'SELECT data FROM sync_queue'
      );
      
      let userCount = 0;
      for (const row of result) {
        try {
          const parsed = JSON.parse(row.data);
          // Only count tasks that belong to the current user OR tasks from before the migration
          if (parsed._user_id === user.id || !parsed._user_id) {
            userCount++;
          }
        } catch (e) {}
      }
      return userCount;
    } catch (error) {
      log.error('Error getting queue size', error);
      return 0;
    }
  }

  /**
   * Sync all pending data
   */
  async syncAllData(): Promise<void> {
    if (this.isSyncing) {
      log.info('Sync already in progress, skipping...');
      return;
    }

    if (!networkService.isOnline()) {
      log.info('Device is offline, skipping sync');
      return;
    }

    // Check authentication - don't sync if not logged in
    const { useAuthStore } = await import('@/store/authStore');
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      log.info('User not authenticated, skipping sync');
      return;
    }


    this.isSyncing = true;
    this.syncErrors = [];
    this.notifyListeners();

    try {
      log.info('Starting sync...');

      // Sync in order: Reports → Tasks → Media
      await this.syncReports();
      await this.syncTasks();
      await this.syncQueue();

      this.lastSyncTime = Date.now();
      log.info('Sync completed successfully');
    } catch (error) {
      log.error('Sync failed', error);
      this.syncErrors.push(error instanceof Error ? error.message : 'Unknown sync error');
    } finally {

      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  /**
   * Sync unsynced reports
   */
  private async syncReports(): Promise<void> {
    try {
      const unsyncedReports = await database.getAllAsync<any>(
        'SELECT * FROM reports WHERE is_synced = 0 ORDER BY created_at ASC'
      );

      log.info(`Found ${unsyncedReports.length} unsynced reports`);

      for (const report of unsyncedReports) {
        await this.syncReport(report);
      }
    } catch (error) {
      log.error('Error syncing reports', error);
      throw error;
    }

  }

  /**
   * Sync a single report
   */
  private async syncReport(report: any): Promise<void> {
    try {
      // Check for duplicates before syncing
      const duplicateCheck = await conflictResolver.detectDuplicateReport(report);
      
      if (duplicateCheck.isDuplicate && duplicateCheck.duplicateId) {
        log.warn(`Report ${report.id} is a duplicate of ${duplicateCheck.duplicateId}`);
        await conflictResolver.markReportAsDuplicate(report.id, duplicateCheck.duplicateId);
        return;
      }


      // For now, mark as synced (will be updated when API is integrated)
      await database.runAsync(
        'UPDATE reports SET is_synced = 1, sync_error = NULL, updated_at = ? WHERE id = ?',
        [Date.now(), report.id]
      );

      log.info(`Synced report: ${report.local_id || report.id}`);
    } catch (error) {
      log.error(`Failed to sync report ${report.id}`, error);

      // Update error status
      await database.runAsync(
        'UPDATE reports SET sync_error = ?, updated_at = ? WHERE id = ?',
        [error instanceof Error ? error.message : 'Sync failed', Date.now(), report.id]
      );

      throw error;
    }

  }

  /**
   * Sync unsynced tasks
   */
  private async syncTasks(): Promise<void> {
    try {
      const unsyncedTasks = await database.getAllAsync<any>(
        'SELECT * FROM tasks WHERE is_synced = 0 ORDER BY created_at ASC'
      );

      log.info(`Found ${unsyncedTasks.length} unsynced tasks`);

      for (const task of unsyncedTasks) {
        await this.syncTask(task);
      }
    } catch (error) {
      log.error('Error syncing tasks', error);
      throw error;
    }

  }

  /**
   * Sync a single task
   */
  private async syncTask(task: any): Promise<void> {
    try {
      // For now, mark as synced
      await database.runAsync(
        'UPDATE tasks SET is_synced = 1, pending_sync = NULL, updated_at = ? WHERE id = ?',
        [Date.now(), task.id]
      );

      log.info(`Synced task: ${task.id}`);
    } catch (error) {
      log.error(`Failed to sync task ${task.id}`, error);
      throw error;
    }

  }

  /**
   * Process sync queue with exponential backoff retry
   */
  private async syncQueue(): Promise<void> {
    try {
      const { useAuthStore } = await import('@store/authStore');
      const user = useAuthStore.getState().user;
      if (!user) return; // Prevent ghost syncing

      const queueItems = await database.getAllAsync<SyncQueueItem>(
        'SELECT * FROM sync_queue WHERE retry_count < ? ORDER BY created_at ASC',
        [this.MAX_RETRY_COUNT]
      );

      // Filter by current logged in user
      const userQueueItems = queueItems.filter(item => {
         try {
           const parsed = JSON.parse(item.data);
           return parsed._user_id === user.id || !parsed._user_id;
         } catch(e) { return false; }
      });

      log.info(`Found ${userQueueItems.length} items in sync queue for user ${user.id}`);

      for (const item of userQueueItems) {
        await this.processSyncQueueItem(item);
      }

      // Clean up successfully synced items
      await this.cleanupSyncQueue();
    } catch (error) {
      log.error('Error processing sync queue', error);
      throw error;
    }

  }

  /**
   * Process a single sync queue item with retry logic
   */
  private async processSyncQueueItem(item: SyncQueueItem): Promise<void> {
    try {
      // Check if we should retry based on exponential backoff
      if (item.last_attempt) {
        const delay = this.calculateRetryDelay(item.retry_count);
        const timeSinceLastAttempt = Date.now() - item.last_attempt;

        if (timeSinceLastAttempt < delay) {
          log.debug(`Skipping item ${item.id}, waiting for retry delay`);
          return;
        }
      }


      log.info(`Processing sync queue item ${item.id} (attempt ${item.retry_count + 1})`);

      // Parse data
      const data = JSON.parse(item.data);

      // Process based on item type and operation
      await this.processSyncOperation(item.item_type, item.operation, data);

      // Remove from queue on success
      await database.runAsync('DELETE FROM sync_queue WHERE id = ?', [item.id]);

      log.info(`Successfully processed sync queue item ${item.id}`);
    } catch (error) {
      log.error(`Failed to process sync queue item ${item.id}`, error);

      // Update retry count and error
      await database.runAsync(
        'UPDATE sync_queue SET retry_count = retry_count + 1, last_attempt = ?, error = ? WHERE id = ?',
        [Date.now(), error instanceof Error ? error.message : 'Unknown error', item.id]
      );

      // If max retries reached, log error
      if (item.retry_count + 1 >= this.MAX_RETRY_COUNT) {
        log.error(`Max retries reached for sync queue item ${item.id}`);
        this.syncErrors.push(`Failed to sync ${item.item_type} after ${this.MAX_RETRY_COUNT} attempts`);
      }
    }
  }

  /**
   * Process sync operation based on type
   */
  private async processSyncOperation(
    itemType: string,
    operation: string,
    data: any
  ): Promise<void> {
    const { apiClient } = await import('@shared/services/api/apiClient');
    
    log.debug(`Syncing ${itemType} ${operation}:`, data);

    if (itemType === 'task') {
      const { reportId, status, notes, updateText } = data;

      switch (operation) {
        case 'acknowledge':
          await apiClient.post(`/reports/${reportId}/acknowledge`, { notes });
          break;
        case 'start-work':
          await apiClient.post(`/reports/${reportId}/start-work`, { notes });
          break;
        case 'complete':
          await apiClient.put(`/reports/${reportId}`, { status, notes });
          break;
        case 'add-update':
          const formData = new FormData();
          formData.append('update_text', updateText);
          await apiClient.post(`/reports/${reportId}/add-update`, formData);
          break;
        default:
          log.warn(`Unknown task operation: ${operation}`);
      }
    } else {
      log.debug(`Skipping ${operation} for ${itemType} - no implementation yet`);
    }
  }


  /**
   * Calculate retry delay using exponential backoff
   */
  private calculateRetryDelay(retryCount: number): number {
    const delay = Math.min(
      this.BASE_DELAY_MS * Math.pow(2, retryCount),
      this.MAX_DELAY_MS
    );
    return delay;
  }

  /**
   * Add item to sync queue
   */
  async addToQueue(
    itemType: 'report' | 'task' | 'media',
    operation: 'create' | 'update' | 'delete' | 'acknowledge' | 'start-work' | 'complete' | 'add-update',
    data: any
  ): Promise<void> {
    try {
      const { useAuthStore } = await import('@store/authStore');
      const user = useAuthStore.getState().user;
      const dataWithUser = { ...data, _user_id: user?.id };

      await database.runAsync(
        `INSERT INTO sync_queue (item_type, operation, data, retry_count, created_at)
         VALUES (?, ?, ?, 0, ?)`,
        [itemType, operation, JSON.stringify(dataWithUser), Date.now()]
      );

      log.info(`Added ${itemType} to sync queue`);

      // Trigger sync if online
      if (networkService.isOnline() && !this.isSyncing) {
        this.syncAllData();
      }
    } catch (error) {
      log.error('Error adding to sync queue', error);
      throw error;
    }

  }

  /**
   * Clean up old sync queue items
   */
  private async cleanupSyncQueue(): Promise<void> {
    try {
      // Remove items older than 90 days that have reached max retries
      const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
      
      await database.runAsync(
        'DELETE FROM sync_queue WHERE created_at < ? AND retry_count >= ?',
        [ninetyDaysAgo, this.MAX_RETRY_COUNT]
      );

      log.info('Cleaned up old sync queue items');
    } catch (error) {
      log.error('Error cleaning up sync queue', error);
    }

  }

  /**
   * Clear all items from sync queue
   */
  async clearQueue(): Promise<void> {
    try {
      await database.runAsync('DELETE FROM sync_queue');
      log.info('Cleared sync queue');
      this.notifyListeners();
    } catch (error) {
      log.error('Error clearing sync queue', error);
      throw error;
    }

  }

  /**
   * Retry a specific failed sync item
   */
  async retryFailedSync(itemId: number): Promise<void> {
    try {
      const item = await database.getFirstAsync<SyncQueueItem>(
        'SELECT * FROM sync_queue WHERE id = ?',
        [itemId]
      );

      if (!item) {
        throw new Error(`Sync queue item ${itemId} not found`);
      }

      // Reset retry count and attempt sync
      await database.runAsync(
        'UPDATE sync_queue SET retry_count = 0, last_attempt = NULL, error = NULL WHERE id = ?',
        [itemId]
      );

      await this.processSyncQueueItem(item);
    } catch (error) {
      log.error(`Error retrying sync item ${itemId}`, error);
      throw error;
    }
  }

  /**
   * Clean up sync manager
   */
  cleanup(): void {
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
      this.networkUnsubscribe = null;
    }
    this.syncListeners.clear();
    log.info('Sync Manager cleaned up');
  }
}


// Export singleton instance
export const syncManager = new SyncManager();
