import { PropAnalyzer } from '../../utils/propAnalysis';
import { ComponentType } from 'react';

describe('PropAnalyzer', () => {
  let analyzer: PropAnalyzer;

  beforeEach(() => {
    analyzer = new PropAnalyzer();
  });

  describe('Basic Functionality', () => {
    it('should track prop usage correctly', () => {
      const TestComponent: ComponentType<any> = () => null;
      TestComponent.propTypes = { required: true };
      const componentName = 'TestComponent';
      const props = { required: 'value', optional: 123 };

      analyzer.trackPropUsage(TestComponent, props, componentName);
      const usage = analyzer.getComponentPropUsage(componentName);

      expect(usage).toBeDefined();
      expect(usage?.props.some(p => p.name === 'required')).toBe(true);
      expect(analyzer.getRenderCount(componentName)).toBe(1);
    });

    it('should track render counts', () => {
      const TestComponent: ComponentType<any> = () => null;
      const componentName = 'TestComponent';
      const props = { test: 'value' };

      analyzer.trackPropUsage(TestComponent, props, componentName);
      analyzer.trackPropUsage(TestComponent, props, componentName);

      expect(analyzer.getRenderCount(componentName)).toBe(2);
    });

    it('should reset analyzer state', () => {
      const TestComponent: ComponentType<any> = () => null;
      analyzer.trackPropUsage(TestComponent, { test: 'value' }, 'TestComponent');
      analyzer.reset();

      expect(analyzer.getComponentPropUsage('TestComponent')).toBeUndefined();
      expect(analyzer.getRenderCount('TestComponent')).toBe(0);
    });
  });

  describe('Prop Analysis', () => {
    it('should analyze props across components', () => {
      const Component1: ComponentType<any> = () => null;
      const Component2: ComponentType<any> = () => null;
      
      analyzer.trackPropUsage(Component1, { shared: 'value', unique1: true }, 'Component1');
      analyzer.trackPropUsage(Component2, { shared: 'value', unique2: false }, 'Component2');

      const analysis = analyzer.analyzeProps();
      expect(analysis.propPatterns.some(pattern => 
        pattern.pattern === 'string:optional' && 
        pattern.components.includes('Component1') && 
        pattern.components.includes('Component2')
      )).toBe(true);
    });

    it('should identify unused props', () => {
      const TestComponent: ComponentType<any> = () => null;
      TestComponent.propTypes = { used: true, unused: true };
      const componentName = 'TestComponent';
      const props = { used: 'value' };

      analyzer.trackPropUsage(TestComponent, props, componentName);
      const analysis = analyzer.analyzeProps();

      expect(analysis.unusedProps.some(p => 
        p.componentName === componentName && p.propName === 'unused'
      )).toBe(true);
    });

    it('should correctly identify prop types', () => {
      const TestComponent: ComponentType<any> = () => null;
      const props = {
        stringProp: 'test',
        numberProp: 42,
        booleanProp: true,
        objectProp: {},
        arrayProp: [],
        functionProp: () => {}
      };

      analyzer.trackPropUsage(TestComponent, props, 'TestComponent');
      const usage = analyzer.getComponentPropUsage('TestComponent');

      expect(usage?.props.find(p => p.name === 'stringProp')?.type).toBe('string');
      expect(usage?.props.find(p => p.name === 'numberProp')?.type).toBe('number');
      expect(usage?.props.find(p => p.name === 'booleanProp')?.type).toBe('boolean');
      expect(usage?.props.find(p => p.name === 'objectProp')?.type).toBe('object');
      expect(usage?.props.find(p => p.name === 'arrayProp')?.type).toBe('object');
      expect(usage?.props.find(p => p.name === 'functionProp')?.type).toBe('function');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined props', () => {
      const TestComponent: ComponentType<any> = () => null;
      const props = { test: undefined };

      analyzer.trackPropUsage(TestComponent, props, 'TestComponent');
      const usage = analyzer.getComponentPropUsage('TestComponent');

      expect(usage?.props.find(p => p.name === 'test')?.type).toBe('undefined');
    });

    it('should handle null props', () => {
      const TestComponent: ComponentType<any> = () => null;
      const props = { test: null };

      analyzer.trackPropUsage(TestComponent, props, 'TestComponent');
      const usage = analyzer.getComponentPropUsage('TestComponent');

      expect(usage?.props.find(p => p.name === 'test')?.type).toBe('object');
    });

    it('should handle components without propTypes', () => {
      const TestComponent: ComponentType<any> = () => null;
      const props = { test: 'value' };

      analyzer.trackPropUsage(TestComponent, props, 'TestComponent');
      const usage = analyzer.getComponentPropUsage('TestComponent');

      expect(usage?.props.find(p => p.name === 'test')?.required).toBe(false);
    });

    it('should handle multiple renders with different props', () => {
      const TestComponent: ComponentType<any> = () => null;
      const componentName = 'TestComponent';

      analyzer.trackPropUsage(TestComponent, { prop1: 'first' }, componentName);
      analyzer.trackPropUsage(TestComponent, { prop2: 'second' }, componentName);

      const usage = analyzer.getComponentPropUsage(componentName);
      expect(usage?.props).toHaveLength(2);
      expect(usage?.props.find(p => p.name === 'prop1')?.usageCount).toBe(1);
      expect(usage?.props.find(p => p.name === 'prop2')?.usageCount).toBe(1);
    });
  });

  describe('Performance Analysis', () => {
    it('should track prop value changes', () => {
      const TestComponent: ComponentType<any> = () => null;
      const componentName = 'TestComponent';
      
      analyzer.trackPropUsage(TestComponent, { test: 'value1' }, componentName);
      analyzer.trackPropUsage(TestComponent, { test: 'value2' }, componentName);

      const usage = analyzer.getComponentPropUsage(componentName);
      const prop = usage?.props.find(p => p.name === 'test');
      expect(prop?.usageCount).toBe(2);
      expect(prop?.valueChanges).toBe(1);
      expect(prop?.lastValue).toBe('value2');
    });

    it('should identify frequently changing props', () => {
      const TestComponent: ComponentType<any> = () => null;
      const componentName = 'TestComponent';
      
      for (let i = 0; i < 5; i++) {
        analyzer.trackPropUsage(TestComponent, { changing: i, stable: 'value' }, componentName);
      }

      const analysis = analyzer.analyzeProps();
      const frequentUpdates = analysis.frequentUpdates;
      
      expect(frequentUpdates).toHaveLength(1);
      expect(frequentUpdates[0]).toEqual({
        componentName,
        propName: 'changing',
        updateCount: 4 // 5 renders with 4 changes
      });
    });

    it('should track value changes across multiple components', () => {
      const Component1: ComponentType<any> = () => null;
      const Component2: ComponentType<any> = () => null;
      
      // Component1 with frequently changing prop
      for (let i = 0; i < 4; i++) {
        analyzer.trackPropUsage(Component1, { data: i }, 'Component1');
      }

      // Component2 with stable props
      for (let i = 0; i < 4; i++) {
        analyzer.trackPropUsage(Component2, { data: 'stable' }, 'Component2');
      }

      const analysis = analyzer.analyzeProps();
      expect(analysis.frequentUpdates).toHaveLength(1);
      expect(analysis.frequentUpdates[0].componentName).toBe('Component1');
    });

    it('should calculate change frequency relative to render count', () => {
      const TestComponent: ComponentType<any> = () => null;
      const componentName = 'TestComponent';
      
      // 10 renders with 3 value changes (30% change rate)
      for (let i = 0; i < 10; i++) {
        analyzer.trackPropUsage(
          TestComponent, 
          { data: i < 3 ? i : 'stable' }, 
          componentName
        );
      }

      const analysis = analyzer.analyzeProps();
      // Should not be in frequentUpdates as change rate < 50%
      expect(analysis.frequentUpdates).toHaveLength(0);
    });

    it('should handle reference type props correctly', () => {
      const TestComponent: ComponentType<any> = () => null;
      const componentName = 'TestComponent';
      
      const obj1 = { id: 1 };
      const obj2 = { id: 1 };
      const arr1 = [1, 2, 3];
      const arr2 = [1, 2, 3];

      analyzer.trackPropUsage(TestComponent, { obj: obj1, arr: arr1 }, componentName);
      analyzer.trackPropUsage(TestComponent, { obj: obj2, arr: arr2 }, componentName);

      const usage = analyzer.getComponentPropUsage(componentName);
      expect(usage?.props.find(p => p.name === 'obj')?.valueChanges).toBe(1);
      expect(usage?.props.find(p => p.name === 'arr')?.valueChanges).toBe(1);
    });
  });
}); 