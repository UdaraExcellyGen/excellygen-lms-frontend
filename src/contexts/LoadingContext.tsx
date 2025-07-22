// src/contexts/LoadingContext.tsx
import React, { createContext, useContext, useState, ReactNode, useRef, useCallback } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  setLoadingWithTimeout: (timeoutMs?: number) => void;
  // OPTIMIZATION: New methods for better control
  isBackgroundLoading: boolean;
  startBackgroundLoading: () => void;
  stopBackgroundLoading: () => void;
  getLoadingStatus: () => LoadingStatus;
  forceStopLoading: () => void;
}

interface LoadingStatus {
  isGlobalLoading: boolean;
  isBackgroundLoading: boolean;
  activeRequests: number;
  loadingStartTime: number | null;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(false);
  
  // OPTIMIZATION: Track loading state with refs for better performance
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeRequestsRef = useRef<number>(0);
  const loadingStartTimeRef = useRef<number | null>(null);

  // OPTIMIZATION: Debounced loading control
  const startLoading = useCallback(() => {
    // Clear any pending stop timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    if (!isLoading) {
      setIsLoading(true);
      loadingStartTimeRef.current = Date.now();
      activeRequestsRef.current++;
      
      if (import.meta.env.DEV) {
        console.log('🔄 Global loading started');
      }
    } else {
      activeRequestsRef.current++;
    }
  }, [isLoading]);

  const stopLoading = useCallback(() => {
    activeRequestsRef.current = Math.max(0, activeRequestsRef.current - 1);
    
    // Only stop loading when no active requests remain
    if (activeRequestsRef.current === 0) {
      // OPTIMIZATION: Debounce stop loading to prevent flickering
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        loadingStartTimeRef.current = null;
        
        if (import.meta.env.DEV) {
          console.log('✅ Global loading stopped');
        }
      }, 100); // Small delay to prevent flickering
    }
  }, []);

  // OPTIMIZATION: Background loading for non-critical requests
  const startBackgroundLoading = useCallback(() => {
    if (backgroundTimeoutRef.current) {
      clearTimeout(backgroundTimeoutRef.current);
      backgroundTimeoutRef.current = null;
    }

    if (!isBackgroundLoading) {
      setIsBackgroundLoading(true);
      
      if (import.meta.env.DEV) {
        console.log('🌐 Background loading started');
      }
    }
  }, [isBackgroundLoading]);

  const stopBackgroundLoading = useCallback(() => {
    backgroundTimeoutRef.current = setTimeout(() => {
      setIsBackgroundLoading(false);
      
      if (import.meta.env.DEV) {
        console.log('🌐 Background loading stopped');
      }
    }, 50); // Faster timeout for background requests
  }, []);

  // Function to show loader for a specific time duration
  const setLoadingWithTimeout = useCallback((timeoutMs = 1000) => {
    startLoading();
    setTimeout(() => {
      stopLoading();
    }, timeoutMs);
  }, [startLoading, stopLoading]);

  // OPTIMIZATION: Get comprehensive loading status
  const getLoadingStatus = useCallback((): LoadingStatus => {
    return {
      isGlobalLoading: isLoading,
      isBackgroundLoading,
      activeRequests: activeRequestsRef.current,
      loadingStartTime: loadingStartTimeRef.current
    };
  }, [isLoading, isBackgroundLoading]);

  // OPTIMIZATION: Force stop all loading (emergency use)
  const forceStopLoading = useCallback(() => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    
    if (backgroundTimeoutRef.current) {
      clearTimeout(backgroundTimeoutRef.current);
      backgroundTimeoutRef.current = null;
    }

    setIsLoading(false);
    setIsBackgroundLoading(false);
    activeRequestsRef.current = 0;
    loadingStartTimeRef.current = null;
    
    console.log('🚨 All loading states force stopped');
  }, []);

  // OPTIMIZATION: Cleanup on unmount and emergency reset
  React.useEffect(() => {
    const handleEmergencyReset = () => {
      console.log('🚨 Emergency loading reset received');
      forceStopLoading();
    };
    
    window.addEventListener('force-reset-loading', handleEmergencyReset);
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (backgroundTimeoutRef.current) {
        clearTimeout(backgroundTimeoutRef.current);
      }
      window.removeEventListener('force-reset-loading', handleEmergencyReset);
    };
  }, [forceStopLoading]);

  // OPTIMIZATION: Warn about long-running loading states in development
  React.useEffect(() => {
    if (import.meta.env.DEV && isLoading) {
      const warningTimeout = setTimeout(() => {
        console.warn('⚠️ Loading state has been active for more than 10 seconds. Check for stuck requests.');
        console.warn('Active requests count:', activeRequestsRef.current);
        console.warn('Loading start time:', loadingStartTimeRef.current);
        console.warn('Current time:', Date.now());
        
        // OPTIMIZATION: Auto-force-stop loading after 12 seconds (reduced from 15) to prevent infinite loading
        const forceStopTimeout = setTimeout(() => {
          console.error('🚨 Force stopping loading after 12 seconds - definitely a stuck request');
          console.error('This usually indicates a request/response counting mismatch');
          forceStopLoading();
        }, 2000); // 2 seconds after warning (total 12 seconds)
        
        return () => clearTimeout(forceStopTimeout);
      }, 10000);

      return () => clearTimeout(warningTimeout);
    }
  }, [isLoading, forceStopLoading]);

  const contextValue: LoadingContextType = {
    isLoading,
    startLoading,
    stopLoading,
    setLoadingWithTimeout,
    isBackgroundLoading,
    startBackgroundLoading,
    stopBackgroundLoading,
    getLoadingStatus,
    forceStopLoading
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
};