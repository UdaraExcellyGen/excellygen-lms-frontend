// src/utils/learnerDashboardEvents.ts
// ENTERPRISE-GRADE: A simple, dependency-free event bus for the Learner Dashboard.
// This uses the browser's native CustomEvent API for maximum performance and simplicity.

export type LearnerDashboardEvent = 'active-courses-updated' | 'recent-activities-updated' | 'stats-updated';

const EVENT_NAME = 'learnerDashboardRefresh';

/**
 * Dispatches an event to notify the dashboard that it needs to refresh a specific part of its data.
 * @param reason - The specific part of the dashboard that needs to be refreshed.
 */
export const emitLearnerDashboardRefreshNeeded = (reason: LearnerDashboardEvent): void => {
  const event = new CustomEvent(EVENT_NAME, { detail: reason });
  window.dispatchEvent(event);
};

/**
 * Adds a listener that will fire when a dashboard refresh event is emitted.
 * @param callback - The function to execute when the event is received.
 * @returns A cleanup function to remove the event listener.
 */
export const addLearnerDashboardRefreshListener = (callback: (event: CustomEvent<LearnerDashboardEvent>) => void): (() => void) => {
  const listener = (event: Event) => {
    // Type assertion to ensure the callback gets the correct type
    callback(event as CustomEvent<LearnerDashboardEvent>);
  };
  
  window.addEventListener(EVENT_NAME, listener);
  
  // Return a cleanup function to prevent memory leaks
  return () => {
    window.removeEventListener(EVENT_NAME, listener);
  };
};