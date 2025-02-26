import React, { useEffect, useRef } from 'react';
import { RosenCharts } from '@rosencharts/react';
import styles from '../../styles/base.module.css';
import { PropAnalysisResult } from '../../utils/propAnalysis';

interface TimelineData {
  timestamp: number;
  componentName: string;
  propName: string;
  value: any;
  changeType: 'update' | 'add' | 'remove';
}

interface PropTimelineProps {
  data: PropAnalysisResult;
  startTime: number;
  endTime: number;
}

const PropTimeline: React.FC<PropTimelineProps> = ({ data, startTime, endTime }) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!timelineRef.current) return;

    // Transform data for timeline visualization
    const timelineData = data.components.flatMap(component =>
      component.props.map(prop => ({
        timestamp: prop.lastValue?.timestamp || startTime,
        componentName: component.componentName,
        propName: prop.name,
        value: prop.lastValue,
        changeType: prop.valueChanges ? 'update' : 'add'
      }))
    );

    // Create timeline chart
    new RosenCharts.Timeline(timelineRef.current, {
      data: timelineData,
      theme: 'dark',
      xField: 'timestamp',
      yField: 'componentName',
      colorField: 'changeType',
      height: 400,
      padding: [40, 20, 40, 100],
      colorMapping: {
        update: '#4caf50',
        add: '#2196f3',
        remove: '#f44336'
      },
      tooltip: {
        container: tooltipRef.current!,
        formatter: (data: TimelineData) => `
          <div class="${styles['timeline-tooltip']}">
            <h4>${data.componentName}</h4>
            <p>Prop: ${data.propName}</p>
            <p>Value: ${JSON.stringify(data.value)}</p>
            <p>Time: ${new Date(data.timestamp).toLocaleTimeString()}</p>
          </div>
        `
      },
      timeRange: {
        start: startTime,
        end: endTime
      },
      interactions: ['zoom', 'tooltip', 'brush']
    });
  }, [data, startTime, endTime]);

  return (
    <div className={styles['timeline-container']}>
      <h3>Prop Changes Timeline</h3>
      <div className={styles['timeline-controls']}>
        <button className={styles.button} onClick={() => {}}>
          Reset Zoom
        </button>
        <button className={styles.button} onClick={() => {}}>
          Last Hour
        </button>
        <button className={styles.button} onClick={() => {}}>
          Last 24 Hours
        </button>
      </div>
      <div ref={timelineRef} className={styles['chart-container']} />
      <div ref={tooltipRef} className={styles['timeline-tooltip-container']} />
      <div className={styles['timeline-legend']}>
        <div className={styles['legend-item']}>
          <span className={styles['legend-color']} style={{ backgroundColor: '#4caf50' }} />
          <span>Update</span>
        </div>
        <div className={styles['legend-item']}>
          <span className={styles['legend-color']} style={{ backgroundColor: '#2196f3' }} />
          <span>Add</span>
        </div>
        <div className={styles['legend-item']}>
          <span className={styles['legend-color']} style={{ backgroundColor: '#f44336' }} />
          <span>Remove</span>
        </div>
      </div>
    </div>
  );
};

export default PropTimeline; 