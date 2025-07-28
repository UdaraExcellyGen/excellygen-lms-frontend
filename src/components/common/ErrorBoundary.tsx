// src/components/common/ErrorBoundary.tsx
// ENTERPRISE: Professional error boundary component for graceful error handling
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      retryCount: 0
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error);
    console.error('📍 Error Info:', errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send error to logging service (if available)
    this.logErrorToService(error, errorInfo);
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Log to console with detailed information
      console.group('🚨 Error Boundary Details');
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('Error Stack:', error.stack);
      console.error('User Agent:', navigator.userAgent);
      console.error('URL:', window.location.href);
      console.error('Timestamp:', new Date().toISOString());
      console.groupEnd();

      // You can add external logging service here
      // Example: Sentry, LogRocket, etc.
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount < maxRetries) {
      console.log(`🔄 Retrying... Attempt ${retryCount + 1}/${maxRetries}`);
      
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1
      }));

      // Small delay before retry to prevent immediate re-error
      this.retryTimeoutId = setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    const { hasError, error, errorInfo, retryCount } = this.state;
    const { children, fallback, maxRetries = 3 } = this.props;

    if (hasError) {
      // If custom fallback provided, use it
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#52007C] to-[#34137C] flex items-center justify-center p-6">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 max-w-2xl mx-auto shadow-2xl border border-red-200">
            {/* Error Icon */}
            <div className="text-center mb-6">
              <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600">
                We're sorry for the inconvenience. Please try refreshing the page or contact support if the issue persists.
              </p>
            </div>

            {/* Error Details (for development) */}
            {process.env.NODE_ENV === 'development' && error && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Error Details:</h3>
                <pre className="text-sm text-red-600 overflow-x-auto whitespace-pre-wrap">
                  {error.message}
                </pre>
                {errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700">
                      Component Stack
                    </summary>
                    <pre className="text-xs text-gray-600 mt-2 overflow-x-auto">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {retryCount < maxRetries && (
                <button
                  onClick={this.handleRetry}
                  className="flex-1 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again ({maxRetries - retryCount} attempts left)
                </button>
              )}
              
              <button
                onClick={this.handleReload}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex-1 bg-white border-2 border-[#BF4BF6] text-[#BF4BF6] hover:bg-[#BF4BF6] hover:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Error ID: {Date.now().toString(36).toUpperCase()}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Please include this ID when contacting support
              </p>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;