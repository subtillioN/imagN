import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { PropAnalysisResult } from '../../core/PropAnalyzer';
import { MonitoringService, MonitoringEvent } from '../../services/MonitoringService';

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
      if (event.type === 'update') {
        const analysis = event.data as PropAnalysisResult;
        const newMetrics = calculateMetrics(analysis);
        setMetricsHistory(prev => {
          const newHistory = [...prev, newMetrics];
          // Keep last 60 data points (1 minute at 1s interval)
          return newHistory.slice(-60);
        });
      } else if (event.type === 'warning') {
        setWarnings(prev => [...prev, event.data.message]);
      }
    });

    return () => unsubscribe();
  }, []);

  const calculateMetrics = (analysis: PropAnalysisResult): MetricsData => {
    const activeComponents = analysis.components.length;
    const activeProps = analysis.components.reduce((sum, component) => 
      sum + component.props.filter(p => p.usageCount > 0).length, 0
    );
    const highUpdateProps = analysis.components.reduce((sum, component) => 
      sum + component.props.filter(p => 
        (p.valueChanges || 0) / (p.usageCount || 1) > 0.5
      ).length, 0
    );

    return {
      timestamp: Date.now(),
      activeComponents,
      activeProps,
      highUpdateProps
    };
  };

  return (
    <div className="container" data-testid="monitoring-dashboard">
      <h2>Real-time Monitoring</h2>

      <div className="chart-container">
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

      <div className="section">
        <h3>Current Metrics</h3>
        <div className="data-grid">
          <div className="data-item">
            <div className="data-label">Components Tracked</div>
            <div className="data-value" data-testid="component-count">
              {data.components.length}
            </div>
          </div>
          <div className="data-item">
            <div className="data-label">Props Monitored</div>
            <div className="data-value" data-testid="props-count">
              {data.components.reduce((sum, c) => sum + c.props.length, 0)}
            </div>
          </div>
          <div className="data-item">
            <div className="data-label">Frequent Updates</div>
            <div className="data-value" data-testid="updates-count">
              {data.frequentUpdates.length}
            </div>
          </div>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="section">
          <h3>Warnings</h3>
          <ul data-testid="warnings-list">
            {warnings.map((warning, index) => (
              <li key={index} className="performance-low">
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