// Path: src/features/Learner/LearnerNotifications/Components/NotificationErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class NotificationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Notification Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-8 text-center border border-[#BF4BF6]/20">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#1B0A3F] mb-2">
            Something went wrong with notifications
          </h3>
          <p className="text-[#52007C] mb-4">
            There was an error loading your notifications. This is usually temporary.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: undefined });
              window.location.reload();
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#BF4BF6] to-[#D68BF9] hover:from-[#A845E8] hover:to-[#BF4BF6] text-white rounded-lg transition-all duration-200 mx-auto shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reload Page</span>
          </button>
          
          {/* Debug info */}
          {this.state.error && (
            <details className="mt-4 text-left">
              <summary className="text-sm text-[#52007C] cursor-pointer">
                Technical Details (for debugging)
              </summary>
              <pre className="text-xs text-[#52007C] bg-[#F6E6FF]/50 p-2 rounded mt-2 overflow-auto border border-[#BF4BF6]/20">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default NotificationErrorBoundary;