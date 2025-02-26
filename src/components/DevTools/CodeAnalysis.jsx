import React, { useEffect, useRef, useState } from 'react';
import { RosenCharts } from '@rosencharts/react';
import styles from '../../styles/base.module.css';
import { propAnalyzer } from '../../utils/propAnalysis';

const CodeAnalysis = () => {
  const dependencyChartRef = useRef(null);
  const componentTreeRef = useRef(null);
  const performanceChartRef = useRef(null);
  const propUsageChartRef = useRef(null);
  const [propAnalysis, setPropAnalysis] = useState(null);

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

    // Get prop analysis data
    const analysis = propAnalyzer.analyzeProps();
    setPropAnalysis(analysis);

    // Create prop usage data
    const propUsageData = analysis.components.map(component => ({
      name: component.componentName,
      props: component.props.length,
      unused: component.props.filter(p => p.usageCount === 0).length,
      renders: propAnalyzer.getRenderCount(component.componentName)
    }));

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

    // Create prop usage chart
    new RosenCharts.Bar(propUsageChartRef.current, {
      data: propUsageData,
      theme: 'dark',
      xField: 'name',
      yField: ['props', 'unused', 'renders'],
      barStyle: {
        fill: ['#1b5e20', '#b71c1c', '#0d47a1']
      },
      legend: {
        visible: true,
        position: 'top'
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

      <div className={styles['chart-section']}>
        <h3>Prop Usage Analysis</h3>
        <div ref={propUsageChartRef} className={styles['chart-container']} />
        {propAnalysis && propAnalysis.unusedProps.length > 0 && (
          <div className={styles['analysis-warning']}>
            <h4>Unused Props Detected</h4>
            <ul>
              {propAnalysis.unusedProps.map(({componentName, propName}) => (
                <li key={`${componentName}-${propName}`}>
                  {componentName}: {propName}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeAnalysis;