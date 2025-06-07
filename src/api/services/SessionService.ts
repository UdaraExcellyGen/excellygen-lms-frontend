// src/services/SessionService.ts
import ActivityTracker from './ActivityTracker';
import { heartbeat } from '../authApi';

interface SessionConfig {
  // Time before token expiry to refresh (in milliseconds)
  refreshWindow: number;
  // Maximum time without activity to still refresh token (in milliseconds)
  maxIdleBeforeRefresh: number;
  // How often to check if token needs refreshing (in milliseconds)
  heartbeatInterval: number;
}

class SessionService {
  private static instance: SessionService;
  private activityTracker: ActivityTracker;
  private intervalId: number | null = null;
  private tokenExpiryTime: number | null = null;
  private config: SessionConfig = {
    refreshWindow: 10 * 60 * 1000, // 10 minutes before expiry
    maxIdleBeforeRefresh: 30 * 60 * 1000, // 30 minutes of inactivity max
    heartbeatInterval: 5 * 60 * 1000, // Check every 5 minutes
  };
  
  private constructor() {
    this.activityTracker = ActivityTracker.getInstance();
    console.log('Session service initialized');
  }

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  public startSessionManager(): void {
    // Set token expiry time based on localStorage
    this.updateTokenExpiryFromStorage();
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Subscribe to activity events
    this.activityTracker.onActivity(() => {
      // When user is active, we could check if token needs refresh
      this.checkAndRefreshIfNeeded();
    });
    
    console.log('Session manager started');
  }

  private updateTokenExpiryFromStorage(): void {
    const expiryString = localStorage.getItem('token_expiry');
    if (expiryString) {
      this.tokenExpiryTime = new Date(expiryString).getTime();
      console.log(`Token expires at: ${new Date(this.tokenExpiryTime).toLocaleTimeString()}`);
    }
  }

  private startHeartbeat(): void {
    // Clear any existing interval
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
    
    // Set up the heartbeat interval
    this.intervalId = window.setInterval(() => {
      this.checkAndRefreshIfNeeded();
    }, this.config.heartbeatInterval);
    
    console.log(`Heartbeat started, checking every ${this.config.heartbeatInterval / 1000} seconds`);
  }

  private checkAndRefreshIfNeeded(): void {
    if (!this.tokenExpiryTime) {
      this.updateTokenExpiryFromStorage();
      if (!this.tokenExpiryTime) return; // Still no expiry time
    }
    
    const now = Date.now();
    const timeUntilExpiry = this.tokenExpiryTime - now;
    const idleTime = this.activityTracker.getIdleTime();
    
    // Check if we're within the refresh window and user is not too idle
    if (timeUntilExpiry < this.config.refreshWindow && idleTime < this.config.maxIdleBeforeRefresh) {
      this.refreshToken();
    }
  }

  private async refreshToken(): Promise<void> {
    try {
      const accessToken = localStorage.getItem('access_token');
      
      if (!accessToken) {
        console.error('No tokens available for refresh');
        return;
      }
      
      console.log('Proactively refreshing token due to user activity...');
      
      // Call the heartbeat endpoint to extend the session
      const response = await heartbeat();
      
      console.log('Token refreshed successfully via heartbeat');
      
      // Update the expiry time from storage after refresh
      this.updateTokenExpiryFromStorage();
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  }

  public stopSessionManager(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log('Session manager stopped');
  }
}

export default SessionService;