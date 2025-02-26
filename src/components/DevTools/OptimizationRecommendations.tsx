import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import styles from '../../styles/base.module.css';
import { PropAnalysisResult } from '../../utils/propAnalysis';

interface OptimizationRecommendationsProps {
  data: PropAnalysisResult;
}

interface Recommendation {
  componentName: string;
  type: 'memoization' | 'propStructure' | 'renderOptimization' | 'stateManagement';
  priority: 'high' | 'medium' | 'low';
  impact: number;
  description: string;
  suggestedCode?: string;
  affectedProps?: string[];
  potentialImprovement: string;
}

const OptimizationRecommendations: React.FC<OptimizationRecommendationsProps> = ({ data }) => {
  const recommendations = useMemo(() => {
    const result: Recommendation[] = [];

    data.components.forEach(component => {
      // Analyze render frequency and prop updates
      const renderCount = component.props.reduce(
        (sum, prop) => sum + (prop.valueChanges || 0),
        0
      );
      const frequentlyUpdatingProps = component.props.filter(
        prop => (prop.valueChanges || 0) / (prop.usageCount || 1) > 0.5
      );
      const stableProps = component.props.filter(
        prop => (prop.valueChanges || 0) / (prop.usageCount || 1) < 0.2
      );

      // Memoization recommendations
      if (frequentlyUpdatingProps.length > 0) {
        result.push({
          componentName: component.componentName,
          type: 'memoization',
          priority: frequentlyUpdatingProps.length > 2 ? 'high' : 'medium',
          impact: Math.min(90, (frequentlyUpdatingProps.length / component.props.length) * 100),
          description: `Component has ${frequentlyUpdatingProps.length} frequently updating props`,
          suggestedCode: `
const ${component.componentName} = React.memo(({ ${frequentlyUpdatingProps.map(p => p.name).join(', ')} }) => {
  // Your component code
}, (prevProps, nextProps) => {
  ${frequentlyUpdatingProps.map(p => 
    `// Only re-render if ${p.name} has meaningfully changed
    if (!isEqual(prevProps.${p.name}, nextProps.${p.name})) return false;`
  ).join('\n  ')}
  return true;
});`,
          affectedProps: frequentlyUpdatingProps.map(p => p.name),
          potentialImprovement: `Up to ${Math.floor(renderCount * 0.6)} fewer renders`,
        });
      }

      // Prop structure optimization
      if (component.props.length > 5) {
        const groupableProps = component.props.filter(p => p.type === 'object' || p.type === 'array');
        if (groupableProps.length >= 2) {
          result.push({
            componentName: component.componentName,
            type: 'propStructure',
            priority: 'medium',
            impact: 60,
            description: 'Consider grouping related props into objects',
            suggestedCode: `
interface ${component.componentName}Config {
  ${groupableProps.map(p => `${p.name}: ${p.type};`).join('\n  ')}
}

const ${component.componentName} = ({ config, ...otherProps }) => {
  // Access grouped props via config.propName
};`,
            affectedProps: groupableProps.map(p => p.name),
            potentialImprovement: 'Improved code organization and maintenance',
          });
        }
      }

      // Render optimization
      if (renderCount > 100 && stableProps.length > 0) {
        result.push({
          componentName: component.componentName,
          type: 'renderOptimization',
          priority: 'high',
          impact: 75,
          description: 'High render count with stable props detected',
          suggestedCode: `
const ${component.componentName} = ({ ${stableProps.map(p => p.name).join(', ')}, ...dynamicProps }) => {
  // Memoize calculations based on stable props
  const memoizedValue = useMemo(() => {
    // Complex calculations using stable props
    return someExpensiveOperation(${stableProps.map(p => p.name).join(', ')});
  }, [${stableProps.map(p => p.name).join(', ')}]);

  return (
    // Use memoizedValue in render
  );
};`,
          affectedProps: stableProps.map(p => p.name),
          potentialImprovement: `Potential ${Math.floor(renderCount * 0.4)} render reduction`,
        });
      }

      // State management recommendations
      const stateProps = component.props.filter(p => 
        p.name.startsWith('set') || 
        p.name.includes('Update') || 
        p.name.includes('Change')
      );
      if (stateProps.length > 2) {
        result.push({
          componentName: component.componentName,
          type: 'stateManagement',
          priority: 'medium',
          impact: 70,
          description: 'Consider using reducer pattern for complex state',
          suggestedCode: `
interface ${component.componentName}State {
  ${stateProps.map(p => `${p.name.replace(/^set|Update|Change/i, '').toLowerCase()}: any;`).join('\n  ')}
}

type ${component.componentName}Action = 
  ${stateProps.map(p => `| { type: '${p.name.replace(/^set|Update|Change/i, '')}'; payload: any }`).join('\n  ')};

const ${component.componentName}Reducer = (state: ${component.componentName}State, action: ${component.componentName}Action) => {
  switch (action.type) {
    ${stateProps.map(p => `
    case '${p.name.replace(/^set|Update|Change/i, '')}':
      return { ...state, ${p.name.replace(/^set|Update|Change/i, '').toLowerCase()}: action.payload };`).join('')}
    default:
      return state;
  }
};`,
          affectedProps: stateProps.map(p => p.name),
          potentialImprovement: 'Improved state management and debugging',
        });
      }
    });

    return result.sort((a, b) => {
      if (a.priority === b.priority) {
        return b.impact - a.impact;
      }
      return a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0;
    });
  }, [data]);

  const chartData = useMemo(() => {
    return recommendations.map(rec => ({
      name: rec.componentName,
      impact: rec.impact,
      priority: rec.priority,
    }));
  }, [recommendations]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const recommendation = recommendations.find(r => r.componentName === label);
    if (!recommendation) return null;

    return (
      <div className={styles['optimization-tooltip']}>
        <h4>{recommendation.componentName}</h4>
        <p><strong>Type:</strong> {recommendation.type}</p>
        <p><strong>Priority:</strong> {recommendation.priority}</p>
        <p><strong>Description:</strong> {recommendation.description}</p>
        <p><strong>Potential Improvement:</strong> {recommendation.potentialImprovement}</p>
      </div>
    );
  };

  return (
    <div className={styles['optimization-container']} data-testid="optimization-recommendations">
      <div className={styles['optimization-header']}>
        <h3>Smart Optimization Recommendations</h3>
        <span>{recommendations.length} recommendations found</span>
      </div>

      <div className={styles['chart-container']}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={70}
              interval={0}
            />
            <YAxis
              label={{ value: 'Impact Score', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="impact"
              fill={(entry: { priority: 'high' | 'medium' | 'low' }) => {
                switch (entry.priority) {
                  case 'high': return '#ef5350';
                  case 'medium': return '#ff9800';
                  default: return '#4caf50';
                }
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={styles['recommendations-list']}>
        {recommendations.map((recommendation, index) => (
          <div
            key={index}
            className={`${styles['recommendation-card']} ${styles[`priority-${recommendation.priority}`]}`}
          >
            <div className={styles['recommendation-header']}>
              <h4>{recommendation.componentName}</h4>
              <span className={styles['recommendation-type']}>{recommendation.type}</span>
            </div>
            <p className={styles['recommendation-description']}>{recommendation.description}</p>
            <div className={styles['recommendation-details']}>
              <div className={styles['recommendation-impact']}>
                <label>Impact Score</label>
                <span>{recommendation.impact}%</span>
              </div>
              <div className={styles['recommendation-priority']}>
                <label>Priority</label>
                <span>{recommendation.priority}</span>
              </div>
            </div>
            <div className={styles['recommendation-improvement']}>
              <label>Potential Improvement</label>
              <p>{recommendation.potentialImprovement}</p>
            </div>
            {recommendation.affectedProps && (
              <div className={styles['affected-props']}>
                <label>Affected Props</label>
                <ul>
                  {recommendation.affectedProps.map((prop, i) => (
                    <li key={i}>{prop}</li>
                  ))}
                </ul>
              </div>
            )}
            {recommendation.suggestedCode && (
              <div className={styles['suggested-code']}>
                <label>Suggested Implementation</label>
                <pre>
                  <code>{recommendation.suggestedCode}</code>
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OptimizationRecommendations; 