// Error handling utilities for ImagN application

/**
 * Custom error class for application-specific errors
 */
class ImagNError extends Error {
    constructor(message, code, details = {}) {
        super(message);
        this.name = 'ImagNError';
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}

/**
 * Error codes for different types of errors
 */
export const ErrorCodes = {
    STREAM_ERROR: 'STREAM_ERROR',
    API_ERROR: 'API_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    RUNTIME_ERROR: 'RUNTIME_ERROR'
};

/**
 * Creates a safe stream that handles errors
 * @param {Stream} stream$ - The input stream
 * @param {Function} errorHandler - Custom error handler function
 * @returns {Stream} - Error-handled stream
 */
export const createSafeStream = (stream$, errorHandler) => {
    return stream$.catch(error => {
        const imagNError = error instanceof ImagNError ? error :
            new ImagNError(error.message, ErrorCodes.STREAM_ERROR, { originalError: error });
        
        console.error('[Stream Error]', imagNError);
        if (errorHandler) {
            errorHandler(imagNError);
        }
        
        // Return a safe value or rethrow based on severity
        return stream$.empty();
    });
};

/**
 * Global error logger
 * @param {Error} error - Error object
 * @param {Object} context - Additional context information
 */
export const logError = (error, context = {}) => {
    const errorLog = {
        timestamp: new Date().toISOString(),
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code
        },
        context
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.error('[ImagN Error]', errorLog);
    }

    // TODO: Add production error reporting service integration
};

/**
 * Retry mechanism for async operations
 * @param {Function} operation - Async operation to retry
 * @param {Object} options - Retry options
 */
export const withRetry = async (operation, options = {}) => {
    const {
        maxAttempts = 3,
        delay = 1000,
        backoff = 2
    } = options;

    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            if (attempt === maxAttempts) break;
            
            await new Promise(resolve => 
                setTimeout(resolve, delay * Math.pow(backoff, attempt - 1)));
        }
    }

    throw new ImagNError(
        `Operation failed after ${maxAttempts} attempts`,
        ErrorCodes.RUNTIME_ERROR,
        { originalError: lastError }
    );
};

export { ImagNError };