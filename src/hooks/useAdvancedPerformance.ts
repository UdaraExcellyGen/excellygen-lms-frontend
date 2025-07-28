// src/hooks/useAdvancedPerformance.ts
// React 18/19 Advanced Performance Features

import { useState, useTransition, useDeferredValue, startTransition, use, useOptimistic, useCallback, useMemo } from 'react';

// OPTIMIZATION: Custom hook for smart transitions
export const useSmartTransition = () => {
  const [isPending, startTransition] = useTransition();
  
  const executeTransition = useCallback((fn: () => void) => {
    startTransition(() => {
      fn();
    });
  }, [startTransition]);
  
  return { isPending, executeTransition };
};

// OPTIMIZATION: Custom hook for deferred search with concurrent features
export const useDeferredSearch = (initialValue = '') => {
  const [searchInput, setSearchInput] = useState(initialValue);
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const deferredQuery = useDeferredValue(searchQuery);
  const { isPending, executeTransition } = useSmartTransition();
  
  const updateSearch = useCallback((value: string) => {
    // Immediate update for input responsiveness
    setSearchInput(value);
    
    // Deferred update for search results
    executeTransition(() => {
      setSearchQuery(value);
    });
  }, [executeTransition]);
  
  return {
    searchInput,
    searchQuery: deferredQuery,
    updateSearch,
    isPending,
    setSearchInput
  };
};

// OPTIMIZATION: Optimistic updates hook for better UX
export const useOptimisticState = <T>(initialState: T) => {
  const [state, setState] = useState(initialState);
  const [optimisticState, setOptimisticState] = useOptimistic(
    state,
    (currentState, optimisticValue: T) => optimisticValue
  );
  
  const updateOptimistically = useCallback(async (
    optimisticValue: T,
    asyncAction: () => Promise<T>
  ) => {
    // Immediately show optimistic state
    setOptimisticState(optimisticValue);
    
    try {
      // Perform async action
      const result = await asyncAction();
      setState(result);
      return result;
    } catch (error) {
      // Revert to previous state on error
      console.error('Optimistic update failed:', error);
      throw error;
    }
  }, [setOptimisticState]);
  
  return {
    state: optimisticState,
    updateOptimistically,
    setState
  };
};

// OPTIMIZATION: Smart list component with concurrent features
interface SmartListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  searchValue?: string;
  onSearch?: (value: string) => void;
  filterFn?: (item: T, query: string) => boolean;
  className?: string;
}

export function SmartList<T>({
  items,
  renderItem,
  searchValue = '',
  onSearch,
  filterFn,
  className = ''
}: SmartListProps<T>) {
  const { searchInput, searchQuery, updateSearch, isPending } = useDeferredSearch(searchValue);
  
  // Memoized filtered items with concurrent rendering
  const filteredItems = useMemo(() => {
    if (!searchQuery || !filterFn) return items;
    return items.filter(item => filterFn(item, searchQuery));
  }, [items, searchQuery, filterFn]);
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateSearch(value);
    onSearch?.(value);
  }, [updateSearch, onSearch]);
  
  return (
    <div className={className}>
      {onSearch && (
        <div className="mb-4">
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search..."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isPending && (
            <div className="mt-2 text-sm text-gray-500 flex items-center">
              <div className="w-4 h-4 mr-2 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              Filtering...
            </div>
          )}
        </div>
      )}
      
      <div className="space-y-2">
        {filteredItems.map((item, index) => (
          <div key={index} className="transition-opacity duration-150">
            {renderItem(item, index)}
          </div>
        ))}
      </div>
      
      {filteredItems.length === 0 && searchQuery && (
        <div className="text-gray-500 text-center py-8">
          No items found for "{searchQuery}"
        </div>
      )}
    </div>
  );
}

// OPTIMIZATION: Async data fetching with concurrent features
export const useAsyncData = <T>(
  fetchFn: () => Promise<T>,
  dependencies: React.DependencyList = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { isPending, executeTransition } = useSmartTransition();
  
  const fetchData = useCallback(async () => {
    executeTransition(async () => {
      try {
        setError(null);
        const result = await fetchFn();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    });
  }, [fetchFn, executeTransition]);
  
  React.useEffect(() => {
    fetchData();
  }, dependencies);
  
  return {
    data,
    error,
    isLoading: isPending,
    refetch: fetchData
  };
};

// OPTIMIZATION: Form with concurrent features and optimistic updates
interface SmartFormProps {
  onSubmit: (data: Record<string, any>) => Promise<void>;
  initialData?: Record<string, any>;
  children: React.ReactNode;
}

export const SmartForm: React.FC<SmartFormProps> = ({
  onSubmit,
  initialData = {},
  children
}) => {
  const [formData, setFormData] = useState(initialData);
  const { state: submissionState, updateOptimistically } = useOptimisticState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateOptimistically(
      'submitting',
      async () => {
        await onSubmit(formData);
        return 'success';
      }
    ).catch(() => 'error');
  }, [formData, onSubmit, updateOptimistically]);
  
  const updateField = useCallback((name: string, value: any) => {
    startTransition(() => {
      setFormData(prev => ({ ...prev, [name]: value }));
    });
  }, []);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-context" data-form-state={submissionState}>
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              formData,
              updateField,
              submissionState
            } as any);
          }
          return child;
        })}
      </div>
      
      <button
        type="submit"
        disabled={submissionState === 'submitting'}
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          submissionState === 'submitting'
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {submissionState === 'submitting' ? (
          <div className="flex items-center">
            <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Submitting...
          </div>
        ) : (
          'Submit'
        )}
      </button>
      
      {submissionState === 'success' && (
        <div className="text-green-600 text-sm">✅ Submitted successfully!</div>
      )}
      
      {submissionState === 'error' && (
        <div className="text-red-600 text-sm">❌ Submission failed. Please try again.</div>
      )}
    </form>
  );
};

// OPTIMIZATION: Performance monitoring component
export const PerformanceMonitor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      // Monitor performance in development
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'measure' && entry.name.includes('React')) {
            console.log('React measure:', entry.name, entry.duration);
          }
        });
      });
      
      observer.observe({ entryTypes: ['measure'] });
      
      return () => observer.disconnect();
    }
  }, []);
  
  return <>{children}</>;
};

// OPTIMIZATION: Route transition wrapper with concurrent features
interface RouteWrapperProps {
  children: React.ReactNode;
  routeKey: string;
}

export const RouteWrapper: React.FC<RouteWrapperProps> = ({ children, routeKey }) => {
  const [currentRoute, setCurrentRoute] = useState(routeKey);
  const deferredRoute = useDeferredValue(currentRoute);
  
  React.useEffect(() => {
    startTransition(() => {
      setCurrentRoute(routeKey);
    });
  }, [routeKey]);
  
  // Show previous route while new route is loading
  const isRouteTransitioning = currentRoute !== deferredRoute;
  
  return (
    <div className="route-wrapper">
      {isRouteTransitioning && (
        <div className="fixed top-0 left-0 w-full h-1 bg-blue-500 animate-pulse z-50" />
      )}
      <div className={`transition-opacity duration-200 ${isRouteTransitioning ? 'opacity-75' : 'opacity-100'}`}>
        {children}
      </div>
    </div>
  );
};

// Example usage in a component
export const ExampleUsage: React.FC = () => {
  const { data: courses, isLoading } = useAsyncData(
    () => fetch('/api/courses').then(res => res.json()),
    []
  );
  
  return (
    <PerformanceMonitor>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Courses</h1>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <SmartList
            items={courses || []}
            renderItem={(course) => (
              <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-semibold">{course.title}</h3>
                <p className="text-gray-600">{course.description}</p>
              </div>
            )}
            filterFn={(course, query) => 
              course.title.toLowerCase().includes(query.toLowerCase()) ||
              course.description.toLowerCase().includes(query.toLowerCase())
            }
            onSearch={() => {}} // Handle search if needed
            className="space-y-4"
          />
        )}
      </div>
    </PerformanceMonitor>
  );
};