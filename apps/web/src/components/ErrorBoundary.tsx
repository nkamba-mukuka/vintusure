import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      eventId: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log error to external service (e.g., Sentry, LogRocket)
    this.logErrorToService(error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      eventId: this.generateErrorId(),
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && resetOnPropsChange) {
      if (resetKeys) {
        const hasResetKeyChanged = resetKeys.some(
          (resetKey, idx) => prevProps.resetKeys?.[idx] !== resetKey
        );
        if (hasResetKeyChanged) {
          this.resetErrorBoundary();
        }
      }
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        eventId: null,
      });
    }, 0);
  };

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, you would send this to an error tracking service
    // like Sentry, LogRocket, or your own logging service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.error('Error Report:', errorReport);
    
    // Example: Send to external service
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport),
    // });
  };

  private generateErrorId = (): string => {
    return Math.random().toString(36).substr(2, 9);
  };

  private toggleErrorDetails = () => {
    const details = document.getElementById('error-details');
    if (details) {
      details.classList.toggle('hidden');
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI with purple theme
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl border-destructive/20 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="bg-destructive/10 p-3 rounded-full">
                  <AlertTriangle className="h-12 w-12 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-2xl text-destructive">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription className="text-base mt-2">
                We're sorry, but something unexpected happened. Our team has been notified and is working on a fix.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {this.state.eventId && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Error ID:</strong> {this.state.eventId}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please include this ID when reporting the issue.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.resetErrorBoundary}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={this.toggleErrorDetails}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                >
                  <Bug className="h-4 w-4" />
                  Show Details
                </Button>
              </div>

              {/* Error details for developers */}
              <div id="error-details" className="hidden">
                <details className="bg-muted/30 p-4 rounded-lg">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground mb-2">
                    Technical Details (for developers)
                  </summary>
                  <div className="space-y-4 mt-4">
                    {this.state.error && (
                      <div>
                        <h4 className="font-medium text-sm text-destructive mb-2">Error Message:</h4>
                        <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-32">
                          {this.state.error.message}
                        </pre>
                      </div>
                    )}
                    
                    {this.state.error?.stack && (
                      <div>
                        <h4 className="font-medium text-sm text-destructive mb-2">Stack Trace:</h4>
                        <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-48">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <h4 className="font-medium text-sm text-destructive mb-2">Component Stack:</h4>
                        <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-48">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  If this problem persists, please contact our support team at{' '}
                  <a 
                    href="mailto:support@vintusure.com" 
                    className="text-primary hover:underline font-medium"
                  >
                    support@vintusure.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook for triggering errors in development
export function useErrorHandler() {
  return (error: Error) => {
    throw error;
  };
}