import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  TreeMap,
  Tooltip,
} from 'recharts';
import styles from '../../styles/base.module.css';
import { PropAnalysisResult } from '../../utils/propAnalysis';

interface PropPatternDetectionProps {
  data: PropAnalysisResult;
}

interface Pattern {
  id: string;
  name: string;
  value: number;
  description: string;
  components: string[];
  props: string[];
  confidence: number;
}

const PropPatternDetection: React.FC<PropPatternDetectionProps> = ({ data }) => {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);

  const patterns = useMemo(() => {
    const detectedPatterns: Pattern[] = [];

    // Detect frequently updated props pattern
    const frequentUpdates = data.components.flatMap(component =>
      component.props
        .filter(prop => (prop.valueChanges || 0) / (prop.usageCount || 1) > 0.7)
        .map(prop => ({
          componentName: component.componentName,
          propName: prop.name,
          updateRatio: (prop.valueChanges || 0) / (prop.usageCount || 1)
        }))
    );

    if (frequentUpdates.length > 0) {
      detectedPatterns.push({
        id: 'frequent-updates',
        name: 'Frequent Updates',
        value: frequentUpdates.length,
        description: 'Props that update more frequently than 70% of their usage count',
        components: [...new Set(frequentUpdates.map(u => u.componentName))],
        props: frequentUpdates.map(u => `${u.componentName}.${u.propName}`),
        confidence: 0.9
      });
    }

    // Detect unused props pattern
    if (data.unusedProps.length > 0) {
      detectedPatterns.push({
        id: 'unused-props',
        name: 'Unused Props',
        value: data.unusedProps.length,
        description: 'Props that are passed but never used',
        components: [...new Set(data.unusedProps.map(p => p.componentName))],
        props: data.unusedProps.map(p => `${p.componentName}.${p.propName}`),
        confidence: 1.0
      });
    }

    // Detect prop dependency patterns
    const propDependencies = new Map<string, Set<string>>();
    data.components.forEach(component => {
      component.props.forEach(prop => {
        if (prop.relatedProps && prop.relatedProps.length > 0) {
          const key = `${component.componentName}.${prop.name}`;
          propDependencies.set(key, new Set(prop.relatedProps));
        }
      });
    });

    if (propDependencies.size > 0) {
      detectedPatterns.push({
        id: 'prop-dependencies',
        name: 'Prop Dependencies',
        value: propDependencies.size,
        description: 'Props that frequently change together',
        components: [...new Set([...propDependencies.keys()].map(k => k.split('.')[0]))],
        props: [...propDependencies.keys()],
        confidence: 0.85
      });
    }

    return detectedPatterns;
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;
    const pattern = payload[0].payload as Pattern;
    return (
      <div className={styles['pattern-tooltip']}>
        <h4>{pattern.name}</h4>
        <p>{pattern.description}</p>
        <p>Confidence: {(pattern.confidence * 100).toFixed(1)}%</p>
        <p>Affected Components: {pattern.components.length}</p>
      </div>
    );
  };

  return (
    <div className={styles['pattern-container']} data-testid="prop-pattern-detection">
      <div className={styles['pattern-header']}>
        <h3>Prop Usage Patterns</h3>
        <span>{patterns.length} patterns detected</span>
      </div>

      <div className={styles['pattern-visualization']}>
        <ResponsiveContainer width="100%" height={300}>
          <TreeMap
            data={patterns}
            dataKey="value"
            nameKey="name"
            onClick={(data) => setSelectedPattern(data as Pattern)}
          >
            <Tooltip content={<CustomTooltip />} />
          </TreeMap>
        </ResponsiveContainer>
      </div>

      {selectedPattern && (
        <div className={styles['pattern-details']}>
          <h4>{selectedPattern.name}</h4>
          <p>{selectedPattern.description}</p>
          <div className={styles['pattern-stats']}>
            <div>
              <label>Confidence Score</label>
              <span>{(selectedPattern.confidence * 100).toFixed(1)}%</span>
            </div>
            <div>
              <label>Affected Components</label>
              <span>{selectedPattern.components.length}</span>
            </div>
          </div>
          <div className={styles['pattern-props']}>
            <h5>Affected Props</h5>
            <ul>
              {selectedPattern.props.map((prop, index) => (
                <li key={index}>{prop}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropPatternDetection; 