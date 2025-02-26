import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  Treemap,
  Tooltip,
} from 'recharts';
import styles from '../../styles/base.module.css';
import { PropAnalysisResult } from '../../utils/propAnalysis';

interface RenderImpactAnalysisProps {
  data: PropAnalysisResult;
}

interface RenderImpact {
  componentName: string;
  renderCount: number;
  propTriggered: number;
  cascadingEffects: number;
  affectedComponents: string[];
  criticalProps: Array<{
    name: string;
    updateCount: number;
    cascadeLevel: number;
  }>;
}

const RenderImpactAnalysis: React.FC<RenderImpactAnalysisProps> = ({ data }) => {
  const impactAnalysis = useMemo(() => {
    const impacts: RenderImpact[] = [];

    data.components.forEach(component => {
      // Calculate render impact metrics
      const renderCount = component.props.reduce(
        (sum, prop) => sum + (prop.valueChanges || 0),
        0
      );

      const propTriggered = component.props.filter(
        prop => (prop.valueChanges || 0) > 0
      ).length;

      // Analyze cascading effects (simplified for now)
      const cascadingEffects = Math.floor(renderCount * 0.3); // Estimated cascade factor
      const affectedComponents = data.components
        .filter(c => c.componentName !== component.componentName)
        .slice(0, cascadingEffects)
        .map(c => c.componentName);

      // Identify critical props
      const criticalProps = component.props
        .filter(prop => (prop.valueChanges || 0) / (prop.usageCount || 1) > 0.5)
        .map(prop => ({
          name: prop.name,
          updateCount: prop.valueChanges || 0,
          cascadeLevel: Math.floor(Math.random() * 3) + 1, // TODO: Implement actual cascade level calculation
        }));

      impacts.push({
        componentName: component.componentName,
        renderCount,
        propTriggered,
        cascadingEffects,
        affectedComponents,
        criticalProps,
      });
    });

    return impacts.sort((a, b) => b.renderCount - a.renderCount);
  }, [data]);

  const treeMapData = useMemo(() => {
    return {
      name: 'render-impact',
      children: impactAnalysis.map(impact => ({
        name: impact.componentName,
        size: impact.renderCount,
        impact: impact.cascadingEffects > 5 ? 'high' : 
               impact.cascadingEffects > 2 ? 'medium' : 'low',
      })),
    };
  }, [impactAnalysis]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;
    const impact = impactAnalysis.find(i => i.componentName === data.name);
    if (!impact) return null;

    return (
      <div className={styles['impact-tooltip']}>
        <h4>{impact.componentName}</h4>
        <p>Render Count: {impact.renderCount}</p>
        <p>Props Triggered: {impact.propTriggered}</p>
        <p>Cascading Effects: {impact.cascadingEffects} components</p>
        <div>
          <strong>Critical Props:</strong>
          <ul>
            {impact.criticalProps.map((prop, index) => (
              <li key={index}>
                {prop.name} (Updates: {prop.updateCount}, Cascade: Level {prop.cascadeLevel})
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className={styles['impact-container']} data-testid="render-impact-analysis">
      <div className={styles['impact-header']}>
        <h3>Render Impact Analysis</h3>
        <span>{impactAnalysis.length} components analyzed</span>
      </div>

      <div className={styles['impact-visualization']}>
        <ResponsiveContainer width="100%" height={400}>
          <Treemap
            data={treeMapData.children}
            dataKey="size"
            aspectRatio={4 / 3}
            stroke="#fff"
            fill="#8884d8"
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>

      <div className={styles['impact-details']}>
        {impactAnalysis.map((impact, index) => (
          <div
            key={index}
            className={`${styles['impact-card']} ${
              styles[`impact-${impact.cascadingEffects > 5 ? 'high' : 
                            impact.cascadingEffects > 2 ? 'medium' : 'low'}`]
            }`}
          >
            <h4>{impact.componentName}</h4>
            <div className={styles['impact-stats']}>
              <div>
                <label>Render Count</label>
                <span>{impact.renderCount}</span>
              </div>
              <div>
                <label>Props Triggered</label>
                <span>{impact.propTriggered}</span>
              </div>
              <div>
                <label>Cascading Effects</label>
                <span>{impact.cascadingEffects}</span>
              </div>
            </div>
            {impact.cascadingEffects > 2 && (
              <div className={styles['impact-warnings']}>
                <h4>Optimization Opportunities</h4>
                <ul>
                  {impact.criticalProps.map((prop, i) => (
                    <li key={i}>
                      Consider memoizing prop '{prop.name}' to reduce cascading updates (Level {prop.cascadeLevel})
                    </li>
                  ))}
                  {impact.affectedComponents.length > 0 && (
                    <li>
                      Affects components: {impact.affectedComponents.join(', ')}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RenderImpactAnalysis; 