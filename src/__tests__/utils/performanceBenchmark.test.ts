import { performanceBenchmark } from '../../utils/performanceBenchmark';

describe('PerformanceBenchmark', () => {
  beforeEach(() => {
    performanceBenchmark.clearResults();
  });

  describe('Basic Benchmarking', () => {
    it('should measure operation duration', async () => {
      const result = await performanceBenchmark.benchmark(
        () => new Promise(resolve => setTimeout(resolve, 10)),
        'DelayTest',
        { iterations: 1, warmupIterations: 0 }
      );

      expect(result.duration).toBeGreaterThanOrEqual(10);
      expect(result.operationName).toBe('DelayTest');
      expect(result.operationsPerSecond).toBeLessThan(100);
    });

    it('should track memory usage', async () => {
      const result = await performanceBenchmark.benchmark(
        () => {
          const arr = new Array(1000).fill(0);
          return arr;
        },
        'MemoryTest',
        { iterations: 100, warmupIterations: 0 }
      );

      expect(result.memoryUsage).toBeGreaterThan(0);
    });
  });

  describe('Comparison Benchmarks', () => {
    it('should compare multiple operations', async () => {
      const results = await performanceBenchmark.compareBenchmarks([
        {
          operation: () => new Promise(resolve => setTimeout(resolve, 10)),
          name: 'Slow'
        },
        {
          operation: () => new Promise(resolve => setTimeout(resolve, 5)),
          name: 'Fast'
        }
      ]);

      expect(results).toHaveLength(2);
      expect(results[0].operationName).toBe('Fast');
      expect(results[1].operationName).toBe('Slow');
    });
  });

  describe('Result Management', () => {
    it('should store and filter results', async () => {
      await performanceBenchmark.benchmark(
        () => null,
        'Test1',
        { tags: ['tag1'] }
      );

      await performanceBenchmark.benchmark(
        () => null,
        'Test2',
        { tags: ['tag2'] }
      );

      const filtered = performanceBenchmark.getResults({
        operationName: 'Test1'
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].operationName).toBe('Test1');
    });

    it('should filter by time range', async () => {
      const now = Date.now();
      
      await performanceBenchmark.benchmark(
        () => null,
        'TimeTest'
      );

      const results = performanceBenchmark.getResults({
        timeRange: {
          start: now - 1000,
          end: now + 1000
        }
      });

      expect(results).toHaveLength(1);
      expect(results[0].operationName).toBe('TimeTest');
    });
  });

  describe('Report Generation', () => {
    it('should generate markdown report', async () => {
      const result = await performanceBenchmark.benchmark(
        () => null,
        'ReportTest'
      );

      const report = performanceBenchmark.generateReport([result]);

      expect(report).toContain('# Performance Benchmark Report');
      expect(report).toContain('## ReportTest');
      expect(report).toContain('Duration:');
      expect(report).toContain('Memory Usage:');
      expect(report).toContain('Operations/Second:');
    });
  });

  describe('Error Handling', () => {
    it('should handle failed operations', async () => {
      await expect(
        performanceBenchmark.benchmark(
          () => { throw new Error('Test error'); },
          'ErrorTest'
        )
      ).rejects.toThrow('Test error');
    });
  });

  describe('Performance Thresholds', () => {
    it('should complete benchmarks within reasonable time', async () => {
      const startTime = Date.now();

      await performanceBenchmark.benchmark(
        () => null,
        'SpeedTest',
        { iterations: 10000 }
      );

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });
  });
}); 