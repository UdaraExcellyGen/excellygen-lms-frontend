// src/api/services/SessionService.ts
import { heartbeat } from '../authApi';
import ActivityTracker from './ActivityTracker';

class SessionService {
  private static instance: SessionService;
  private activityLogIntervalId: number | null = null;
  private activityTracker: ActivityTracker;
  private consecutiveFailures: number = 0;
  private maxFailures: number = 3;

  // OPTIMIZED: Increased interval to 5 minutes for better scalability
  private readonly LOG_INTERVAL = 5 * 60 * 1000; // 5 minutes instead of 1 minute
  
  // OPTIMIZATION: Different intervals for different scenarios
  private readonly ACTIVE_USER_INTERVAL = 3 * 60 * 1000; // 3 minutes for active users
  private readonly IDLE_USER_INTERVAL = 10 * 60 * 1000;   // 10 minutes for idle users
  private readonly MAX_IDLE_TIME = 30 * 60 * 1000;        // 30 minutes max idle

  private constructor() {
    this.activityTracker = ActivityTracker.getInstance();
    console.log('🟢 Session Service Initialized with optimized intervals.');
  }

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  /**
   * Starts the session manager with adaptive intervals based on user activity.
   */
  public startSessionManager(): void {
    this.stopSessionManager(); // Ensure no multiple intervals are running
    
    // Don't immediately log on start - wait for first interval
    // This prevents unnecessary requests on app initialization
    
    // Start with the optimized interval
    this.scheduleNextHeartbeat();
    
    console.log(`🚀 Session Manager Started with adaptive intervals (base: ${this.LOG_INTERVAL / 1000}s).`);
  }

  /**
   * Stops the session manager and clears the activity logging interval.
   */
  public stopSessionManager(): void {
    if (this.activityLogIntervalId) {
      window.clearInterval(this.activityLogIntervalId);
      this.activityLogIntervalId = null;
    }
    console.log('🛑 Session Manager Stopped.');
  }

  /**
   * OPTIMIZATION: Adaptive scheduling based on user activity
   */
  private scheduleNextHeartbeat(): void {
    const interval = this.getAdaptiveInterval();
    
    this.activityLogIntervalId = window.setTimeout(() => {
      this.logActivity().finally(() => {
        // Schedule next heartbeat regardless of success/failure
        this.scheduleNextHeartbeat();
      });
    }, interval);
  }

  /**
   * OPTIMIZATION: Calculate interval based on user activity patterns
   */
  private getAdaptiveInterval(): number {
    const idleTime = this.activityTracker.getIdleTime();
    
    // If user has been idle for too long, use longer intervals
    if (idleTime > this.MAX_IDLE_TIME) {
      console.log('👤 User very idle, using extended interval');
      return this.IDLE_USER_INTERVAL;
    }
    
    // If user is actively using the app, use shorter intervals
    if (idleTime < 2 * 60 * 1000) { // Less than 2 minutes idle
      return this.ACTIVE_USER_INTERVAL;
    }
    
    // Default interval for moderately active users
    return this.LOG_INTERVAL;
  }

  /**
   * OPTIMIZED: Smarter activity logging with exponential backoff on failures
   */
  private async logActivity(): Promise<void> {
    const idleTime = this.activityTracker.getIdleTime();
    
    // OPTIMIZATION: Don't send heartbeat if user has been idle too long
    if (idleTime > this.MAX_IDLE_TIME) {
      console.log('😴 User idle for too long, skipping heartbeat');
      return;
    }

    // OPTIMIZATION: Only log if user has been somewhat active
    if (idleTime < this.LOG_INTERVAL * 2) { // Allow some buffer
      try {
        console.log(`💓 Sending heartbeat (idle: ${Math.round(idleTime / 1000)}s)`);
        
        await heartbeat();
        
        // Reset failure counter on success
        this.consecutiveFailures = 0;
        
      } catch (error) {
        this.consecutiveFailures++;
        
        console.error(`❌ Failed to send heartbeat (attempt ${this.consecutiveFailures}):`, error);
        
        // OPTIMIZATION: Exponential backoff - stop after too many failures
        if (this.consecutiveFailures >= this.maxFailures) {
          console.warn('⚠️ Too many heartbeat failures, stopping session manager');
          this.stopSessionManager();
          
          // OPTIMIZATION: Try to restart after a delay (circuit breaker pattern)
          setTimeout(() => {
            console.log('🔄 Attempting to restart session manager...');
            this.consecutiveFailures = 0;
            this.startSessionManager();
          }, 60000); // Wait 1 minute before retrying
        }
      }
    } else {
      console.log(`💤 User idle (${Math.round(idleTime / 1000)}s), skipping heartbeat`);
    }
  }

  /**
   * OPTIMIZATION: Manual heartbeat for immediate activity logging
   */
  public sendImmediateHeartbeat(): Promise<void> {
    console.log('⚡ Sending immediate heartbeat...');
    return this.logActivity();
  }

  /**
   * OPTIMIZATION: Get current session status
   */
  public getSessionStatus() {
    return {
      isActive: this.activityLogIntervalId !== null,
      nextInterval: this.getAdaptiveInterval(),
      consecutiveFailures: this.consecutiveFailures,
      userIdleTime: this.activityTracker.getIdleTime(),
      isUserActive: this.activityTracker.isActive()
    };
  }

  /**
   * OPTIMIZATION: Reset failure counter (useful for manual recovery)
   */
  public resetFailures(): void {
    this.consecutiveFailures = 0;
    console.log('🔄 Heartbeat failure counter reset');
  }
}

export default SessionService;