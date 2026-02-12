import { useState, useEffect } from 'react';
import { database } from '@shared/database';
import { FileStorage, cacheService } from '@shared/services/storage';
import { networkService } from '@shared/services/network/networkService';
import { syncManager } from '@shared/services/sync/syncManager';
import { submissionQueue } from '@shared/services/queue/submissionQueue';
import { useAuthStore } from '@store/authStore';
import { createLogger } from '@shared/utils/logger';

const log = createLogger('AppInit');

export function useAppInitialization() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Minimum splash screen duration (matches animation duration)
  const MINIMUM_SPLASH_DURATION = 2200;

  useEffect(() => {
    async function initializeApp() {
      const startTime = Date.now();

      try {
        log.info('Initializing CivicLens Mobile');

        // Critical initialization (must complete)
        await Promise.all([
          cacheService.initialize(),
          FileStorage.init(),
          networkService.initialize(),
          useAuthStore.getState().initialize()
        ]);

        // Optional initialization tasks (fire and forget)
        const optionalInit = async () => {
            // Database initialization (must happen before dependent services)
            try {
                await database.init();
                log.info('Database initialized successfully');
            } catch (dbError) {
                log.warn('Database initialization failed (offline features disabled)', dbError);
                return; // Stop if DB fails
            }

            // Parallel dependents
            const parallelTasks = [];

            // Only run database-dependent tasks if database is ready
            if (database.isReady()) {
                parallelTasks.push(
                    syncManager.initialize()
                        .then(() => log.info('Sync manager initialized'))
                        .catch(e => log.warn('Sync manager init failed', e))
                );
                parallelTasks.push(
                    submissionQueue.initialize()
                        .then(() => log.info('Submission queue initialized'))
                        .catch(e => log.warn('Submission queue init failed', e))
                );
            }

            // Data preloader is independent
            parallelTasks.push(
                import('@shared/services/preload/dataPreloader')
                    .then(m => m.dataPreloader.initialize())
                    .then(() => log.info('Data preloader initialized'))
                    .catch(e => log.warn('Data preloader init failed', e))
            );

            await Promise.allSettled(parallelTasks);
        };

        // Start optional tasks in background
        optionalInit().catch(err => {
            log.warn('Optional initialization failed', err);
        });

        // Ensure minimum splash duration for smooth UX
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MINIMUM_SPLASH_DURATION - elapsedTime);

        if (remainingTime > 0) {
          log.info(`Waiting ${remainingTime}ms to complete splash animation`);
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }

        log.info('App ready to launch');
        setIsReady(true);
      } catch (err) {
        log.error('Critical app initialization failed', err);

        // Even on critical failure, still respect minimum splash duration
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MINIMUM_SPLASH_DURATION - elapsedTime);

        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }

        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }

    initializeApp();
  }, []);

  return { isReady, error };
}
