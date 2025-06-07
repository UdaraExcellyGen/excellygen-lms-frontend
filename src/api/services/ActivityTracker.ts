// src/services/ActivityTracker.ts
import { debounce } from 'lodash';

type ActivityCallback = () => void;

class ActivityTracker {
  private static instance: ActivityTracker;
  private callbacks: ActivityCallback[] = [];
  private lastActivity: number = Date.now();
  private events: string[] = [
    'mousedown', 'mousemove', 'keypress', 
    'scroll', 'touchstart', 'click', 'keydown'
  ];
  private idleThreshold: number = 5 * 60 * 1000; // 5 minutes in milliseconds
  private idleCheckInterval: number | null = null;
  
  private constructor() {
    // Register the activity listeners
    this.registerActivityListeners();
    
    // Log initialization
    console.log('Activity tracker initialized');
  }

  public static getInstance(): ActivityTracker {
    if (!ActivityTracker.instance) {
      ActivityTracker.instance = new ActivityTracker();
    }
    return ActivityTracker.instance;
  }

  private registerActivityListeners(): void {
    // Create a debounced activity handler to avoid excessive calls
    const debouncedActivityHandler = debounce(this.handleUserActivity.bind(this), 300);
    
    // Register event listeners for user activity
    this.events.forEach(event => {
      window.addEventListener(event, debouncedActivityHandler);
    });
    
    // Start the idle check interval
    this.startIdleCheck();
  }

  private handleUserActivity(): void {
    // Update the last activity timestamp
    this.lastActivity = Date.now();
    
    // Notify all registered callbacks
    this.callbacks.forEach(callback => callback());
  }

  public onActivity(callback: ActivityCallback): () => void {
    // Add the callback to the list
    this.callbacks.push(callback);
    
    // Return a function to remove the callback
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  public getLastActivityTime(): number {
    return this.lastActivity;
  }

  public isActive(): boolean {
    return (Date.now() - this.lastActivity) < this.idleThreshold;
  }

  public getIdleTime(): number {
    return Date.now() - this.lastActivity;
  }

  private startIdleCheck(): void {
    // Check for idle status every minute
    this.idleCheckInterval = window.setInterval(() => {
      // If we've exceeded the idle threshold, we're idle
      // But we don't need to do anything specific here since 
      // isActive() will return false when checked
    }, 60000); // 1 minute
  }

  public cleanup(): void {
    // Remove event listeners and clear interval when needed
    if (this.idleCheckInterval) {
      clearInterval(this.idleCheckInterval);
    }
    
    const debouncedActivityHandler = debounce(this.handleUserActivity.bind(this), 300);
    this.events.forEach(event => {
      window.removeEventListener(event, debouncedActivityHandler);
    });
  }
}

export default ActivityTracker;