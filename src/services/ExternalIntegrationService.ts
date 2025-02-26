import { MonitoringEvent, MonitoringService } from './MonitoringService';
import { PerformanceMetrics } from '../utils/performanceBenchmark';

export interface ExternalToolConfig {
  type: 'newrelic' | 'datadog' | 'googleanalytics' | 'custom';
  apiKey?: string;
  endpoint?: string;
  customConfig?: Record<string, any>;
}

export interface MetricPayload {
  timestamp: number;
  metrics: PerformanceMetrics;
  source: string;
  environment: string;
  tags?: string[];
}

export class ExternalIntegrationService {
  private static instance: ExternalIntegrationService;
  private integrations: Map<string, ExternalToolConfig> = new Map();
  private isInitialized: boolean = false;

  private constructor() {
    // Initialize integrations with external services
    this.setupNewRelic();
    this.setupDatadog();
    this.setupGoogleAnalytics();
  }

  static getInstance(): ExternalIntegrationService {
    if (!ExternalIntegrationService.instance) {
      ExternalIntegrationService.instance = new ExternalIntegrationService();
    }
    return ExternalIntegrationService.instance;
  }

  initialize() {
    if (this.isInitialized) return;

    // Subscribe to monitoring events
    const monitoringService = MonitoringService.getInstance();
    monitoringService.on('metrics:collected', this.handleMetrics);
    monitoringService.on('monitoring:violation', this.handleViolation);

    this.isInitialized = true;
  }

  private handleMetrics = async (event: MonitoringEvent) => {
    const payload: MetricPayload = {
      timestamp: event.timestamp,
      metrics: event.data,
      source: 'prop-analysis',
      environment: process.env.NODE_ENV || 'development',
      tags: ['prop-analysis', 'react', 'performance'],
    };

    await this.sendToAllIntegrations(payload);
  };

  private handleViolation = async (event: MonitoringEvent) => {
    const payload = {
      ...event,
      source: 'prop-analysis',
      environment: process.env.NODE_ENV || 'development',
      severity: 'warning',
      tags: ['prop-analysis', 'violation', 'performance'],
    };

    await this.sendToAllIntegrations(payload);
  };

  private async sendToAllIntegrations(payload: MetricPayload | any) {
    const promises = Array.from(this.integrations.entries()).map(([name, config]) =>
      this.sendToIntegration(name, config, payload).catch(error => {
        console.error(`Failed to send data to ${name}:`, error);
      })
    );

    await Promise.all(promises);
  }

  private async sendToIntegration(
    name: string,
    config: ExternalToolConfig,
    payload: any
  ) {
    switch (config.type) {
      case 'newrelic':
        return this.sendToNewRelic(payload);
      case 'datadog':
        return this.sendToDatadog(payload);
      case 'googleanalytics':
        return this.sendToGoogleAnalytics(payload);
      case 'custom':
        return this.sendToCustomEndpoint(config, payload);
      default:
        throw new Error(`Unknown integration type: ${config.type}`);
    }
  }

  private setupNewRelic() {
    if (process.env.REACT_APP_NEW_RELIC_LICENSE_KEY) {
      this.integrations.set('newrelic', {
        type: 'newrelic',
        apiKey: process.env.REACT_APP_NEW_RELIC_LICENSE_KEY,
      });
    }
  }

  private setupDatadog() {
    if (process.env.REACT_APP_DATADOG_API_KEY) {
      this.integrations.set('datadog', {
        type: 'datadog',
        apiKey: process.env.REACT_APP_DATADOG_API_KEY,
        endpoint: 'https://api.datadoghq.com/api/v1/series',
      });
    }
  }

  private setupGoogleAnalytics() {
    if (process.env.REACT_APP_GA_MEASUREMENT_ID) {
      this.integrations.set('googleanalytics', {
        type: 'googleanalytics',
        apiKey: process.env.REACT_APP_GA_MEASUREMENT_ID,
      });
    }
  }

  private async sendToNewRelic(payload: MetricPayload) {
    const config = this.integrations.get('newrelic');
    if (!config?.apiKey) return;

    const metrics = this.transformMetricsForNewRelic(payload);
    
    await fetch('https://metric-api.newrelic.com/metric/v1', {
      method: 'POST',
      headers: {
        'Api-Key': config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metrics),
    });
  }

  private async sendToDatadog(payload: MetricPayload) {
    const config = this.integrations.get('datadog');
    if (!config?.apiKey || !config.endpoint) return;

    const metrics = this.transformMetricsForDatadog(payload);

    await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'DD-API-KEY': config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metrics),
    });
  }

  private async sendToGoogleAnalytics(payload: MetricPayload) {
    const config = this.integrations.get('googleanalytics');
    if (!config?.apiKey) return;

    const metrics = this.transformMetricsForGA(payload);

    await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${config.apiKey}&api_secret=${process.env.REACT_APP_GA_API_SECRET}`, {
      method: 'POST',
      body: JSON.stringify(metrics),
    });
  }

  private async sendToCustomEndpoint(config: ExternalToolConfig, payload: any) {
    if (!config.endpoint) return;

    await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
        ...(config.customConfig?.headers || {}),
      },
      body: JSON.stringify(payload),
    });
  }

  private transformMetricsForNewRelic(payload: MetricPayload) {
    return {
      metrics: [
        {
          name: 'prop_analysis.analysis_time',
          type: 'gauge',
          value: payload.metrics.analysisTime,
          timestamp: payload.timestamp,
          attributes: {
            environment: payload.environment,
            ...payload.tags?.reduce((acc, tag) => ({ ...acc, [tag]: true }), {}),
          },
        },
        {
          name: 'prop_analysis.memory_usage',
          type: 'gauge',
          value: payload.metrics.memoryUsage,
          timestamp: payload.timestamp,
          attributes: {
            environment: payload.environment,
            ...payload.tags?.reduce((acc, tag) => ({ ...acc, [tag]: true }), {}),
          },
        },
      ],
    };
  }

  private transformMetricsForDatadog(payload: MetricPayload) {
    return {
      series: [
        {
          metric: 'prop_analysis.analysis_time',
          points: [[payload.timestamp, payload.metrics.analysisTime]],
          type: 'gauge',
          tags: payload.tags,
        },
        {
          metric: 'prop_analysis.memory_usage',
          points: [[payload.timestamp, payload.metrics.memoryUsage]],
          type: 'gauge',
          tags: payload.tags,
        },
      ],
    };
  }

  private transformMetricsForGA(payload: MetricPayload) {
    return {
      client_id: 'prop-analysis',
      events: [
        {
          name: 'performance_metric',
          params: {
            analysis_time_ms: payload.metrics.analysisTime,
            memory_usage_mb: payload.metrics.memoryUsage / (1024 * 1024),
            component_count: payload.metrics.componentCount,
            prop_count: payload.metrics.propCount,
            update_frequency: payload.metrics.updateFrequency,
            environment: payload.environment,
          },
        },
      ],
    };
  }

  addCustomIntegration(name: string, config: ExternalToolConfig) {
    this.integrations.set(name, config);
  }

  removeIntegration(name: string) {
    this.integrations.delete(name);
  }

  cleanup() {
    const monitoringService = MonitoringService.getInstance();
    monitoringService.removeListener('metrics:collected', this.handleMetrics);
    monitoringService.removeListener('monitoring:violation', this.handleViolation);
    this.isInitialized = false;
  }
} 