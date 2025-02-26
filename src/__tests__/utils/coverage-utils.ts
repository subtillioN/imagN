/**
 * Utility functions for test coverage
 */

/**
 * Tracks which code paths have been executed during tests
 */
export class CoverageTracker {
  private static paths = new Set<string>();

  /**
   * Mark a code path as covered
   */
  static markCovered(path: string): void {
    this.paths.add(path);
  }

  /**
   * Check if a code path has been covered
   */
  static isCovered(path: string): boolean {
    return this.paths.has(path);
  }

  /**
   * Get all covered paths
   */
  static getCoveredPaths(): string[] {
    return Array.from(this.paths);
  }

  /**
   * Reset coverage tracking
   */
  static reset(): void {
    this.paths.clear();
  }
}

/**
 * Decorator to track method coverage
 */
export function trackCoverage(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function(...args: any[]) {
    CoverageTracker.markCovered(`${target.constructor.name}.${propertyKey}`);
    return originalMethod.apply(this, args);
  };

  return descriptor;
}

/**
 * Helper to track async code coverage
 */
export async function trackAsyncCoverage<T>(path: string, fn: () => Promise<T>): Promise<T> {
  CoverageTracker.markCovered(path);
  return await fn();
}

/**
 * Helper to ensure all required paths are covered
 */
export function ensurePathsCovered(requiredPaths: string[]): void {
  const coveredPaths = CoverageTracker.getCoveredPaths();
  const missingPaths = requiredPaths.filter(path => !coveredPaths.includes(path));

  if (missingPaths.length > 0) {
    throw new Error(`Missing coverage for paths: ${missingPaths.join(', ')}`);
  }
} 