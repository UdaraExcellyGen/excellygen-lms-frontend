// src/api/services/ActivityTracker.ts
import { debounce, throttle } from 'lodash';

type ActivityCallback = () => void;

interface ActivityConfig {
  idleThreshold: number;
  debounceDelay: number;
  throttleDelay: number;
  checkInterval: number;
}

class ActivityTracker {
  private static instance: ActivityTracker;
  private callbacks: ActivityCallback[] = [];
  private lastActivity: number = Date.now();
  private isTrackingActive: boolean = false;
  
  // OPTIMIZATION: Reduced event types for better performance
  private events: string[] = [
    'mousedown', 'keypress', 'scroll', 'touchstart', 'click'
  ];
  
  // OPTIMIZATION: Configurable thresholds
  private config: ActivityConfig = {
    idleThreshold: 5 * 60 * 1000,    // 5 minutes in milliseconds
    debounceDelay: 500,              // Increased debounce for better performance
    throttleDelay: 1000,             // Add throttling for high-frequency events
    checkInterval: 2 * 60 * 1000     // Check every 2 minutes instead of 1
  };
  
  private idleCheckInterval: number | null = null;
  private debouncedActivityHandler: (() => void) | null = null;
  private throttledActivityHandler: (() => void) | null = null;
  
  private constructor() {
    this.initializeHandlers();
    console.log('🎯 Activity tracker initialized with optimized performance');
  }

  public static getInstance(): ActivityTracker {
    if (!ActivityTracker.instance) {
      ActivityTracker.instance = new ActivityTracker();
    }
    return ActivityTracker.instance;
  }

  private initializeHandlers(): void {
    // OPTIMIZATION: Create optimized activity handlers
    this.debouncedActivityHandler = debounce(
      this.handleUserActivity.bind(this), 
      this.config.debounceDelay
    );
    
    this.throttledActivityHandler = throttle(
      this.handleUserActivity.bind(this), 
      this.config.throttleDelay
    );
  }

  /**
   * OPTIMIZATION: Start tracking with smart registration
   */
  public startTracking(): void {
    if (this.isTrackingActive) {
      return; // Already tracking
    }

    this.registerActivityListeners();
    this.startIdleCheck();
    this.isTrackingActive = true;
    
    console.log('🟢 Activity tracking started');
  }

  /**
   * OPTIMIZATION: Stop tracking to save resources
   */
  public stopTracking(): void {
    if (!this.isTrackingActive) {
      return; // Already stopped
    }

    this.removeActivityListeners();
    this.stopIdleCheck();
    this.isTrackingActive = false;
    
    console.log('🔴 Activity tracking stopped');
  }

  private registerActivityListeners(): void {
    if (!this.debouncedActivityHandler) {
      this.initializeHandlers();
    }

    // OPTIMIZATION: Use passive listeners for better performance
    const passiveEvents = ['scroll', 'touchstart'];
    const activeEvents = ['mousedown', 'keypress', 'click'];

    // Register passive event listeners (better for performance)
    passiveEvents.forEach(event => {
      if (this.events.includes(event)) {
        window.addEventListener(event, this.throttledActivityHandler!, { passive: true });
      }
    });

    // Register active event listeners
    activeEvents.forEach(event => {
      if (this.events.includes(event)) {
        window.addEventListener(event, this.debouncedActivityHandler!);
      }
    });
  }

  private removeActivityListeners(): void {
    if (!this.debouncedActivityHandler || !this.throttledActivityHandler) {
      return;
    }

    // Remove all event listeners
    this.events.forEach(event => {
      window.removeEventListener(event, this.debouncedActivityHandler!);
      window.removeEventListener(event, this.throttledActivityHandler!);
    });
  }

  private handleUserActivity(): void {
    const now = Date.now();
    
    // OPTIMIZATION: Only update if significant time has passed
    if (now - this.lastActivity > 1000) { // At least 1 second
      this.lastActivity = now;
      
      // Notify callbacks efficiently
      if (this.callbacks.length > 0) {
        this.callbacks.forEach(callback => {
          try {
            callback();
          } catch (error) {
            console.error('Activity callback error:', error);
          }
        });
      }
    }
  }

  /**
   * OPTIMIZATION: Improved callback management
   */
  public onActivity(callback: ActivityCallback): () => void {
    if (typeof callback !== 'function') {
      throw new Error('Activity callback must be a function');
    }

    this.callbacks.push(callback);
    
    // Auto-start tracking when first callback is added
    if (this.callbacks.length === 1 && !this.isTrackingActive) {
      this.startTracking();
    }
    
    // Return cleanup function
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
      
      // Auto-stop tracking when no callbacks remain
      if (this.callbacks.length === 0 && this.isTrackingActive) {
        this.stopTracking();
      }
    };
  }

  public getLastActivityTime(): number {
    return this.lastActivity;
  }

  public isActive(): boolean {
    return (Date.now() - this.lastActivity) < this.config.idleThreshold;
  }

  public getIdleTime(): number {
    return Date.now() - this.lastActivity;
  }

  /**
   * OPTIMIZATION: Get human-readable idle time
   */
  public getIdleTimeFormatted(): string {
    const idleTime = this.getIdleTime();
    const minutes = Math.floor(idleTime / 60000);
    const seconds = Math.floor((idleTime % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }

  private startIdleCheck(): void {
    if (this.idleCheckInterval) {
      return; // Already running
    }

    // OPTIMIZATION: Less frequent idle checks
    this.idleCheckInterval = window.setInterval(() => {
      const idleTime = this.getIdleTime();
      
      // Log idle status in development
      if (import.meta.env.DEV && idleTime > this.config.idleThreshold) {
        console.log(`😴 User idle for ${this.getIdleTimeFormatted()}`);
      }
    }, this.config.checkInterval);
  }

  private stopIdleCheck(): void {
    if (this.idleCheckInterval) {
      clearInterval(this.idleCheckInterval);
      this.idleCheckInterval = null;
    }
  }

  /**
   * OPTIMIZATION: Update configuration
   */
  public updateConfig(newConfig: Partial<ActivityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Re-initialize handlers if tracking is active
    if (this.isTrackingActive) {
      this.stopTracking();
      this.initializeHandlers();
      this.startTracking();
    }
    
    console.log('⚙️ Activity tracker config updated:', this.config);
  }

  /**
   * OPTIMIZATION: Get comprehensive status
   */
  public getStatus() {
    return {
      isTracking: this.isTrackingActive,
      lastActivity: this.lastActivity,
      idleTime: this.getIdleTime(),
      idleTimeFormatted: this.getIdleTimeFormatted(),
      isActive: this.isActive(),
      callbackCount: this.callbacks.length,
      config: this.config
    };
  }

  public cleanup(): void {
    this.stopTracking();
    this.callbacks = [];
    
    // Cancel any pending debounced/throttled calls
    if (this.debouncedActivityHandler) {
      (this.debouncedActivityHandler as any).cancel?.();
    }
    if (this.throttledActivityHandler) {
      (this.throttledActivityHandler as any).cancel?.();
    }
    
    console.log('🧹 Activity tracker cleaned up');
  }
}

export default ActivityTracker;