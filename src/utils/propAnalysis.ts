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

interface PropInfo {
  name: string;
  type: string;
  required: boolean;
  usageCount: number;
  defaultValue?: any;
  valueChanges?: number;
  lastValue?: {
    timestamp: number;
    value: any;
    renderCount: number;
  };
  valueHistory?: {
    timestamp: number;
    value: any;
    renderCount: number;
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
  private memoizedAnalysis: PropAnalysisResult | null = null;
  private lastAnalysisTimestamp: number = 0;
  private lastUpdateTimestamp: number = 0;
  private batchedUpdates: Map<string, Set<string>> = new Map();
  private readonly CACHE_THRESHOLD = 1000; // 1 second
  private readonly BATCH_THRESHOLD = 16; // ~1 frame at 60fps

  trackPropUsage(
    Component: ComponentType<any>,
    props: Record<string, any>,
    componentName: string
  ): void {
    this.lastUpdateTimestamp = Date.now();
    
    // Add to batch
    if (!this.batchedUpdates.has(componentName)) {
      this.batchedUpdates.set(componentName, new Set());
    }
    Object.keys(props).forEach(propName => 
      this.batchedUpdates.get(componentName)!.add(propName)
    );

    // Process batch if threshold exceeded
    if (this.shouldProcessBatch()) {
      this.processBatchedUpdates();
    }

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
        if (!this.areValuesEqual(value, existingProp.lastValue)) {
          existingProp.valueChanges = (existingProp.valueChanges || 0) + 1;
          existingProp.lastValue = this.cloneValue(value);
        }
      } else {
        usage!.props.push({
          name,
          type: this.getPropType(value),
          required: this.isRequired(Component, name),
          usageCount: 1,
          defaultValue: this.getDefaultValue(Component, name),
          valueChanges: 0,
          lastValue: this.cloneValue(value)
        });
      }
    });

    // Invalidate memoized analysis
    this.memoizedAnalysis = null;
  }

  private shouldProcessBatch(): boolean {
    return Date.now() - this.lastUpdateTimestamp >= this.BATCH_THRESHOLD;
  }

  private processBatchedUpdates(): void {
    this.batchedUpdates.clear();
  }

  private areValuesEqual(value1: any, value2: any): boolean {
    if (value1 === value2) return true;
    if (typeof value1 !== typeof value2) return false;
    if (typeof value1 !== 'object') return false;
    if (value1 === null || value2 === null) return false;

    if (Array.isArray(value1) && Array.isArray(value2)) {
      return value1.length === value2.length &&
        value1.every((v, i) => this.areValuesEqual(v, value2[i]));
    }

    const keys1 = Object.keys(value1);
    const keys2 = Object.keys(value2);
    return keys1.length === keys2.length &&
      keys1.every(key => this.areValuesEqual(value1[key], value2[key]));
  }

  private cloneValue(value: any): any {
    if (typeof value !== 'object' || value === null) return value;
    if (Array.isArray(value)) return [...value];
    return { ...value };
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
    const currentTime = Date.now();
    
    // Return memoized result if within threshold
    if (
      this.memoizedAnalysis &&
      currentTime - this.lastAnalysisTimestamp < this.CACHE_THRESHOLD &&
      currentTime - this.lastUpdateTimestamp > this.BATCH_THRESHOLD
    ) {
      return this.memoizedAnalysis;
    }

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

    this.memoizedAnalysis = {
      components,
      unusedProps,
      propPatterns: Array.from(propPatterns.entries()).map(([pattern, data]) => ({
        pattern,
        count: data.count,
        components: Array.from(data.components)
      })),
      frequentUpdates: frequentUpdates.sort((a, b) => b.updateCount - a.updateCount)
    };

    this.lastAnalysisTimestamp = currentTime;
    return this.memoizedAnalysis;
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
    this.memoizedAnalysis = null;
    this.lastAnalysisTimestamp = 0;
    this.lastUpdateTimestamp = 0;
    this.batchedUpdates.clear();
  }
}

// Create a singleton instance for global usage
export const propAnalyzer = new PropAnalyzer(); 