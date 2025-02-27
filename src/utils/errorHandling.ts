interface ErrorContext {
  componentStack?: string;
  component?: string;
  [key: string]: unknown;
}

/**
 * Log an error with additional context information
 */
export const logError = (error: Error, context: ErrorContext = {}): void => {
  // In development, log to console for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
    console.error('Context:', context);
    return;
  }

  // In production, you might want to send this to an error tracking service
  // This is a placeholder for actual error reporting logic
  try {
    const errorReport = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...context
    };

    // TODO: Send to error tracking service
    // For now, just log to console in a structured way
    console.error(JSON.stringify(errorReport, null, 2));
  } catch (e) {
    // Fallback if error serialization fails
    console.error('Failed to log error:', error);
    console.error('Context:', context);
  }
}; 