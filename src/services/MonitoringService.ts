import { EventEmitter } from 'events';
import { PerformanceMetrics, PerformanceBudget } from '../utils/performanceBenchmark';
import { PropAnalysisResult } from '../utils/propAnalysis';

export interface MonitoringEvent {
  timestamp: number;
  type: 'metrics' | 'violation' | 'alert';
  data: any;
}

export interface MonitoringConfig {
  sampleInterval: number; // milliseconds
  retentionPeriod: number; // milliseconds
  alertThresholds: {
    analysisTime: number;
    memoryUsage: number;
    updateFrequency: number;
  };
}

export class MonitoringService extends EventEmitter {
  private static instance: MonitoringService;
  private isRunning: boolean = false;
  private metrics: MonitoringEvent[] = [];
  private monitoringInterval: NodeJS.Timer | null = null;
  private lastAnalysisResult: PropAnalysisResult | null = null;

  private readonly defaultConfig: MonitoringConfig = {
    sampleInterval: 1000, // 1 second
    retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
    alertThresholds: {
      analysisTime: 150, // ms
      memoryUsage: 100 * 1024 * 1024, // 100MB
      updateFrequency: 1000, // updates per second
    },
  };

  private constructor(private config: MonitoringConfig) {
    super();
    this.config = { ...this.defaultConfig, ...config };
  }

  static getInstance(config: Partial<MonitoringConfig> = {}): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService({
        ...MonitoringService.instance?.defaultConfig,
        ...config,
      });
    }
    return MonitoringService.instance;
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.cleanupOldMetrics();
    }, this.config.sampleInterval);

    this.emit('monitoring:started', {
      timestamp: Date.now(),
      config: this.config,
    });
  }

  stop() {
    if (!this.isRunning) return;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.isRunning = false;
    this.emit('monitoring:stopped', {
      timestamp: Date.now(),
    });
  }

  updateAnalysis(analysis: PropAnalysisResult) {
    this.lastAnalysisResult = analysis;
    this.collectMetrics();
  }

  private collectMetrics() {
    if (!this.lastAnalysisResult) return;

    const timestamp = Date.now();
    const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;

    // Calculate metrics
    const metrics: PerformanceMetrics = {
      analysisTime: performance.now() - timestamp,
      memoryUsage,
      componentCount: this.lastAnalysisResult.components.length,
      propCount: this.lastAnalysisResult.components.reduce(
        (sum, comp) => sum + comp.props.length,
        0
      ),
      updateFrequency: this.lastAnalysisResult.components.reduce(
        (sum, comp) =>
          sum +
          comp.props.reduce(
            (propSum, prop) => propSum + (prop.valueChanges || 0),
            0
          ),
        0
      ),
    };

    // Check for violations
    this.checkViolations(metrics);

    // Store metrics
    const event: MonitoringEvent = {
      timestamp,
      type: 'metrics',
      data: metrics,
    };

    this.metrics.push(event);
    this.emit('metrics:collected', event);
  }

  private checkViolations(metrics: PerformanceMetrics) {
    const { alertThresholds } = this.config;
    const violations: string[] = [];

    if (metrics.analysisTime > alertThresholds.analysisTime) {
      violations.push(
        `Analysis time (${metrics.analysisTime.toFixed(2)}ms) exceeds threshold (${
          alertThresholds.analysisTime
        }ms)`
      );
    }

    if (metrics.memoryUsage > alertThresholds.memoryUsage) {
      violations.push(
        `Memory usage (${(metrics.memoryUsage / 1024 / 1024).toFixed(
          2
        )}MB) exceeds threshold (${(alertThresholds.memoryUsage / 1024 / 1024).toFixed(
          2
        )}MB)`
      );
    }

    if (metrics.updateFrequency > alertThresholds.updateFrequency) {
      violations.push(
        `Update frequency (${metrics.updateFrequency} updates/s) exceeds threshold (${alertThresholds.updateFrequency} updates/s)`
      );
    }

    if (violations.length > 0) {
      const event: MonitoringEvent = {
        timestamp: Date.now(),
        type: 'violation',
        data: { metrics, violations },
      };

      this.emit('monitoring:violation', event);
    }
  }

  private cleanupOldMetrics() {
    const cutoff = Date.now() - this.config.retentionPeriod;
    this.metrics = this.metrics.filter(event => event.timestamp >= cutoff);
  }

  getMetrics(timeRange?: { start: number; end: number }): MonitoringEvent[] {
    if (!timeRange) {
      return [...this.metrics];
    }

    return this.metrics.filter(
      event => event.timestamp >= timeRange.start && event.timestamp <= timeRange.end
    );
  }

  getLatestMetrics(count: number = 1): MonitoringEvent[] {
    return this.metrics.slice(-count);
  }

  on(event: 'metrics:collected', listener: (event: MonitoringEvent) => void): this;
  on(event: 'monitoring:violation', listener: (event: MonitoringEvent) => void): this;
  on(event: 'monitoring:started', listener: (data: any) => void): this;
  on(event: 'monitoring:stopped', listener: (data: any) => void): this;
  on(event: string, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }
} 