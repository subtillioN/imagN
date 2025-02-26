interface BenchmarkResult {
  operationName: string;
  duration: number;
  memoryUsage: number;
  operationsPerSecond: number;
  timestamp: number;
}

interface BenchmarkOptions {
  iterations?: number;
  warmupIterations?: number;
  description?: string;
  tags?: string[];
}

class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];
  private readonly defaultOptions: BenchmarkOptions = {
    iterations: 1000,
    warmupIterations: 100,
    tags: []
  };

  async benchmark<T>(
    operation: () => T | Promise<T>,
    operationName: string,
    options: BenchmarkOptions = {}
  ): Promise<BenchmarkResult> {
    const opts = { ...this.defaultOptions, ...options };
    
    // Warmup phase
    for (let i = 0; i < opts.warmupIterations!; i++) {
      await operation();
    }

    // Clear memory
    if (global.gc) {
      global.gc();
    }

    const startMemory = process.memoryUsage().heapUsed;
    const startTime = performance.now();

    // Benchmark phase
    for (let i = 0; i < opts.iterations!; i++) {
      await operation();
    }

    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    const result: BenchmarkResult = {
      operationName,
      duration: endTime - startTime,
      memoryUsage: endMemory - startMemory,
      operationsPerSecond: (opts.iterations! / (endTime - startTime)) * 1000,
      timestamp: Date.now()
    };

    this.results.push(result);
    return result;
  }

  async compareBenchmarks(
    operations: Array<{
      operation: () => any | Promise<any>,
      name: string,
      options?: BenchmarkOptions
    }>
  ): Promise<BenchmarkResult[]> {
    const results = await Promise.all(
      operations.map(({ operation, name, options }) =>
        this.benchmark(operation, name, options)
      )
    );

    return results.sort((a, b) => a.duration - b.duration);
  }

  getResults(filter?: {
    operationName?: string,
    tags?: string[],
    timeRange?: { start: number; end: number }
  }): BenchmarkResult[] {
    let filtered = [...this.results];

    if (filter) {
      if (filter.operationName) {
        filtered = filtered.filter(r => r.operationName === filter.operationName);
      }
      if (filter.tags) {
        filtered = filtered.filter(r => 
          filter.tags!.some(tag => (r as any).tags?.includes(tag))
        );
      }
      if (filter.timeRange) {
        filtered = filtered.filter(r =>
          r.timestamp >= filter.timeRange!.start &&
          r.timestamp <= filter.timeRange!.end
        );
      }
    }

    return filtered;
  }

  generateReport(results: BenchmarkResult[] = this.results): string {
    let report = '# Performance Benchmark Report\n\n';

    results.forEach(result => {
      report += `## ${result.operationName}\n`;
      report += `- Duration: ${result.duration.toFixed(2)}ms\n`;
      report += `- Memory Usage: ${(result.memoryUsage / 1024 / 1024).toFixed(2)}MB\n`;
      report += `- Operations/Second: ${result.operationsPerSecond.toFixed(2)}\n`;
      report += `- Timestamp: ${new Date(result.timestamp).toISOString()}\n\n`;
    });

    return report;
  }

  clearResults(): void {
    this.results = [];
  }
}

// Create a singleton instance
export const performanceBenchmark = new PerformanceBenchmark();

// Example usage:
/*
async function example() {
  const result = await performanceBenchmark.benchmark(
    () => propAnalyzer.analyzeProps(),
    'PropAnalysis',
    { iterations: 1000, tags: ['props', 'analysis'] }
  );

  console.log(performanceBenchmark.generateReport([result]));
}
*/ 