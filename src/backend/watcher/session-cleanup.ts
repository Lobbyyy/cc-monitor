import { SessionTracker } from './session-tracker';
import { logger } from '../utils/logger';

/** Default cleanup interval in milliseconds (60 seconds) */
const DEFAULT_CLEANUP_INTERVAL_MS = 60 * 1000;

/** Max consecutive failures before warning */
const MAX_CONSECUTIVE_FAILURES = 3;

/**
 * Background job to mark sessions inactive after 30 minutes of no activity
 */
export class SessionCleanupJob {
  private interval: Timer | null = null;
  private tracker = new SessionTracker();
  private consecutiveFailures = 0;

  /**
   * Creates a new SessionCleanupJob
   * @param intervalMs - Cleanup interval in milliseconds (default: 60000)
   */
  constructor(private intervalMs: number = DEFAULT_CLEANUP_INTERVAL_MS) {}

  /**
   * Start the cleanup job
   */
  start(): void {
    if (this.interval) {
      logger.warn('Cleanup job already running');
      return;
    }

    logger.info({ intervalMs: this.intervalMs }, 'Starting session cleanup job');

    this.interval = setInterval(async () => {
      try {
        await this.tracker.markInactiveSessions();
        this.consecutiveFailures = 0;
      } catch (error) {
        this.consecutiveFailures++;
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error({
          error: err.message,
          consecutiveFailures: this.consecutiveFailures,
        }, 'Error in session cleanup job');

        if (this.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
          logger.warn({
            failures: this.consecutiveFailures,
          }, 'Session cleanup job has failed multiple times');
        }
      }
    }, this.intervalMs);
  }

  /**
   * Stop the cleanup job
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      logger.info('Session cleanup job stopped');
    }
  }

  /**
   * Get current consecutive failure count (for monitoring)
   */
  getFailureCount(): number {
    return this.consecutiveFailures;
  }
}
