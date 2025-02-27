export interface PropUsage {
  name: string;
  type: string;
  valueChanges?: number;
  usageCount?: number;
}

export interface ComponentUsage {
  componentName: string;
  props: PropUsage[];
}

export interface UnusedProp {
  componentName: string;
  propName: string;
}

export interface PropPattern {
  type: 'update' | 'value';
  frequency: number;
}

export interface FrequentUpdate {
  componentName: string;
  propName: string;
}

export interface PropAnalysisResult {
  components: ComponentUsage[];
  unusedProps: UnusedProp[];
  propPatterns: PropPattern[];
  frequentUpdates: FrequentUpdate[];
}

export class PropAnalyzer {
  private static instance: PropAnalyzer;

  private constructor() {}

  public static getInstance(): PropAnalyzer {
    if (!PropAnalyzer.instance) {
      PropAnalyzer.instance = new PropAnalyzer();
    }
    return PropAnalyzer.instance;
  }

  public analyze(): PropAnalysisResult {
    // Implementation will be added later
    return {
      components: [],
      unusedProps: [],
      propPatterns: [],
      frequentUpdates: []
    };
  }
} 