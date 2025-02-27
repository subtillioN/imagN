import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';
import { logError } from '../../utils/errorHandling';

// Mock error logging
jest.mock('../../utils/errorHandling', () => ({
  logError: jest.fn()
}));

describe('ErrorBoundary', () => {
  const originalConsoleError = console.error;
  const originalEnv = process.env.NODE_ENV;

  beforeAll(() => {
    // Suppress console.error for expected errors
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
    process.env.NODE_ENV = originalEnv;
  });

  beforeEach(() => {
    (logError as jest.Mock).mockClear();
    (console.error as jest.Mock).mockClear();
  });

  const ThrowError = ({ message }: { message: string }): never => {
    throw new Error(message);
  };

  it('should render children when there is no error', () => {
    const { container } = render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(container.querySelector('.error-boundary')).not.toBeInTheDocument();
  });

  it('should render error UI when an error occurs', () => {
    const errorMessage = 'Test Error';
    
    render(
      <ErrorBoundary name="TestComponent">
        <ThrowError message={errorMessage} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('error-boundary');
    expect(screen.getByRole('button')).toHaveTextContent('Try Again');
  });

  it('should show error details in development mode', () => {
    process.env.NODE_ENV = 'development';
    const errorMessage = 'Test Error';
    
    render(
      <ErrorBoundary>
        <ThrowError message={errorMessage} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error Details')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(errorMessage))).toBeInTheDocument();
  });

  it('should not show error details in production mode', () => {
    process.env.NODE_ENV = 'production';
    const errorMessage = 'Test Error';
    
    render(
      <ErrorBoundary>
        <ThrowError message={errorMessage} />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Error Details')).not.toBeInTheDocument();
  });

  it('should log errors with component information', () => {
    const errorMessage = 'Test Error';
    const componentName = 'TestComponent';
    
    render(
      <ErrorBoundary name={componentName}>
        <ThrowError message={errorMessage} />
      </ErrorBoundary>
    );

    expect(logError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        component: componentName,
        componentStack: expect.any(String)
      })
    );
  });

  it('should reset error state when clicking try again', () => {
    const TestComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error('Test Error');
      }
      return <div>Test Content</div>;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <TestComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Click try again and update the prop to prevent error
    fireEvent.click(screen.getByText('Try Again'));
    rerender(
      <ErrorBoundary>
        <TestComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });
}); 