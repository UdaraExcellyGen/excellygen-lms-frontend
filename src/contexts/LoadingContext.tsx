import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  setLoadingWithTimeout: (timeoutMs?: number) => void;
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
  
  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  // Function to show loader for a specific time duration
  const setLoadingWithTimeout = (timeoutMs = 1000) => {
    startLoading();
    setTimeout(() => {
      stopLoading();
    }, timeoutMs);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading, setLoadingWithTimeout }}>
      {children}
    </LoadingContext.Provider>
  );
};