import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import styles from '../../styles/base.module.css';
import { PropAnalysisResult } from '../../utils/propAnalysis';

interface PropValue {
  timestamp: number;
  value: any;
  renderCount: number;
}

interface PropHistory {
  componentName: string;
  propName: string;
  values: PropValue[];
}

interface PropValueHistoryProps {
  data: PropAnalysisResult;
  maxHistory?: number;
}

const PropValueHistory: React.FC<PropValueHistoryProps> = ({ 
  data, 
  maxHistory = 50 
}) => {
  const [selectedComponent, setSelectedComponent] = useState<string>('');
  const [selectedProp, setSelectedProp] = useState<string>('');

  // Transform data into historical format
  const getHistoricalData = (): PropHistory[] => {
    return data.components.flatMap(component =>
      component.props.map(prop => ({
        componentName: component.componentName,
        propName: prop.name,
        values: prop.valueHistory?.slice(-maxHistory) || []
      }))
    );
  };

  const uniqueComponents = Array.from(
    new Set(data.components.map(c => c.componentName))
  );

  const getPropsForComponent = (componentName: string): string[] => {
    const component = data.components.find(c => c.componentName === componentName);
    return component?.props.map(p => p.name) || [];
  };

  const selectedHistory = selectedComponent && selectedProp
    ? getHistoricalData().find(
        h => h.componentName === selectedComponent && h.propName === selectedProp
      )
    : null;

  const chartData = selectedHistory?.values.map(v => ({
    renderCount: v.renderCount,
    value: typeof v.value === 'object' ? JSON.stringify(v.value) : v.value,
    timestamp: v.timestamp
  }));

  return (
    <div className={styles['history-container']}>
      <h3>Prop Value History</h3>
      
      <div className={styles['history-controls']}>
        <div className={styles['select-group']}>
          <label>Component:</label>
          <select
            value={selectedComponent}
            onChange={(e) => {
              setSelectedComponent(e.target.value);
              setSelectedProp('');
            }}
            className={styles.select}
          >
            <option value="">Select Component</option>
            {uniqueComponents.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {selectedComponent && (
          <div className={styles['select-group']}>
            <label>Prop:</label>
            <select
              value={selectedProp}
              onChange={(e) => setSelectedProp(e.target.value)}
              className={styles.select}
            >
              <option value="">Select Prop</option>
              {getPropsForComponent(selectedComponent).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        )}

        <div className={styles['history-settings']}>
          <label>History Size:</label>
          <input
            type="number"
            value={maxHistory}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value) && value > 0) {
                // Update maxHistory through props
              }
            }}
            className={styles.input}
            min="1"
            max="100"
          />
        </div>
      </div>

      {selectedComponent && selectedProp ? (
        <div className={styles['chart-container']} data-testid="history-chart">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="renderCount"
                label={{ value: 'Render Count', position: 'bottom' }}
              />
              <YAxis label={{ value: 'Value', angle: -90, position: 'left' }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className={styles['timeline-tooltip']}>
                        <h4>Render #{label}</h4>
                        <p>Value: {data.value}</p>
                        <p>Time: {new Date(data.timestamp).toLocaleTimeString()}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4caf50"
                dot={{ fill: '#4caf50', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className={styles['history-placeholder']}>
          <p>Select a component and prop to view its value history</p>
        </div>
      )}

      <div className={styles['history-stats']}>
        {selectedComponent && selectedProp && (
          <>
            <div className={styles['stat-item']}>
              <label>Total Updates:</label>
              <span>{data.components
                .find(c => c.componentName === selectedComponent)
                ?.props.find(p => p.name === selectedProp)
                ?.valueChanges || 0}
              </span>
            </div>
            <div className={styles['stat-item']}>
              <label>Last Updated:</label>
              <span>{data.components
                .find(c => c.componentName === selectedComponent)
                ?.props.find(p => p.name === selectedProp)
                ?.lastValue?.timestamp
                ? new Date(data.components
                    .find(c => c.componentName === selectedComponent)!
                    .props.find(p => p.name === selectedProp)!
                    .lastValue!.timestamp
                  ).toLocaleTimeString()
                : 'Never'
              }</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PropValueHistory; 