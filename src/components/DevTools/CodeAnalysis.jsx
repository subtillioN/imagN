import React, { useEffect, useRef } from 'react';
import { RosenCharts } from '@rosencharts/react';
import styles from '../../styles/base.module.css';

const CodeAnalysis = () => {
  const dependencyChartRef = useRef(null);
  const componentTreeRef = useRef(null);
  const performanceChartRef = useRef(null);

  useEffect(() => {
    // Initialize dependency graph
    const dependencyData = {
      nodes: [
        { id: 'MainView', label: 'MainView' },
        { id: 'BaseView', label: 'BaseView' },
        { id: 'ImageConfig', label: 'ImageConfig' },
        { id: 'NodeEditor', label: 'NodeEditor' },
        { id: 'ErrorBoundary', label: 'ErrorBoundary' }
      ],
      edges: [
        { from: 'MainView', to: 'BaseView' },
        { from: 'MainView', to: 'ImageConfig' },
        { from: 'MainView', to: 'NodeEditor' },
        { from: 'MainView', to: 'ErrorBoundary' }
      ]
    };

    // Initialize component tree
    const componentData = {
      name: 'App',
      children: [
        {
          name: 'MainView',
          children: [
            { name: 'ImageConfig', value: 25 },
            { name: 'NodeEditor', value: 35 },
            { name: 'ErrorBoundary', value: 15 }
          ]
        }
      ]
    };

    // Initialize performance metrics
    const performanceData = [
      { name: 'Render Time', value: 120 },
      { name: 'Component Load', value: 85 },
      { name: 'State Updates', value: 45 },
      { name: 'Event Handling', value: 65 }
    ];

    // Create dependency graph
    new RosenCharts.Network(dependencyChartRef.current, {
      data: dependencyData,
      theme: 'dark',
      layout: 'force',
      nodeStyle: {
        fill: '#1a237e',
        stroke: '#ffffff'
      },
      edgeStyle: {
        stroke: '#0d47a1'
      }
    });

    // Create component tree visualization
    new RosenCharts.Tree(componentTreeRef.current, {
      data: componentData,
      theme: 'dark',
      layout: 'dendrogram',
      nodeStyle: {
        fill: '#0277bd',
        stroke: '#ffffff'
      }
    });

    // Create performance metrics chart
    new RosenCharts.Bar(performanceChartRef.current, {
      data: performanceData,
      theme: 'dark',
      xField: 'name',
      yField: 'value',
      barStyle: {
        fill: '#1b5e20'
      }
    });
  }, []);

  return (
    <div className={styles['analysis-container']}>
      <h2 className={styles['section-title']}>Code Analysis</h2>
      
      <div className={styles['chart-section']}>
        <h3>Dependency Graph</h3>
        <div ref={dependencyChartRef} className={styles['chart-container']} />
      </div>

      <div className={styles['chart-section']}>
        <h3>Component Hierarchy</h3>
        <div ref={componentTreeRef} className={styles['chart-container']} />
      </div>

      <div className={styles['chart-section']}>
        <h3>Performance Metrics</h3>
        <div ref={performanceChartRef} className={styles['chart-container']} />
      </div>
    </div>
  );
};

export default CodeAnalysis;