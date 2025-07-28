// src/utils/dashboardEvents.ts
// ENTERPRISE: Event system for real-time dashboard updates

type DashboardEventType = 
  | 'user-status-changed'
  | 'user-created'
  | 'user-deleted'
  | 'category-status-changed'
  | 'category-created'
  | 'category-deleted'
  | 'tech-status-changed'
  | 'tech-created'
  | 'tech-deleted'
  | 'dashboard-refresh-needed';

interface DashboardEvent {
  type: DashboardEventType;
  payload?: any;
  timestamp: number;
}

class DashboardEventManager {
  private static instance: DashboardEventManager;
  private listeners: Map<DashboardEventType, Set<(event: DashboardEvent) => void>> = new Map();
  private eventHistory: DashboardEvent[] = [];
  private maxHistorySize = 50;

  private constructor() {
    console.log('🎯 Dashboard Event Manager initialized');
  }

  public static getInstance(): DashboardEventManager {
    if (!DashboardEventManager.instance) {
      DashboardEventManager.instance = new DashboardEventManager();
    }
    return DashboardEventManager.instance;
  }

  // ENTERPRISE: Subscribe to dashboard events
  public subscribe(eventType: DashboardEventType, callback: (event: DashboardEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(callback);
    
    console.log(`📡 Subscribed to ${eventType} events`);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(callback);
      console.log(`📡 Unsubscribed from ${eventType} events`);
    };
  }

  // ENTERPRISE: Emit dashboard events
  public emit(eventType: DashboardEventType, payload?: any): void {
    const event: DashboardEvent = {
      type: eventType,
      payload,
      timestamp: Date.now()
    };

    // Add to history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Notify listeners
    const listeners = this.listeners.get(eventType);
    if (listeners && listeners.size > 0) {
      console.log(`🚀 Emitting ${eventType} event to ${listeners.size} listeners`, payload);
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in dashboard event listener for ${eventType}:`, error);
        }
      });
    } else {
      console.log(`📭 No listeners for ${eventType} event`);
    }
  }

  // ENTERPRISE: Subscribe to multiple event types
  public subscribeToMultiple(
    eventTypes: DashboardEventType[], 
    callback: (event: DashboardEvent) => void
  ): () => void {
    const unsubscribeFunctions = eventTypes.map(eventType => 
      this.subscribe(eventType, callback)
    );

    // Return function that unsubscribes from all
    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }

  // ENTERPRISE: Get recent events for debugging
  public getRecentEvents(eventType?: DashboardEventType): DashboardEvent[] {
    if (eventType) {
      return this.eventHistory.filter(event => event.type === eventType);
    }
    return [...this.eventHistory];
  }

  // ENTERPRISE: Clear all listeners (useful for cleanup)
  public clearAllListeners(): void {
    this.listeners.clear();
    console.log('🧹 All dashboard event listeners cleared');
  }
}

// ENTERPRISE: Singleton instance
export const dashboardEvents = DashboardEventManager.getInstance();

// ENTERPRISE: Convenience functions for common events
export const emitUserStatusChanged = (userId: string, newStatus: string) => {
  dashboardEvents.emit('user-status-changed', { userId, newStatus });
};

export const emitUserCreated = (user: any) => {
  dashboardEvents.emit('user-created', { user });
};

export const emitUserDeleted = (userId: string) => {
  dashboardEvents.emit('user-deleted', { userId });
};

export const emitCategoryStatusChanged = (categoryId: string, newStatus: string) => {
  dashboardEvents.emit('category-status-changed', { categoryId, newStatus });
};

export const emitCategoryCreated = (category: any) => {
  dashboardEvents.emit('category-created', { category });
};

export const emitCategoryDeleted = (categoryId: string) => {
  dashboardEvents.emit('category-deleted', { categoryId });
};

export const emitTechStatusChanged = (techId: string, newStatus: string) => {
  dashboardEvents.emit('tech-status-changed', { techId, newStatus });
};

export const emitTechCreated = (tech: any) => {
  dashboardEvents.emit('tech-created', { tech });
};

export const emitTechDeleted = (techId: string) => {
  dashboardEvents.emit('tech-deleted', { techId });
};

export const emitDashboardRefreshNeeded = (reason?: string) => {
  dashboardEvents.emit('dashboard-refresh-needed', { reason });
};