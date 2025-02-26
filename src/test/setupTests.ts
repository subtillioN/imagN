import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure testing-library
configure({
  testIdAttribute: 'data-testid',
});

// Add any global test setup here
beforeAll(() => {
  // Setup any global test environment
});

afterAll(() => {
  // Cleanup any global test environment
}); 