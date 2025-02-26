import { PropAnalysisResult } from './propAnalysis';

export interface PerformanceMetrics {
  analysisTime: number;
  memoryUsage: number;
  componentCount: number;
  propCount: number;
  updateFrequency: number;
}

export interface PerformanceBudget {
  maxAnalysisTime: number;
  maxMemoryUsage: number;
  maxUpdateLatency: number;
}

export class PerformanceBenchmark {
  private static readonly DEFAULT_BUDGET: PerformanceBudget = {
    maxAnalysisTime: 100, // milliseconds
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
    maxUpdateLatency: 16, // milliseconds (targeting 60fps)
  };

  private metrics: PerformanceMetrics[] = [];
  private startTime: number = 0;
  private budget: PerformanceBudget;

  constructor(budget: Partial<PerformanceBudget> = {}) {
    this.budget = { ...PerformanceBenchmark.DEFAULT_BUDGET, ...budget };
  }

  startBenchmark() {
    this.startTime = performance.now();
    this.metrics = [];
  }

  measureAnalysis(analysis: PropAnalysisResult): PerformanceMetrics {
    const endTime = performance.now();
    const analysisTime = endTime - this.startTime;

    // Get memory usage if supported
    const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;

    // Calculate metrics
    const componentCount = analysis.components.length;
    const propCount = analysis.components.reduce(
      (sum, comp) => sum + comp.props.length,
      0
    );
    const updateFrequency = analysis.components.reduce(
      (sum, comp) =>
        sum +
        comp.props.reduce(
          (propSum, prop) => propSum + (prop.valueChanges || 0),
          0
        ),
      0
    );

    const metrics: PerformanceMetrics = {
      analysisTime,
      memoryUsage,
      componentCount,
      propCount,
      updateFrequency,
    };

    this.metrics.push(metrics);
    return metrics;
  }

  checkBudget(metrics: PerformanceMetrics): string[] {
    const violations: string[] = [];

    if (metrics.analysisTime > this.budget.maxAnalysisTime) {
      violations.push(
        `Analysis time (${metrics.analysisTime.toFixed(2)}ms) exceeds budget (${
          this.budget.maxAnalysisTime
        }ms)`
      );
    }

    if (metrics.memoryUsage > this.budget.maxMemoryUsage) {
      violations.push(
        `Memory usage (${(metrics.memoryUsage / 1024 / 1024).toFixed(
          2
        )}MB) exceeds budget (${(this.budget.maxMemoryUsage / 1024 / 1024).toFixed(
          2
        )}MB)`
      );
    }

    const averageUpdateLatency = metrics.analysisTime / metrics.updateFrequency;
    if (averageUpdateLatency > this.budget.maxUpdateLatency) {
      violations.push(
        `Update latency (${averageUpdateLatency.toFixed(2)}ms) exceeds budget (${
          this.budget.maxUpdateLatency
        }ms)`
      );
    }

    return violations;
  }

  getAverageMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0) {
      throw new Error('No metrics collected yet');
    }

    return {
      analysisTime:
        this.metrics.reduce((sum, m) => sum + m.analysisTime, 0) /
        this.metrics.length,
      memoryUsage:
        this.metrics.reduce((sum, m) => sum + m.memoryUsage, 0) /
        this.metrics.length,
      componentCount:
        this.metrics.reduce((sum, m) => sum + m.componentCount, 0) /
        this.metrics.length,
      propCount:
        this.metrics.reduce((sum, m) => sum + m.propCount, 0) /
        this.metrics.length,
      updateFrequency:
        this.metrics.reduce((sum, m) => sum + m.updateFrequency, 0) /
        this.metrics.length,
    };
  }

  generateReport(): string {
    const averageMetrics = this.getAverageMetrics();
    const violations = this.checkBudget(averageMetrics);
    const status = violations.length === 0 ? 'PASS' : 'FAIL';

    return `
Performance Benchmark Report
==========================
Status: ${status}

Metrics:
- Analysis Time: ${averageMetrics.analysisTime.toFixed(2)}ms
- Memory Usage: ${(averageMetrics.memoryUsage / 1024 / 1024).toFixed(2)}MB
- Component Count: ${Math.round(averageMetrics.componentCount)}
- Prop Count: ${Math.round(averageMetrics.propCount)}
- Update Frequency: ${Math.round(averageMetrics.updateFrequency)} updates

Budget Violations:
${violations.length === 0 ? 'None' : violations.map(v => `- ${v}`).join('\n')}

Performance Budget:
- Max Analysis Time: ${this.budget.maxAnalysisTime}ms
- Max Memory Usage: ${(this.budget.maxMemoryUsage / 1024 / 1024).toFixed(2)}MB
- Max Update Latency: ${this.budget.maxUpdateLatency}ms
`;
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