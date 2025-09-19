import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Warning, ArrowClockwise, Bug } from '@phosphor-icons/react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorId: string
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

/**
 * Enhanced Error Boundary with multi-company context awareness
 * Provides graceful error handling and recovery for the ERP system
 */
export class EnhancedErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
    
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error details for debugging
    console.error('ERP System Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId
    })

    // In a real application, you would send this to your error reporting service
    this.reportError(error, errorInfo)
  }

  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    try {
      // Simulate error reporting to monitoring service
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        errorId: this.state.errorId
      }

      // In production, this would be sent to services like Sentry, LogRocket, etc.
      console.log('Error Report:', errorReport)
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      const { error, errorId } = this.state
      
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={error!} retry={this.handleRetry} />
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-fit">
                <Warning size={32} className="text-destructive" />
              </div>
              <CardTitle className="text-2xl">Something went wrong</CardTitle>
              <CardDescription>
                We apologize for the inconvenience. The application encountered an unexpected error.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error ID:</strong> {errorId}
                  <br />
                  <strong>Error:</strong> {error?.message || 'Unknown error'}
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button 
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="outline"
                >
                  <ArrowClockwise size={16} className="mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleReload}
                  className="w-full"
                >
                  Reload Page
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && error && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                    Technical Details (Development Mode)
                  </summary>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-words">
                      {error.stack}
                    </pre>
                    {this.state.errorInfo && (
                      <pre className="mt-4 text-xs text-muted-foreground whitespace-pre-wrap break-words">
                        Component Stack:
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  If this problem persists, please contact your system administrator
                  and reference error ID: <code className="bg-muted px-1 rounded">{errorId}</code>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook for programmatic error handling
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((error: Error | string) => {
    const errorObj = error instanceof Error ? error : new Error(error)
    setError(errorObj)
    console.error('Handled Error:', errorObj)
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return {
    handleError,
    clearError,
    error
  }
}

/**
 * Higher-order component for component-level error boundaries
 */
export function withErrorBoundary<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
) {
  const WrappedComponent = (props: T) => {
    return (
      <EnhancedErrorBoundary fallback={fallback}>
        <Component {...props} />
      </EnhancedErrorBoundary>
    )
  }

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

/**
 * Async error handler for Promise rejections
 */
export function handleAsyncError(error: Error | string): void {
  const errorObj = error instanceof Error ? error : new Error(error)
  
  console.error('Async Error:', errorObj)
  
  // In production, report to error monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Report to monitoring service
  }
}

/**
 * Global error handlers setup
 */
export function setupGlobalErrorHandlers(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason)
    handleAsyncError(event.reason)
    event.preventDefault() // Prevent default browser error handling
  })

  // Handle general JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global JavaScript Error:', event.error)
    handleAsyncError(event.error || event.message)
  })

  // Handle resource loading errors
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      console.error('Resource Loading Error:', event.target)
    }
  }, true)
}