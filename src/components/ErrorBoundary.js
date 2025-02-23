import React from 'react';
import { logError } from '../utils/errorHandling';

/**
 * Error Boundary component to catch and handle React component errors
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        logError(error, {
            componentStack: errorInfo.componentStack,
            component: this.props.name || 'Unknown'
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <h2>Something went wrong</h2>
                    {process.env.NODE_ENV === 'development' && (
                        <details>
                            <summary>Error Details</summary>
                            <pre>{this.state.error?.toString()}</pre>
                        </details>
                    )}
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="error-boundary__retry"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;