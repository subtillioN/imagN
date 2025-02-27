import React, { useState, useEffect } from 'react';
import {
  MonitoringDashboard,
  PropPatternDetection,
  PropTimeline,
  RealTimeMonitoring,
  PerformanceImpact,
  OptimizationRecommendations
} from '../../src';

const mockData = {
  components: [
    {
      componentName: 'UserProfile',
      props: [
        { name: 'userId', type: 'string', valueChanges: 5, usageCount: 10 },
        { name: 'userData', type: 'object', valueChanges: 15, usageCount: 10 }
      ]
    },
    {
      componentName: 'Dashboard',
      props: [
        { name: 'data', type: 'array', valueChanges: 20, usageCount: 10 },
        { name: 'loading', type: 'boolean', valueChanges: 8, usageCount: 10 }
      ]
    }
  ],
  unusedProps: [
    { componentName: 'UserProfile', propName: 'theme' },
    { componentName: 'Dashboard', propName: 'debug' }
  ],
  propPatterns: [
    { type: 'update', frequency: 0.8 },
    { type: 'value', frequency: 0.5 }
  ],
  frequentUpdates: [
    { componentName: 'Dashboard', propName: 'data' }
  ]
};

const Demo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('monitoring');
  const [data, setData] = useState(mockData);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        components: prev.components.map(comp => ({
          ...comp,
          props: comp.props.map(prop => ({
            ...prop,
            valueChanges: prop.valueChanges + Math.floor(Math.random() * 3),
            usageCount: prop.usageCount + 1
          }))
        }))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'monitoring':
        return <MonitoringDashboard data={data} />;
      case 'patterns':
        return <PropPatternDetection data={data} />;
      case 'timeline':
        return <PropTimeline data={data} />;
      case 'realtime':
        return <RealTimeMonitoring data={data} />;
      case 'impact':
        return <PerformanceImpact data={data} />;
      case 'optimization':
        return <OptimizationRecommendations data={data} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h1>FRAOP MVI Dev Tools Demo</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('monitoring')}
          style={{ fontWeight: activeTab === 'monitoring' ? 'bold' : 'normal' }}
        >
          Monitoring Dashboard
        </button>
        <button
          onClick={() => setActiveTab('patterns')}
          style={{ fontWeight: activeTab === 'patterns' ? 'bold' : 'normal' }}
        >
          Pattern Detection
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          style={{ fontWeight: activeTab === 'timeline' ? 'bold' : 'normal' }}
        >
          Prop Timeline
        </button>
        <button
          onClick={() => setActiveTab('realtime')}
          style={{ fontWeight: activeTab === 'realtime' ? 'bold' : 'normal' }}
        >
          Real-time Monitoring
        </button>
        <button
          onClick={() => setActiveTab('impact')}
          style={{ fontWeight: activeTab === 'impact' ? 'bold' : 'normal' }}
        >
          Performance Impact
        </button>
        <button
          onClick={() => setActiveTab('optimization')}
          style={{ fontWeight: activeTab === 'optimization' ? 'bold' : 'normal' }}
        >
          Optimization
        </button>
      </div>

      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default Demo; 