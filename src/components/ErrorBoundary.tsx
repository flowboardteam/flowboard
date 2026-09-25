import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-red-200 max-w-xl w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Application Error
            </h1>
            <p className="text-gray-700 mb-4 font-medium">
              An error occurred while loading the application:
            </p>
            <div className="bg-slate-900 text-red-300 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-6">
              {this.state.error?.toString() || "Unknown Error"}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
