import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Copy, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      copied: false
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false
    });
  };

  private copyErrorDetails = async () => {
    const { error, errorInfo } = this.state;
    const errorDetails = `
Error: ${error?.message || 'Unknown error'}
Stack: ${error?.stack || 'No stack trace'}
Component Stack: ${errorInfo?.componentStack || 'No component stack'}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorDetails);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <div className="card shadow-lg border-0" style={{ maxWidth: '600px', width: '100%' }}>
            <div className="card-header bg-danger text-white text-center">
              <AlertTriangle className="mb-2" size={48} />
              <h4 className="mb-0">Something went wrong</h4>
            </div>
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <p className="text-muted mb-3">
                  We're sorry, but an unexpected error occurred. This has been logged and our team will investigate.
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button 
                    className="btn btn-primary"
                    onClick={this.handleRetry}
                  >
                    <RefreshCw size={16} className="me-2" />
                    Try Again
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={this.handleRefresh}
                  >
                    Refresh Page
                  </button>
                </div>
              </div>

              {this.props.showDetails && this.state.error && (
                <div className="border-top pt-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="text-muted mb-0">Error Details</h6>
                    <button 
                      className={`btn btn-sm ${this.state.copied ? 'btn-success' : 'btn-outline-secondary'}`}
                      onClick={this.copyErrorDetails}
                    >
                      <Copy size={14} className="me-1" />
                      {this.state.copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="bg-light p-3 rounded">
                    <pre className="small text-muted mb-0" style={{ fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
                      {this.state.error.message}
                      {this.state.error.stack && (
                        <div className="mt-2 pt-2 border-top">
                          {this.state.error.stack}
                        </div>
                      )}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;