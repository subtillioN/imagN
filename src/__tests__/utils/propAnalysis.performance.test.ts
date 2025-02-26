import { PropAnalyzer } from '../../utils/propAnalysis';
import { ComponentType } from 'react';

describe('PropAnalyzer Performance', () => {
  let analyzer: PropAnalyzer;
  let startTime: number;

  beforeEach(() => {
    analyzer = new PropAnalyzer();
    startTime = Date.now();
  });

  afterEach(() => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    // Each test should complete within 100ms
    expect(duration).toBeLessThan(100);
  });

  describe('Analysis Memoization', () => {
    it('should return cached results for repeated calls within threshold', () => {
      const TestComponent: ComponentType<any> = () => null;
      analyzer.trackPropUsage(TestComponent, { test: 'value' }, 'TestComponent');
      
      const firstAnalysis = analyzer.analyzeProps();
      const secondAnalysis = analyzer.analyzeProps();
      
      // Should return the exact same object reference
      expect(secondAnalysis).toBe(firstAnalysis);
    });

    it('should recompute analysis after threshold', async () => {
      const TestComponent: ComponentType<any> = () => null;
      analyzer.trackPropUsage(TestComponent, { test: 'value' }, 'TestComponent');
      
      const firstAnalysis = analyzer.analyzeProps();
      
      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const secondAnalysis = analyzer.analyzeProps();
      
      // Should be different object references
      expect(secondAnalysis).not.toBe(firstAnalysis);
      // But should have the same content
      expect(secondAnalysis).toEqual(firstAnalysis);
    });

    it('should recompute when new data is added', () => {
      const TestComponent: ComponentType<any> = () => null;
      analyzer.trackPropUsage(TestComponent, { test: 'value1' }, 'TestComponent');
      
      const firstAnalysis = analyzer.analyzeProps();
      
      analyzer.trackPropUsage(TestComponent, { test: 'value2' }, 'TestComponent');
      const secondAnalysis = analyzer.analyzeProps();
      
      // Should be different object references and content
      expect(secondAnalysis).not.toBe(firstAnalysis);
      expect(secondAnalysis.components[0].props[0].valueChanges).toBe(1);
    });
  });

  describe('Batch Processing', () => {
    it('should handle multiple prop updates efficiently', () => {
      const TestComponent: ComponentType<any> = () => null;
      const updates = Array.from({ length: 1000 }, (_, i) => ({
        props: { value: i },
        timestamp: Date.now() + i
      }));
      
      const startTime = Date.now();
      updates.forEach(update => {
        analyzer.trackPropUsage(TestComponent, update.props, 'TestComponent');
      });
      const endTime = Date.now();
      
      // Should process 1000 updates in less than 50ms
      expect(endTime - startTime).toBeLessThan(50);
    });
  });

  describe('Memory Usage', () => {
    it('should maintain reasonable memory usage for long sessions', () => {
      const TestComponent: ComponentType<any> = () => null;
      const componentCount = 100;
      const updatesPerComponent = 100;
      
      // Simulate many components with many updates
      for (let i = 0; i < componentCount; i++) {
        const componentName = `TestComponent${i}`;
        for (let j = 0; j < updatesPerComponent; j++) {
          analyzer.trackPropUsage(TestComponent, { value: j }, componentName);
        }
      }
      
      const analysis = analyzer.analyzeProps();
      
      // Verify we're not storing unnecessary data
      expect(analysis.components.length).toBe(componentCount);
      analysis.components.forEach(component => {
        expect(component.props.length).toBeLessThanOrEqual(100);
        component.props.forEach(prop => {
          // Should only store current value, not history
          expect(Object.keys(prop).length).toBeLessThanOrEqual(7);
        });
      });
    });
  });
}); 