import { heartbeat } from '../authApi';
import ActivityTracker from './ActivityTracker';

class SessionService {
  private static instance: SessionService;
  private activityLogIntervalId: number | null = null;
  private activityTracker: ActivityTracker;

  // The interval for logging user activity (1 minute)
  private readonly LOG_INTERVAL = 60 * 1000;

  private constructor() {
    this.activityTracker = ActivityTracker.getInstance();
    console.log('Session Service Initialized.');
  }

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  /**
   * Starts the session manager which is responsible for logging user activity.
   */
  public startSessionManager(): void {
    this.stopSessionManager(); // Ensure no multiple intervals are running
    
    // Immediately log an activity event on start, then start the interval
    this.logActivity(); 
    
    this.activityLogIntervalId = window.setInterval(() => {
      this.logActivity();
    }, this.LOG_INTERVAL);

    console.log(`Session Manager Started: Logging activity every ${this.LOG_INTERVAL / 1000} seconds.`);
  }

  /**
   * Stops the session manager and clears the activity logging interval.
   */
  public stopSessionManager(): void {
    if (this.activityLogIntervalId) {
      window.clearInterval(this.activityLogIntervalId);
      this.activityLogIntervalId = null;
    }
    console.log('Session Manager Stopped.');
  }

  /**
   * Calls the backend heartbeat endpoint to log one minute of activity.
   * It only logs if the user has been active recently.
   */
  private async logActivity(): Promise<void> {
    // We only log activity if the user has not been idle for more than the interval itself.
    if (this.activityTracker.getIdleTime() < this.LOG_INTERVAL) {
      try {
        console.log('Sending heartbeat to log user activity...');
        // The backend's /heartbeat endpoint now logs 1 minute of activity.
        await heartbeat();
      } catch (error) {
        console.error('Failed to send activity heartbeat:', error);
        // If heartbeat fails (e.g., token expired), stop trying to prevent spamming errors.
        this.stopSessionManager();
      }
    } else {
        console.log('User is idle. Skipping activity log.');
    }
  }
}

export default SessionService;