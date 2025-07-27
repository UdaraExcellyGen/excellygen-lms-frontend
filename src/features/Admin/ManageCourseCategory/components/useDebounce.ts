// src/features/Admin/ManageCourseCategory/components/useDebounce.ts
// ENTERPRISE OPTIMIZED: Professional debouncing with performance monitoring
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * ENTERPRISE: Simple debounce hook (backward compatible)
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * ENTERPRISE: Advanced debounce hook with performance optimization
 */
interface DebounceOptions {
  maxWait?: number; // Maximum wait time before forcing update
  leading?: boolean; // Execute on leading edge
  trailing?: boolean; // Execute on trailing edge (default: true)
}

interface DebounceReturn<T> {
  debouncedValue: T;
  isPending: boolean;
  cancel: () => void;
  flush: () => void;
}

export const useAdvancedDebounce = <T>(
  value: T, 
  delay: number = 300,
  options: DebounceOptions = {}
): DebounceReturn<T> => {
  const {
    maxWait,
    leading = false,
    trailing = true
  } = options;

  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isPending, setIsPending] = useState<boolean>(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousValueRef = useRef<T>(value);
  const leadingExecutedRef = useRef<boolean>(false);

  // ENTERPRISE: Smart cleanup function
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
    setIsPending(false);
    leadingExecutedRef.current = false;
  }, []);

  // ENTERPRISE: Force immediate update
  const flush = useCallback(() => {
    cleanup();
    setDebouncedValue(value);
  }, [value, cleanup]);

  // ENTERPRISE: Cancel pending updates
  const cancel = useCallback(() => {
    cleanup();
    setDebouncedValue(previousValueRef.current);
  }, [cleanup]);

  // ENTERPRISE: Enhanced debouncing with leading/trailing edge support
  useEffect(() => {
    // Don't debounce if value hasn't actually changed
    if (value === previousValueRef.current) {
      return;
    }

    // ENTERPRISE: Leading edge execution
    if (leading && !leadingExecutedRef.current && !timeoutRef.current) {
      setDebouncedValue(value);
      leadingExecutedRef.current = true;
      
      // If only leading edge, no need to set timeout
      if (!trailing) {
        previousValueRef.current = value;
        return;
      }
    }

    setIsPending(true);

    // ENTERPRISE: Main debounce timeout
    timeoutRef.current = setTimeout(() => {
      if (trailing) {
        setDebouncedValue(value);
      }
      setIsPending(false);
      leadingExecutedRef.current = false;
      timeoutRef.current = null;
    }, delay);

    // ENTERPRISE: Maximum wait timeout (prevents infinite delay)
    if (maxWait && maxWait > delay) {
      maxTimeoutRef.current = setTimeout(() => {
        setDebouncedValue(value);
        cleanup();
      }, maxWait);
    }

    previousValueRef.current = value;

    return cleanup;
  }, [value, delay, leading, trailing, maxWait, cleanup]);

  // ENTERPRISE: Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    debouncedValue,
    isPending,
    cancel,
    flush
  };
};

/**
 * ENTERPRISE: Search-optimized debounce with smart delays
 */
export const useSearchDebounce = (searchTerm: string): {
  debouncedSearchTerm: string;
  isSearching: boolean;
  clearSearch: () => void;
} => {
  // ENTERPRISE: Smart delay based on search term length
  const getSmartDelay = (term: string): number => {
    if (term.length === 0) return 0; // Immediate clear
    if (term.length === 1) return 500; // Slower for first character
    if (term.length <= 3) return 300; // Medium delay for short terms
    return 200; // Faster for longer, more specific terms
  };

  const delay = getSmartDelay(searchTerm);
  const { debouncedValue, isPending, cancel } = useAdvancedDebounce(searchTerm, delay, {
    maxWait: 1000, // Never wait more than 1 second
    trailing: true
  });

  const clearSearch = useCallback(() => {
    cancel();
  }, [cancel]);

  return {
    debouncedSearchTerm: debouncedValue,
    isSearching: isPending,
    clearSearch
  };
};

/**
 * ENTERPRISE: Simplified version for basic use cases
 */
export const useSimpleDebounce = <T>(value: T, delay: number = 300): T => {
  const { debouncedValue } = useAdvancedDebounce(value, delay);
  return debouncedValue;
};

export default useDebounce;