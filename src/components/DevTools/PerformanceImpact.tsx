import React, { useState } from 'react';
import {
  ResponsiveContainer,
  Treemap,
  Tooltip,
  Cell
} from 'recharts';
import styles from '../../styles/base.module.css';
import { PropAnalysisResult } from '../../utils/propAnalysis';

interface PerformanceMetric {
  name: string;
  value: number;
  children?: PerformanceMetric[];
  color?: string;
}

interface PerformanceImpactProps {
  data: PropAnalysisResult;
}

const PerformanceImpact: React.FC<PerformanceImpactProps> = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState<'updates' | 'renderTime'>('updates');

  // Transform data into treemap format
  const getTreemapData = (): PerformanceMetric[] => {
    return data.components.map(component => {
      const children = component.props.map(prop => ({
        name: prop.name,
        value: selectedMetric === 'updates' ? (prop.valueChanges || 0) : 
          (prop.usageCount || 0),
        color: getImpactColor(prop.valueChanges || 0, prop.usageCount || 0)
      }));

      return {
        name: component.componentName,
        value: children.reduce((sum, child) => sum + child.value, 0),
        children
      };
    });
  };

  // Calculate impact color based on update frequency and usage
  const getImpactColor = (updates: number, usage: number): string => {
    const impact = updates / (usage || 1);
    if (impact > 0.8) return '#ef5350'; // High impact - red
    if (impact > 0.5) return '#ff9800'; // Medium impact - orange
    if (impact > 0.2) return '#ffd54f'; // Low impact - yellow
    return '#81c784'; // Minimal impact - green
  };

  // Calculate performance metrics
  const getPerformanceMetrics = () => {
    const metrics = {
      totalUpdates: 0,
      highImpactProps: 0,
      averageUpdateFrequency: 0,
      componentCount: data.components.length
    };

    let totalProps = 0;
    data.components.forEach(component => {
      component.props.forEach(prop => {
        metrics.totalUpdates += prop.valueChanges || 0;
        if ((prop.valueChanges || 0) / (prop.usageCount || 1) > 0.8) {
          metrics.highImpactProps++;
        }
        totalProps++;
      });
    });

    metrics.averageUpdateFrequency = totalProps ? 
      metrics.totalUpdates / totalProps : 0;

    return metrics;
  };

  const metrics = getPerformanceMetrics();
  const treemapData = getTreemapData();

  return (
    <div className={styles['performance-container']}>
      <h3>Performance Impact Analysis</h3>
      
      <div className={styles['performance-controls']}>
        <div className={styles['metric-selector']}>
          <button
            className={`${styles.button} ${selectedMetric === 'updates' ? styles.active : ''}`}
            onClick={() => setSelectedMetric('updates')}
          >
            Update Frequency
          </button>
          <button
            className={`${styles.button} ${selectedMetric === 'renderTime' ? styles.active : ''}`}
            onClick={() => setSelectedMetric('renderTime')}
          >
            Render Impact
          </button>
        </div>
      </div>

      <div className={styles['performance-metrics']}>
        <div className={styles['metric-item']}>
          <label>Total Updates</label>
          <span>{metrics.totalUpdates}</span>
        </div>
        <div className={styles['metric-item']}>
          <label>High Impact Props</label>
          <span>{metrics.highImpactProps}</span>
        </div>
        <div className={styles['metric-item']}>
          <label>Avg Update Frequency</label>
          <span>{metrics.averageUpdateFrequency.toFixed(2)}</span>
        </div>
        <div className={styles['metric-item']}>
          <label>Components</label>
          <span>{metrics.componentCount}</span>
        </div>
      </div>

      <div className={styles['impact-legend']}>
        <div className={styles['legend-item']}>
          <span className={styles['legend-color']} style={{ backgroundColor: '#ef5350' }} />
          <span>High Impact</span>
        </div>
        <div className={styles['legend-item']}>
          <span className={styles['legend-color']} style={{ backgroundColor: '#ff9800' }} />
          <span>Medium Impact</span>
        </div>
        <div className={styles['legend-item']}>
          <span className={styles['legend-color']} style={{ backgroundColor: '#ffd54f' }} />
          <span>Low Impact</span>
        </div>
        <div className={styles['legend-item']}>
          <span className={styles['legend-color']} style={{ backgroundColor: '#81c784' }} />
          <span>Minimal Impact</span>
        </div>
      </div>

      <div className={styles['impact-visualization']} data-testid="impact-treemap">
        <ResponsiveContainer width="100%" height={400}>
          <Treemap
            data={treemapData}
            dataKey="value"
            stroke="#fff"
            fill="#8884d8"
          >
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className={styles['impact-tooltip']}>
                      <h4>{data.name}</h4>
                      <p>
                        {selectedMetric === 'updates' ? 'Updates: ' : 'Render Count: '}
                        {data.value}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {treemapData.map((entry, index) => (
              <Cell key={index} fill={entry.color || '#8884d8'} />
            ))}
          </Treemap>
        </ResponsiveContainer>
      </div>

      {data.frequentUpdates.length > 0 && (
        <div className={styles['impact-warnings']}>
          <h4>Performance Warnings</h4>
          <ul>
            {data.frequentUpdates.map((update, index) => (
              <li key={index}>
                {update.componentName}.{update.propName} updated {update.updateCount} times
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PerformanceImpact; 