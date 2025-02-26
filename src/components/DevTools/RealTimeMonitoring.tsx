import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { MonitoringService, MonitoringEvent } from '../../services/MonitoringService';
import styles from '../../styles/base.module.css';

interface RealTimeMonitoringProps {
  timeWindow?: number; // milliseconds to show in chart
}

const RealTimeMonitoring: React.FC<RealTimeMonitoringProps> = ({
  timeWindow = 5 * 60 * 1000, // 5 minutes default
}) => {
  const [metrics, setMetrics] = useState<MonitoringEvent[]>([]);
  const [violations, setViolations] = useState<MonitoringEvent[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const monitoringService = MonitoringService.getInstance();

    const handleMetrics = (event: MonitoringEvent) => {
      setMetrics(prev => [...prev.slice(-50), event]); // Keep last 50 data points
    };

    const handleViolation = (event: MonitoringEvent) => {
      setViolations(prev => [...prev.slice(-10), event]); // Keep last 10 violations
    };

    const handleStart = () => setIsRunning(true);
    const handleStop = () => setIsRunning(false);

    monitoringService.on('metrics:collected', handleMetrics);
    monitoringService.on('monitoring:violation', handleViolation);
    monitoringService.on('monitoring:started', handleStart);
    monitoringService.on('monitoring:stopped', handleStop);

    // Start monitoring if not already running
    if (!isRunning) {
      monitoringService.start();
    }

    return () => {
      monitoringService.removeListener('metrics:collected', handleMetrics);
      monitoringService.removeListener('monitoring:violation', handleViolation);
      monitoringService.removeListener('monitoring:started', handleStart);
      monitoringService.removeListener('monitoring:stopped', handleStop);
    };
  }, [isRunning]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;
    return (
      <div className={styles['monitoring-tooltip']}>
        <h4>{formatTime(data.timestamp)}</h4>
        <p>Analysis Time: {data.data.analysisTime.toFixed(2)}ms</p>
        <p>Memory Usage: {(data.data.memoryUsage / 1024 / 1024).toFixed(2)}MB</p>
        <p>Components: {data.data.componentCount}</p>
        <p>Props: {data.data.propCount}</p>
        <p>Updates/s: {data.data.updateFrequency}</p>
      </div>
    );
  };

  return (
    <div className={styles['monitoring-container']}>
      <div className={styles['monitoring-header']}>
        <h3>Real-Time Performance Monitoring</h3>
        <div className={styles['monitoring-controls']}>
          <button
            className={styles['monitoring-toggle']}
            onClick={() => {
              const service = MonitoringService.getInstance();
              if (isRunning) {
                service.stop();
              } else {
                service.start();
              }
            }}
          >
            {isRunning ? 'Stop Monitoring' : 'Start Monitoring'}
          </button>
        </div>
      </div>

      <div className={styles['monitoring-metrics']}>
        <div className={styles['chart-container']}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTime}
                interval="preserveStartEnd"
              />
              <YAxis yAxisId="time" name="Analysis Time (ms)" />
              <YAxis yAxisId="memory" orientation="right" name="Memory (MB)" />
              <Tooltip content={<CustomTooltip />} />
              <Line
                yAxisId="time"
                type="monotone"
                dataKey="data.analysisTime"
                stroke="#8884d8"
                name="Analysis Time"
                dot={false}
              />
              <Line
                yAxisId="memory"
                type="monotone"
                dataKey="data.memoryUsage"
                stroke="#82ca9d"
                name="Memory Usage"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {violations.length > 0 && (
          <div className={styles['monitoring-alerts']}>
            <h4>Recent Violations</h4>
            <ul>
              {violations.map((violation, index) => (
                <li key={index}>
                  <span className={styles['alert-timestamp']}>
                    {formatTime(violation.timestamp)}
                  </span>
                  <ul>
                    {violation.data.violations.map((v: string, i: number) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles['monitoring-stats']}>
          <div className={styles['stat-item']}>
            <label>Components Tracked</label>
            <span>
              {metrics.length > 0
                ? metrics[metrics.length - 1].data.componentCount
                : 0}
            </span>
          </div>
          <div className={styles['stat-item']}>
            <label>Props Monitored</label>
            <span>
              {metrics.length > 0 ? metrics[metrics.length - 1].data.propCount : 0}
            </span>
          </div>
          <div className={styles['stat-item']}>
            <label>Update Rate</label>
            <span>
              {metrics.length > 0
                ? `${metrics[
                    metrics.length - 1
                  ].data.updateFrequency.toFixed(2)}/s`
                : '0/s'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMonitoring; 