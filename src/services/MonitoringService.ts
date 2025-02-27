import { PropAnalysisResult } from '../core/PropAnalyzer';

export type MonitoringEventType = 'metrics' | 'alert' | 'violation';

export interface MonitoringEvent {
  type: MonitoringEventType;
  timestamp: number;
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

type EventCallback = (event: MonitoringEvent) => void;

export class MonitoringService {
  private static instance: MonitoringService;
  private listeners: EventCallback[] = [];
  private isMonitoring: boolean = false;
  private metrics: MonitoringEvent[] = [];
  private monitoringInterval: number | null = null;
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

  private constructor() {}

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  public subscribe(callback: EventCallback): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  public startMonitoring(): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    // Simulate monitoring events
    this.monitoringInterval = window.setInterval(() => {
      this.notifyListeners({
        type: 'metrics',
        timestamp: Date.now(),
        data: {
          components: [],
          unusedProps: [],
          propPatterns: [],
          frequentUpdates: []
        } as PropAnalysisResult
      });
    }, 1000);
  }

  public stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    if (this.monitoringInterval !== null) {
      window.clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.isMonitoring = false;
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
    this.notifyListeners(event);
  }

  private checkViolations(metrics: PerformanceMetrics) {
    const { alertThresholds } = this.defaultConfig;
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

      this.notifyListeners(event);
    }
  }

  private cleanupOldMetrics() {
    const cutoff = Date.now() - this.defaultConfig.retentionPeriod;
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

  private notifyListeners(event: MonitoringEvent): void {
    this.listeners.forEach(callback => callback(event));
  }
} 