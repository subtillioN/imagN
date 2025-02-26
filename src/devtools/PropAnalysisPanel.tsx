import React, { useEffect, useState } from 'react';
import { DevToolsIntegration } from './integration';
import { PropAnalysisResult } from '../utils/propAnalysis';
import OptimizationRecommendations from '../components/DevTools/OptimizationRecommendations';
import RenderImpactAnalysis from '../components/DevTools/RenderImpactAnalysis';
import styles from '../styles/base.module.css';

interface PropAnalysisPanelProps {
  bridge: any; // DevTools bridge instance
}

const PropAnalysisPanel: React.FC<PropAnalysisPanelProps> = ({ bridge }) => {
  const [analysisData, setAnalysisData] = useState<PropAnalysisResult | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'impact'>('recommendations');

  useEffect(() => {
    const integration = DevToolsIntegration.getInstance();

    const handleAnalysisUpdate = (data: { analysis: PropAnalysisResult }) => {
      setAnalysisData(data.analysis);
    };

    const handleComponentSelect = (data: { componentId: string }) => {
      setSelectedComponentId(data.componentId);
      integration.addInspectedComponent(data.componentId);
    };

    // Subscribe to DevTools events
    bridge.on('prop-tracking:analysis-update', handleAnalysisUpdate);
    bridge.on('selectComponent', handleComponentSelect);

    return () => {
      // Cleanup subscriptions
      bridge.off('prop-tracking:analysis-update', handleAnalysisUpdate);
      bridge.off('selectComponent', handleComponentSelect);

      if (selectedComponentId) {
        integration.removeInspectedComponent(selectedComponentId);
      }
    };
  }, [bridge, selectedComponentId]);

  if (!analysisData) {
    return (
      <div className={styles['devtools-panel']}>
        <div className={styles['devtools-loading']}>
          <p>Waiting for prop analysis data...</p>
          <p className={styles['devtools-hint']}>
            Make sure your application is running and React DevTools is connected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['devtools-panel']}>
      <div className={styles['devtools-header']}>
        <h2>Prop Analysis</h2>
        <div className={styles['devtools-tabs']}>
          <button
            className={`${styles['devtools-tab']} ${
              activeTab === 'recommendations' ? styles['active'] : ''
            }`}
            onClick={() => setActiveTab('recommendations')}
          >
            Optimization Recommendations
          </button>
          <button
            className={`${styles['devtools-tab']} ${
              activeTab === 'impact' ? styles['active'] : ''
            }`}
            onClick={() => setActiveTab('impact')}
          >
            Render Impact
          </button>
        </div>
      </div>

      <div className={styles['devtools-content']}>
        {activeTab === 'recommendations' ? (
          <OptimizationRecommendations data={analysisData} />
        ) : (
          <RenderImpactAnalysis data={analysisData} />
        )}
      </div>

      {selectedComponentId && (
        <div className={styles['devtools-selected-component']}>
          <h3>Selected Component Analysis</h3>
          <div className={styles['devtools-component-details']}>
            {analysisData.components
              .filter(c => c.componentName === selectedComponentId)
              .map(component => (
                <div key={component.componentName}>
                  <h4>{component.componentName}</h4>
                  <div className={styles['devtools-props-list']}>
                    {component.props.map(prop => (
                      <div key={prop.name} className={styles['devtools-prop-item']}>
                        <span className={styles['devtools-prop-name']}>{prop.name}</span>
                        <span className={styles['devtools-prop-type']}>{prop.type}</span>
                        <span className={styles['devtools-prop-updates']}>
                          Updates: {prop.valueChanges || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropAnalysisPanel; 