import { logError } from '../errorHandling';

describe('errorHandling', () => {
  const originalConsoleError = console.error;
  const originalEnv = process.env.NODE_ENV;

  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
    process.env.NODE_ENV = originalEnv;
  });

  beforeEach(() => {
    (console.error as jest.Mock).mockClear();
  });

  it('should log error and context in development mode', () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('Test error');
    const context = { component: 'TestComponent' };

    logError(error, context);

    expect(console.error).toHaveBeenCalledWith('Error:', error);
    expect(console.error).toHaveBeenCalledWith('Context:', context);
  });

  it('should log structured error report in production mode', () => {
    process.env.NODE_ENV = 'production';
    const error = new Error('Test error');
    const context = { component: 'TestComponent' };

    logError(error, context);

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(JSON.stringify({
        name: error.name,
        message: error.message,
        stack: error.stack,
        component: context.component
      }, null, 2))
    );
  });

  it('should handle errors without context', () => {
    const error = new Error('Test error');

    logError(error);

    expect(console.error).toHaveBeenCalled();
  });

  it('should handle error serialization failures', () => {
    process.env.NODE_ENV = 'production';
    const error = new Error('Test error');
    const context = {
      circular: {} as any
    };
    context.circular.self = context; // Create circular reference

    logError(error, context);

    expect(console.error).toHaveBeenCalledWith('Failed to log error:', error);
    expect(console.error).toHaveBeenCalledWith('Context:', context);
  });
}); 