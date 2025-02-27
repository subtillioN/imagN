import React from 'react';
import { logError } from '../utils/errorHandling';
import { Option, Some, None, isSome } from '../utils/option';

interface ErrorBoundaryProps {
  name?: string;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Option<Error>;
}

/**
 * Error Boundary component to catch and handle React component errors.
 * Note: Must be a class component as React doesn't support functional error boundaries.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: None };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error: Some(error) };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logError(error, {
      componentStack: errorInfo.componentStack,
      component: this.props.name || 'Unknown'
    });
  }

  private handleReset = (): void => {
    this.setState({ error: None });
  };

  render(): React.ReactNode {
    const { error } = this.state;
    const { children } = this.props;

    if (isSome(error)) {
      return (
        <div className="error-boundary" role="alert">
          <h2>Something went wrong</h2>
          {process.env.NODE_ENV === 'development' && (
            <details>
              <summary>Error Details</summary>
              <pre>{error.value.toString()}</pre>
            </details>
          )}
          <button
            onClick={this.handleReset}
            className="error-boundary__retry"
            type="button"
          >
            Try Again
          </button>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary; 