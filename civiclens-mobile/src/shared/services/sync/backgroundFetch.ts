import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { createLogger } from '@shared/utils/logger';

const log = createLogger('BackgroundFetch');

export const BACKGROUND_SYNC_TASK = 'BACKGROUND_SYNC_TASK';

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
    log.info('Running Background Sync Task');
    try {
        const { useReportStore } = await import('@store/reportStore');
        await useReportStore.getState().syncOfflineReports();
        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (err) {
        log.error('Background Sync Task failed:', err);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

export async function registerBackgroundSync() {
    try {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
        if (!isRegistered) {
            await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
                minimumInterval: 15 * 60, // 15 minutes
                stopOnTerminate: false,
                startOnBoot: true,
            });
            log.info('Background sync task registered successfully');
        } else {
            log.info('Background sync task already registered');
        }
    } catch (err) {
        log.error('Failed to register background sync task:', err);
    }
}

export async function unregisterBackgroundSync() {
    try {
        await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
        log.info('Background sync task unregistered');
    } catch (err) {
        log.error('Failed to unregister background sync task:', err);
    }
}
