import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import styles from '../../styles/base.module.css';
import { PropAnalysisResult } from '../../utils/propAnalysis';

interface MonitoringDashboardProps {
  data: PropAnalysisResult;
  refreshInterval?: number; // in milliseconds
}

interface MetricHistory {
  timestamp: number;
  totalUpdates: number;
  highImpactProps: number;
  averageUpdateFrequency: number;
}

const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ 
  data, 
  refreshInterval = 1000 
}) => {
  const [metricHistory, setMetricHistory] = useState<MetricHistory[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string>('');
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Calculate current metrics
  const calculateMetrics = (): MetricHistory => {
    let totalUpdates = 0;
    let highImpactProps = 0;
    let totalProps = 0;

    data.components.forEach(component => {
      component.props.forEach(prop => {
        totalUpdates += prop.valueChanges || 0;
        if ((prop.valueChanges || 0) / (prop.usageCount || 1) > 0.8) {
          highImpactProps++;
        }
        totalProps++;
      });
    });

    return {
      timestamp: Date.now(),
      totalUpdates,
      highImpactProps,
      averageUpdateFrequency: totalProps ? totalUpdates / totalProps : 0,
    };
  };

  // Start/stop monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const newMetrics = calculateMetrics();
      setMetricHistory(prev => {
        const newHistory = [...prev, newMetrics];
        // Keep last 100 data points
        return newHistory.slice(-100);
      });
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isMonitoring, data, refreshInterval]);

  // Get active components list
  const components = data.components.map(c => c.componentName);

  // Get component-specific metrics
  const getComponentMetrics = (componentName: string) => {
    const component = data.components.find(c => c.componentName === componentName);
    if (!component) return null;

    const metrics = {
      totalProps: component.props.length,
      activeProps: component.props.filter(p => p.usageCount > 0).length,
      highUpdateProps: component.props.filter(p => 
        (p.valueChanges || 0) / (p.usageCount || 1) > 0.8
      ).length,
    };

    return metrics;
  };

  return (
    <div className={styles['monitoring-container']} data-testid="monitoring-dashboard">
      <div className={styles['monitoring-header']}>
        <h3>Real-time Prop Monitoring</h3>
        <button
          className={`${styles.button} ${isMonitoring ? styles.active : ''}`}
          onClick={() => setIsMonitoring(!isMonitoring)}
        >
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </button>
      </div>

      <div className={styles['monitoring-controls']}>
        <select
          className={styles.select}
          value={selectedComponent}
          onChange={(e) => setSelectedComponent(e.target.value)}
        >
          <option value="">All Components</option>
          {components.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <div className={styles['monitoring-metrics']}>
        {selectedComponent && getComponentMetrics(selectedComponent) && (
          <div className={styles['component-metrics']}>
            <h4>{selectedComponent} Metrics</h4>
            <div className={styles['metric-grid']}>
              <div className={styles['metric-item']}>
                <label>Total Props</label>
                <span>{getComponentMetrics(selectedComponent)?.totalProps}</span>
              </div>
              <div className={styles['metric-item']}>
                <label>Active Props</label>
                <span>{getComponentMetrics(selectedComponent)?.activeProps}</span>
              </div>
              <div className={styles['metric-item']}>
                <label>High Update Props</label>
                <span>{getComponentMetrics(selectedComponent)?.highUpdateProps}</span>
              </div>
            </div>
          </div>
        )}

        <div className={styles['chart-container']}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metricHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalUpdates"
                name="Total Updates"
                stroke="#8884d8"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="highImpactProps"
                name="High Impact Props"
                stroke="#82ca9d"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="averageUpdateFrequency"
                name="Avg Update Freq"
                stroke="#ffc658"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {data.frequentUpdates.length > 0 && (
          <div className={styles['monitoring-alerts']}>
            <h4>Active Alerts</h4>
            <ul>
              {data.frequentUpdates.map((update, index) => (
                <li key={index}>
                  {update.componentName}.{update.propName} has {update.updateCount} updates
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoringDashboard; 