import { ComponentType } from 'react';

export interface PropUsage {
  componentName: string;
  props: {
    name: string;
    type: string;
    required: boolean;
    usageCount: number;
    defaultValue?: any;
    valueChanges?: number;
    lastValue?: any;
  }[];
}

export interface PropAnalysisResult {
  components: PropUsage[];
  unusedProps: {
    componentName: string;
    propName: string;
  }[];
  propPatterns: {
    pattern: string;
    count: number;
    components: string[];
  }[];
  frequentUpdates: {
    componentName: string;
    propName: string;
    updateCount: number;
  }[];
}

export class PropAnalyzer {
  private componentCache: Map<string, PropUsage> = new Map();
  private renderCount: Map<string, number> = new Map();

  trackPropUsage(
    Component: ComponentType<any>,
    props: Record<string, any>,
    componentName: string
  ): void {
    let usage = this.componentCache.get(componentName);
    
    if (!usage) {
      usage = {
        componentName,
        props: []
      };
      this.componentCache.set(componentName, usage);
    }

    // Update render count
    this.renderCount.set(
      componentName,
      (this.renderCount.get(componentName) || 0) + 1
    );

    // Analyze props
    Object.entries(props).forEach(([name, value]) => {
      const existingProp = usage!.props.find(p => p.name === name);
      
      if (existingProp) {
        existingProp.usageCount++;
        // Track value changes
        if (value !== existingProp.lastValue) {
          existingProp.valueChanges = (existingProp.valueChanges || 0) + 1;
          existingProp.lastValue = value;
        }
      } else {
        usage!.props.push({
          name,
          type: this.getPropType(value),
          required: this.isRequired(Component, name),
          usageCount: 1,
          defaultValue: this.getDefaultValue(Component, name),
          valueChanges: 0,
          lastValue: value
        });
      }
    });
  }

  private getPropType(value: any): string {
    if (value === undefined) return 'undefined';
    if (value === null) return 'object';
    return typeof value;
  }

  private isRequired(Component: ComponentType<any>, propName: string): boolean {
    return !!(Component as any).propTypes?.[propName];
  }

  private getDefaultValue(Component: ComponentType<any>, propName: string): any {
    return (Component as any).defaultProps?.[propName];
  }

  analyzeProps(): PropAnalysisResult {
    const components = Array.from(this.componentCache.values());
    const unusedProps: { componentName: string; propName: string }[] = [];
    const propPatterns: Map<string, { count: number; components: Set<string> }> = new Map();
    const frequentUpdates: { componentName: string; propName: string; updateCount: number }[] = [];

    // Find unused props, patterns, and frequent updates
    components.forEach(component => {
      const renderCount = this.renderCount.get(component.componentName) || 0;
      
      component.props.forEach(prop => {
        // Check for unused props
        if (prop.usageCount === 0) {
          unusedProps.push({
            componentName: component.componentName,
            propName: prop.name
          });
        }

        // Identify prop patterns
        const pattern = `${prop.type}:${prop.required ? 'required' : 'optional'}`;
        const patternData = propPatterns.get(pattern) || { count: 0, components: new Set() };
        patternData.count++;
        patternData.components.add(component.componentName);
        propPatterns.set(pattern, patternData);

        // Track frequent updates
        if (prop.valueChanges && prop.valueChanges > renderCount * 0.5) {
          frequentUpdates.push({
            componentName: component.componentName,
            propName: prop.name,
            updateCount: prop.valueChanges
          });
        }
      });
    });

    return {
      components,
      unusedProps,
      propPatterns: Array.from(propPatterns.entries()).map(([pattern, data]) => ({
        pattern,
        count: data.count,
        components: Array.from(data.components)
      })),
      frequentUpdates: frequentUpdates.sort((a, b) => b.updateCount - a.updateCount)
    };
  }

  getComponentPropUsage(componentName: string): PropUsage | undefined {
    return this.componentCache.get(componentName);
  }

  getRenderCount(componentName: string): number {
    return this.renderCount.get(componentName) || 0;
  }

  reset(): void {
    this.componentCache.clear();
    this.renderCount.clear();
  }
}

// Create a singleton instance for global usage
export const propAnalyzer = new PropAnalyzer(); 