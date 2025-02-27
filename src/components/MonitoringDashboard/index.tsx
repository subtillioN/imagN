import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { PropAnalysisResult, PropUsage } from '../../core/PropAnalyzer';
import { MonitoringService, MonitoringEvent } from '../../services/MonitoringService';
import styles from '../../styles/base.module.css';

interface MonitoringDashboardProps {
  data: PropAnalysisResult;
}

interface MetricsData {
  timestamp: number;
  activeComponents: number;
  activeProps: number;
  highUpdateProps: number;
}

const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ data }) => {
  const [metricsHistory, setMetricsHistory] = useState<MetricsData[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    const monitoringService = MonitoringService.getInstance();
    const unsubscribe = monitoringService.subscribe((event: MonitoringEvent) => {
      if (event.type === 'metrics') {
        const analysis = event.data as PropAnalysisResult;
        const newMetrics = calculateMetrics(analysis);
        setMetricsHistory(prev => {
          const newHistory = [...prev, newMetrics];
          // Keep last 60 data points (1 minute at 1s interval)
          return newHistory.slice(-60);
        });
      } else if (event.type === 'alert') {
        setWarnings(prev => [...prev, event.data.message]);
      }
    });

    // Start monitoring when component mounts
    monitoringService.startMonitoring();

    return () => {
      monitoringService.stopMonitoring();
      unsubscribe();
    };
  }, []);

  const isActivelyUsed = (prop: PropUsage): boolean => {
    return (prop.usageCount || 0) > 0;
  };

  const hasHighUpdateRate = (prop: PropUsage): boolean => {
    const usageCount = prop.usageCount || 1;
    const valueChanges = prop.valueChanges || 0;
    return valueChanges / usageCount > 0.5;
  };

  const calculateMetrics = (analysis: PropAnalysisResult): MetricsData => {
    const activeComponents = analysis.components.length;
    const activeProps = analysis.components.reduce((sum: number, component) => 
      sum + component.props.filter(isActivelyUsed).length, 0
    );
    const highUpdateProps = analysis.components.reduce((sum: number, component) => 
      sum + component.props.filter(hasHighUpdateRate).length, 0
    );

    return {
      timestamp: Date.now(),
      activeComponents,
      activeProps,
      highUpdateProps
    };
  };

  return (
    <div className={styles.container} data-testid="monitoring-dashboard">
      <h2>Real-time Monitoring</h2>

      <div className={styles.chartContainer}>
        <LineChart width={800} height={400} data={metricsHistory}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={value => new Date(value).toLocaleTimeString()} 
          />
          <YAxis />
          <Tooltip 
            labelFormatter={value => new Date(value).toLocaleTimeString()}
          />
          <Line 
            type="monotone" 
            dataKey="activeComponents" 
            stroke="#8884d8" 
            name="Active Components" 
          />
          <Line 
            type="monotone" 
            dataKey="activeProps" 
            stroke="#82ca9d" 
            name="Active Props" 
          />
          <Line 
            type="monotone" 
            dataKey="highUpdateProps" 
            stroke="#ff7300" 
            name="High Update Props" 
          />
        </LineChart>
      </div>

      <div className={styles.section}>
        <h3>Current Metrics</h3>
        <div className={styles.dataGrid}>
          <div className={styles.dataItem}>
            <div className={styles.dataLabel}>Components Tracked</div>
            <div className={styles.dataValue} data-testid="component-count">
              {data.components.length}
            </div>
          </div>
          <div className={styles.dataItem}>
            <div className={styles.dataLabel}>Props Monitored</div>
            <div className={styles.dataValue} data-testid="props-count">
              {data.components.reduce((sum, c) => sum + c.props.length, 0)}
            </div>
          </div>
          <div className={styles.dataItem}>
            <div className={styles.dataLabel}>Frequent Updates</div>
            <div className={styles.dataValue} data-testid="updates-count">
              {data.frequentUpdates.length}
            </div>
          </div>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className={styles.section}>
          <h3>Warnings</h3>
          <ul data-testid="warnings-list">
            {warnings.map((warning, index) => (
              <li key={index} className={styles.performanceLow}>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MonitoringDashboard; 