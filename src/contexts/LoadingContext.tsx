// src/contexts/LoadingContext.tsx
// ENTERPRISE: Selective loading context like Google/Microsoft
import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: (operation?: string) => void;
  stopLoading: (operation?: string) => void;
  setLoading: (loading: boolean) => void;
  getLoadingCount: () => number;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const operationsRef = useRef<Set<string>>(new Set());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ENTERPRISE: Only these critical operations trigger global loading
  const criticalOperations = new Set([
    'auth:login',
    'auth:logout', 
    'auth:refresh',
    'app:init',
    'role:switch',
    'session:restore'
  ]);

  // ENTERPRISE: Debounced loading state management
  const updateLoadingState = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // ENTERPRISE: Small delay to prevent flash loading
    timeoutRef.current = setTimeout(() => {
      const shouldBeLoading = operationsRef.current.size > 0;
      if (shouldBeLoading !== isLoading) {
        setIsLoading(shouldBeLoading);
      }
    }, 100); // Tiny delay to smooth out rapid changes
  }, [isLoading]);

  const startLoading = useCallback((operation = 'default') => {
    // ENTERPRISE: Only track critical operations for global loading
    if (criticalOperations.has(operation)) {
      operationsRef.current.add(operation);
      updateLoadingState();
      
      console.log(`🔄 Started critical operation: ${operation}`);
    } else {
      // Non-critical operations don't trigger global loading
      console.log(`⚡ Quick operation (no global loading): ${operation}`);
    }
  }, [updateLoadingState]);

  const stopLoading = useCallback((operation = 'default') => {
    operationsRef.current.delete(operation);
    updateLoadingState();
    
    if (criticalOperations.has(operation)) {
      console.log(`✅ Completed critical operation: ${operation}`);
    }
  }, [updateLoadingState]);

  const setLoading = useCallback((loading: boolean) => {
    if (loading) {
      operationsRef.current.add('manual');
    } else {
      operationsRef.current.clear();
    }
    updateLoadingState();
  }, [updateLoadingState]);

  const getLoadingCount = useCallback(() => {
    return operationsRef.current.size;
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const value: LoadingContextType = {
    isLoading,
    startLoading,
    stopLoading,
    setLoading,
    getLoadingCount
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// ENTERPRISE: Hook for local component loading (like Google Drive cards)
export const useLocalLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);
  
  return { isLoading, startLoading, stopLoading };
};

// ENTERPRISE: Hook for button loading states (like Microsoft)
export const useButtonLoading = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  
  const setButtonLoading = useCallback((buttonId: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [buttonId]: loading
    }));
  }, []);
  
  const isButtonLoading = useCallback((buttonId: string) => {
    return loadingStates[buttonId] || false;
  }, [loadingStates]);
  
  return { setButtonLoading, isButtonLoading };
};