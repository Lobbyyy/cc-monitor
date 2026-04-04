import { SessionTracker } from './session-tracker';

/**
 * Background job to mark sessions inactive after 30 minutes of no activity
 */
export class SessionCleanupJob {
  private interval: Timer | null = null;
  private tracker = new SessionTracker();

  /**
   * Start the cleanup job (runs every minute)
   */
  start(): void {
    if (this.interval) {
      console.warn('Cleanup job already running');
      return;
    }

    console.log('Starting session cleanup job (runs every 60s)');

    this.interval = setInterval(async () => {
      try {
        await this.tracker.markInactiveSessions();
      } catch (error) {
        console.error('Error in session cleanup job:', error);
      }
    }, 60 * 1000); // Every 60 seconds
  }

  /**
   * Stop the cleanup job
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('Session cleanup job stopped');
    }
  }
}
