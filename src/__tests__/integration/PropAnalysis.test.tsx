import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PropAnalyzer } from '../../utils/propAnalysis';
import MonitoringDashboard from '../../components/DevTools/MonitoringDashboard';
import OptimizationRecommendations from '../../components/DevTools/OptimizationRecommendations';
import RenderImpactAnalysis from '../../components/DevTools/RenderImpactAnalysis';
import userEvent from '@testing-library/user-event';
import ReactDOM from 'react-dom';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// Add DevTools interface
interface DevToolsInterface {
  addPanel: jest.Mock;
  removePanel: jest.Mock;
  onUpdate: jest.Mock;
}

// Extend MonitoringDashboard props
interface ExtendedMonitoringDashboardProps {
  devTools?: DevToolsInterface;
  data: any;
}

// Create a new component that extends MonitoringDashboard
const MonitoringDashboardWithDevTools: React.FC<ExtendedMonitoringDashboardProps> = ({ devTools, data }) => {
  React.useEffect(() => {
    if (devTools) {
      devTools.addPanel({
        id: 'prop-analysis',
        title: 'Prop Analysis'
      });
      return () => devTools.removePanel('prop-analysis');
    }
  }, [devTools]);

  React.useEffect(() => {
    if (devTools) {
      devTools.onUpdate({ data });
    }
  }, [devTools, data]);

  return <MonitoringDashboard data={data} />;
};

// Update MonitoringDashboard type
// Mock components that use charts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Treemap: ({ children }: { children: React.ReactNode }) => <div data-testid="treemap">{children}</div>,
  Line: () => null,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

// Mock test component with props
const TestComponent: React.FC<{ value: string; onUpdate: () => void }> = ({ value, onUpdate }) => (
  <div onClick={onUpdate}>{value}</div>
);

// Mock test components with props
const ComplexComponent: React.FC<{
  stringProp: string;
  numberProp: number;
  objectProp: object;
  arrayProp: any[];
  functionProp: () => void;
  nullableProp?: string | null;
}> = ({ stringProp, numberProp, objectProp, arrayProp, functionProp, nullableProp }) => (
  <div onClick={functionProp}>
    {stringProp} {numberProp} {JSON.stringify(objectProp)} {JSON.stringify(arrayProp)} {nullableProp}
  </div>
);

describe('Prop Analysis Integration', () => {
  let analyzer: PropAnalyzer;

  beforeEach(() => {
    analyzer = new PropAnalyzer();
  });

  describe('PropAnalyzer', () => {
    it('should track prop changes', () => {
      const { rerender } = render(<TestComponent value="initial" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "initial", onUpdate: () => {} }, "TestComponent");
      
      rerender(<TestComponent value="updated" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "updated", onUpdate: () => {} }, "TestComponent");

      const analysis = analyzer.analyzeProps();
      expect(analysis.components[0].props[0].valueChanges).toBe(1);
    });

    it('should detect frequent updates', () => {
      const { rerender } = render(<TestComponent value="initial" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "initial", onUpdate: () => {} }, "TestComponent");
      
      // Simulate multiple updates
      for (let i = 0; i < 10; i++) {
        rerender(<TestComponent value={`update-${i}`} onUpdate={() => {}} />);
        analyzer.trackPropUsage(TestComponent, { value: `update-${i}`, onUpdate: () => {} }, "TestComponent");
      }

      const analysis = analyzer.analyzeProps();
      expect(analysis.frequentUpdates.length).toBeGreaterThan(0);
    });

    it('should track prop patterns', () => {
      const { rerender } = render(<TestComponent value="A" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "A", onUpdate: () => {} }, "TestComponent");
      
      // Create a pattern: A -> B -> C -> A
      rerender(<TestComponent value="B" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "B", onUpdate: () => {} }, "TestComponent");
      
      rerender(<TestComponent value="C" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "C", onUpdate: () => {} }, "TestComponent");
      
      rerender(<TestComponent value="A" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "A", onUpdate: () => {} }, "TestComponent");

      const analysis = analyzer.analyzeProps();
      expect(analysis.propPatterns.length).toBeGreaterThan(0);
    });
  });

  describe('PropAnalyzer Edge Cases', () => {
    it('should handle null and undefined props', () => {
      const { rerender } = render(
        <ComplexComponent
          stringProp="test"
          numberProp={1}
          objectProp={{}}
          arrayProp={[]}
          functionProp={() => {}}
          nullableProp={undefined}
        />
      );
      analyzer.trackPropUsage(
        ComplexComponent,
        {
          stringProp: "test",
          numberProp: 1,
          objectProp: {},
          arrayProp: [],
          functionProp: () => {},
          nullableProp: undefined
        },
        "ComplexComponent"
      );

      rerender(
        <ComplexComponent
          stringProp="test"
          numberProp={1}
          objectProp={{}}
          arrayProp={[]}
          functionProp={() => {}}
          nullableProp={null}
        />
      );
      analyzer.trackPropUsage(
        ComplexComponent,
        {
          stringProp: "test",
          numberProp: 1,
          objectProp: {},
          arrayProp: [],
          functionProp: () => {},
          nullableProp: null
        },
        "ComplexComponent"
      );

      const analysis = analyzer.analyzeProps();
      expect(analysis.components[0].props.find(p => p.name === 'nullableProp')?.valueChanges).toBe(1);
    });

    it('should track different prop types correctly', () => {
      const initialProps = {
        stringProp: "test",
        numberProp: 1,
        objectProp: { key: "value" },
        arrayProp: [1, 2, 3],
        functionProp: () => {},
      };

      const updatedProps = {
        stringProp: "updated",
        numberProp: 2,
        objectProp: { key: "new value" },
        arrayProp: [4, 5, 6],
        functionProp: () => {},
      };

      const { rerender } = render(<ComplexComponent {...initialProps} />);
      analyzer.trackPropUsage(ComplexComponent, initialProps, "ComplexComponent");

      rerender(<ComplexComponent {...updatedProps} />);
      analyzer.trackPropUsage(ComplexComponent, updatedProps, "ComplexComponent");

      const analysis = analyzer.analyzeProps();
      expect(analysis.components[0].props.find(p => p.name === 'stringProp')?.valueChanges).toBe(1);
      expect(analysis.components[0].props.find(p => p.name === 'numberProp')?.valueChanges).toBe(1);
      expect(analysis.components[0].props.find(p => p.name === 'objectProp')?.valueChanges).toBe(1);
      expect(analysis.components[0].props.find(p => p.name === 'arrayProp')?.valueChanges).toBe(1);
    });

    it('should handle reset functionality', () => {
      const { rerender } = render(<TestComponent value="initial" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "initial", onUpdate: () => {} }, "TestComponent");
      
      let analysis = analyzer.analyzeProps();
      expect(analysis.components.length).toBe(1);

      analyzer.reset();
      analysis = analyzer.analyzeProps();
      expect(analysis.components.length).toBe(0);
    });
  });

  describe('MonitoringDashboard', () => {
    it('should render real-time metrics', async () => {
      const { rerender } = render(<TestComponent value="initial" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "initial", onUpdate: () => {} }, "TestComponent");

      const initialData = analyzer.analyzeProps();
      render(<MonitoringDashboard data={initialData} />);
      
      // Initial render
      expect(screen.getByTestId('monitoring-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();

      // Simulate component updates
      for (let i = 0; i < 5; i++) {
        rerender(<TestComponent value={`update-${i}`} onUpdate={() => {}} />);
        analyzer.trackPropUsage(TestComponent, { value: `update-${i}`, onUpdate: () => {} }, "TestComponent");
      }

      // Wait for metrics update
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
      });

      expect(screen.getByText(/Components Tracked/)).toBeInTheDocument();
      expect(screen.getByText(/Props Monitored/)).toBeInTheDocument();
    });

    it('should show alerts for performance issues', async () => {
      const { rerender } = render(<TestComponent value="initial" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "initial", onUpdate: () => {} }, "TestComponent");

      const initialData = analyzer.analyzeProps();
      render(<MonitoringDashboard data={initialData} />);

      // Simulate rapid updates
      for (let i = 0; i < 20; i++) {
        rerender(<TestComponent value={`rapid-update-${i}`} onUpdate={() => {}} />);
        analyzer.trackPropUsage(TestComponent, { value: `rapid-update-${i}`, onUpdate: () => {} }, "TestComponent");
      }

      // Wait for alert generation
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
      });

      expect(screen.getByText(/Frequent Updates/i)).toBeInTheDocument();
    });
  });

  describe('MonitoringDashboard Extended', () => {
    it('should handle empty state', () => {
      analyzer.reset();
      const emptyData = analyzer.analyzeProps();
      render(<MonitoringDashboard data={emptyData} />);
      
      expect(screen.getByText(/No components tracked/i)).toBeInTheDocument();
    });

    it('should update metrics on data refresh', async () => {
      const { rerender } = render(<TestComponent value="initial" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "initial", onUpdate: () => {} }, "TestComponent");

      const { rerender: dashboardRerender } = render(
        <MonitoringDashboard data={analyzer.analyzeProps()} />
      );

      // Update component and refresh dashboard
      rerender(<TestComponent value="updated" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "updated", onUpdate: () => {} }, "TestComponent");
      
      dashboardRerender(<MonitoringDashboard data={analyzer.analyzeProps()} />);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(screen.getByText(/1 prop change/i)).toBeInTheDocument();
    });
  });

  describe('OptimizationRecommendations', () => {
    it('should suggest optimizations for frequently updating components', async () => {
      const { rerender } = render(<TestComponent value="initial" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "initial", onUpdate: () => {} }, "TestComponent");

      // Create a component with frequent updates
      for (let i = 0; i < 10; i++) {
        rerender(<TestComponent value={`update-${i}`} onUpdate={() => {}} />);
        analyzer.trackPropUsage(TestComponent, { value: `update-${i}`, onUpdate: () => {} }, "TestComponent");
      }

      render(<OptimizationRecommendations data={analyzer.analyzeProps()} />);

      expect(screen.getByText(/memoization/i)).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('should provide code examples for optimizations', () => {
      const { rerender } = render(<TestComponent value="initial" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "initial", onUpdate: () => {} }, "TestComponent");

      render(<OptimizationRecommendations data={analyzer.analyzeProps()} />);

      expect(screen.getByText(/React.memo/i)).toBeInTheDocument();
    });
  });

  describe('OptimizationRecommendations Extended', () => {
    it('should prioritize recommendations by impact', async () => {
      // Component with high-frequency updates
      const { rerender } = render(<TestComponent value="initial" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "initial", onUpdate: () => {} }, "TestComponent");

      // Create many updates to generate high-impact suggestion
      for (let i = 0; i < 50; i++) {
        rerender(<TestComponent value={`rapid-${i}`} onUpdate={() => {}} />);
        analyzer.trackPropUsage(TestComponent, { value: `rapid-${i}`, onUpdate: () => {} }, "TestComponent");
      }

      render(<OptimizationRecommendations data={analyzer.analyzeProps()} />);

      const suggestions = screen.getAllByText(/optimization/i);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(screen.getByText(/high impact/i)).toBeInTheDocument();
    });

    it('should handle empty optimization state', () => {
      analyzer.reset();
      render(<OptimizationRecommendations data={analyzer.analyzeProps()} />);
      expect(screen.getByText(/No optimization suggestions/i)).toBeInTheDocument();
    });
  });

  describe('RenderImpactAnalysis', () => {
    it('should analyze render impact of prop changes', async () => {
      const { rerender } = render(<TestComponent value="initial" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "initial", onUpdate: () => {} }, "TestComponent");

      // Create components with prop updates
      for (let i = 0; i < 5; i++) {
        rerender(<TestComponent value={`update-${i}`} onUpdate={() => {}} />);
        analyzer.trackPropUsage(TestComponent, { value: `update-${i}`, onUpdate: () => {} }, "TestComponent");
      }

      render(<RenderImpactAnalysis data={analyzer.analyzeProps()} />);

      expect(screen.getByTestId('render-impact-analysis')).toBeInTheDocument();
      expect(screen.getByTestId('treemap')).toBeInTheDocument();
    });

    it('should identify cascading effects', async () => {
      // Create nested components with prop updates
      const ChildComponent = ({ value }: { value: string }) => <div>{value}</div>;
      const ParentComponent = ({ value }: { value: string }) => (
        <div>
          <ChildComponent value={value} />
          <ChildComponent value={value} />
        </div>
      );

      const { rerender } = render(<ParentComponent value="initial" />);
      analyzer.trackPropUsage(ParentComponent, { value: "initial" }, "ParentComponent");
      analyzer.trackPropUsage(ChildComponent, { value: "initial" }, "ChildComponent");

      for (let i = 0; i < 5; i++) {
        rerender(<ParentComponent value={`update-${i}`} />);
        analyzer.trackPropUsage(ParentComponent, { value: `update-${i}` }, "ParentComponent");
        analyzer.trackPropUsage(ChildComponent, { value: `update-${i}` }, "ChildComponent");
      }

      render(<RenderImpactAnalysis data={analyzer.analyzeProps()} />);

      expect(screen.getByText(/Cascading Effects/i)).toBeInTheDocument();
    });
  });

  describe('RenderImpactAnalysis Extended', () => {
    it('should analyze deep component trees', async () => {
      // Create a deep component tree
      const LeafComponent = ({ value }: { value: string }) => <div>{value}</div>;
      const BranchComponent = ({ value }: { value: string }) => (
        <div>
          <LeafComponent value={value} />
          <LeafComponent value={value} />
        </div>
      );
      const TreeComponent = ({ value }: { value: string }) => (
        <div>
          <BranchComponent value={value} />
          <BranchComponent value={value} />
        </div>
      );

      const { rerender } = render(<TreeComponent value="initial" />);
      analyzer.trackPropUsage(TreeComponent, { value: "initial" }, "TreeComponent");
      analyzer.trackPropUsage(BranchComponent, { value: "initial" }, "BranchComponent");
      analyzer.trackPropUsage(LeafComponent, { value: "initial" }, "LeafComponent");

      for (let i = 0; i < 3; i++) {
        rerender(<TreeComponent value={`update-${i}`} />);
        analyzer.trackPropUsage(TreeComponent, { value: `update-${i}` }, "TreeComponent");
        analyzer.trackPropUsage(BranchComponent, { value: `update-${i}` }, "BranchComponent");
        analyzer.trackPropUsage(LeafComponent, { value: `update-${i}` }, "LeafComponent");
      }

      render(<RenderImpactAnalysis data={analyzer.analyzeProps()} />);

      expect(screen.getByText(/Propagation Depth/i)).toBeInTheDocument();
      expect(screen.getByText(/3 levels/i)).toBeInTheDocument();
    });

    it('should identify performance thresholds', async () => {
      const { rerender } = render(<TestComponent value="initial" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "initial", onUpdate: () => {} }, "TestComponent");

      // Generate high-frequency updates
      for (let i = 0; i < 100; i++) {
        rerender(<TestComponent value={`high-freq-${i}`} onUpdate={() => {}} />);
        analyzer.trackPropUsage(TestComponent, { value: `high-freq-${i}`, onUpdate: () => {} }, "TestComponent");
      }

      render(<RenderImpactAnalysis data={analyzer.analyzeProps()} />);

      expect(screen.getByText(/Performance Warning/i)).toBeInTheDocument();
      expect(screen.getByText(/Exceeds recommended update frequency/i)).toBeInTheDocument();
    });
  });

  describe('Snapshot Tests', () => {
    it('should match MonitoringDashboard snapshot', () => {
      const { rerender } = render(<TestComponent value="test" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "test", onUpdate: () => {} }, "TestComponent");
      
      const { container } = render(<MonitoringDashboard data={analyzer.analyzeProps()} />);
      expect(container).toMatchSnapshot();
    });

    it('should match OptimizationRecommendations snapshot', () => {
      const { rerender } = render(<TestComponent value="test" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "test", onUpdate: () => {} }, "TestComponent");
      
      const { container } = render(<OptimizationRecommendations data={analyzer.analyzeProps()} />);
      expect(container).toMatchSnapshot();
    });

    it('should match RenderImpactAnalysis snapshot', () => {
      const { rerender } = render(<TestComponent value="test" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "test", onUpdate: () => {} }, "TestComponent");
      
      const { container } = render(<RenderImpactAnalysis data={analyzer.analyzeProps()} />);
      expect(container).toMatchSnapshot();
    });
  });

  describe('User Interactions', () => {
    it('should show detailed metrics on chart hover', async () => {
      const { rerender } = render(<TestComponent value="initial" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "initial", onUpdate: () => {} }, "TestComponent");

      render(<MonitoringDashboard data={analyzer.analyzeProps()} />);
      
      const chart = screen.getByTestId('line-chart');
      await userEvent.hover(chart);
      
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByText(/Render Count/i)).toBeInTheDocument();
    });

    it('should expand optimization details on click', async () => {
      const { rerender } = render(<TestComponent value="initial" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "initial", onUpdate: () => {} }, "TestComponent");

      render(<OptimizationRecommendations data={analyzer.analyzeProps()} />);
      
      const suggestion = screen.getByText(/optimization/i);
      await userEvent.click(suggestion);
      
      expect(screen.getByText(/Implementation Steps/i)).toBeInTheDocument();
      expect(screen.getByText(/Expected Impact/i)).toBeInTheDocument();
    });

    it('should show component details in impact analysis on node click', async () => {
      const { rerender } = render(<TestComponent value="initial" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "initial", onUpdate: () => {} }, "TestComponent");

      render(<RenderImpactAnalysis data={analyzer.analyzeProps()} />);
      
      const node = screen.getByText(/TestComponent/i);
      await userEvent.click(node);
      
      expect(screen.getByText(/Render Frequency/i)).toBeInTheDocument();
      expect(screen.getByText(/Update Pattern/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid data gracefully', () => {
      const invalidData = { components: [], unusedProps: [], propPatterns: [], frequentUpdates: [] };
      render(<MonitoringDashboard data={invalidData} />);
      
      expect(screen.getByText(/No data available/i)).toBeInTheDocument();
    });

    it('should recover from rendering errors', () => {
      const { rerender } = render(<TestComponent value="initial" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "initial", onUpdate: () => {} }, "TestComponent");

      const data = analyzer.analyzeProps();
      // Simulate a rendering error by providing malformed chart data
      data.components[0].props[0].valueChanges = NaN;

      render(<RenderImpactAnalysis data={data} />);
      
      expect(screen.getByText(/Unable to render chart/i)).toBeInTheDocument();
    });

    it('should handle API errors', async () => {
      const { rerender } = render(<TestComponent value="initial" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "initial", onUpdate: () => {} }, "TestComponent");

      // Simulate an error in analyzeProps
      jest.spyOn(analyzer, 'analyzeProps').mockImplementationOnce(() => {
        throw new Error('Analysis failed');
      });

      render(<OptimizationRecommendations data={analyzer.analyzeProps()} />);
      
      expect(screen.getByText(/Error analyzing props/i)).toBeInTheDocument();
    });
  });

  describe('Tooltip Content', () => {
    it('should display accurate metrics in tooltips', async () => {
      const { rerender } = render(<TestComponent value="initial" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "initial", onUpdate: () => {} }, "TestComponent");

      for (let i = 0; i < 5; i++) {
        rerender(<TestComponent value={`update-${i}`} onUpdate={() => {}} />);
        analyzer.trackPropUsage(TestComponent, { value: `update-${i}`, onUpdate: () => {} }, "TestComponent");
      }

      render(<MonitoringDashboard data={analyzer.analyzeProps()} />);
      
      const dataPoint = screen.getByTestId('data-point');
      await userEvent.hover(dataPoint);
      
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent('5 updates');
      expect(tooltip).toHaveTextContent('TestComponent');
    });

    it('should show detailed optimization steps in tooltips', async () => {
      const { rerender } = render(<TestComponent value="initial" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "initial", onUpdate: () => {} }, "TestComponent");

      render(<OptimizationRecommendations data={analyzer.analyzeProps()} />);
      
      const recommendationIcon = screen.getByTestId('recommendation-icon');
      await userEvent.hover(recommendationIcon);
      
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toHaveTextContent(/Step 1/i);
      expect(tooltip).toHaveTextContent(/React.memo/i);
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      const WrappedDashboard = React.memo(() => {
        renderSpy();
        return <MonitoringDashboard data={analyzer.analyzeProps()} />;
      });
      
      const { rerender } = render(<WrappedDashboard />);
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      rerender(<WrappedDashboard />);
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    it('should optimize render performance with useMemo', () => {
      const renderSpy = jest.fn();
      
      const TestWrapper = () => {
        const data = React.useMemo(() => analyzer.analyzeProps(), []);
        renderSpy();
        return <MonitoringDashboard data={data} />;
      };

      const { rerender } = render(<TestWrapper />);
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      rerender(<TestWrapper />);
      expect(renderSpy).toHaveBeenCalledTimes(2); // Only parent re-renders
    });
  });

  describe('DevTools Integration', () => {
    const mockDevTools: DevToolsInterface = {
      addPanel: jest.fn(),
      removePanel: jest.fn(),
      onUpdate: jest.fn()
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should register with DevTools panel', () => {
      render(<MonitoringDashboardWithDevTools devTools={mockDevTools} data={analyzer.analyzeProps()} />);
      expect(mockDevTools.addPanel).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'prop-analysis',
          title: 'Prop Analysis'
        })
      );
    });

    it('should cleanup on unmount', () => {
      const { unmount } = render(
        <MonitoringDashboardWithDevTools devTools={mockDevTools} data={analyzer.analyzeProps()} />
      );
      unmount();
      expect(mockDevTools.removePanel).toHaveBeenCalledWith('prop-analysis');
    });

    it('should sync state with DevTools', () => {
      const { rerender } = render(
        <MonitoringDashboardWithDevTools devTools={mockDevTools} data={analyzer.analyzeProps()} />
      );
      
      const newData = analyzer.analyzeProps();
      rerender(<MonitoringDashboardWithDevTools devTools={mockDevTools} data={newData} />);
      
      expect(mockDevTools.onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ data: newData })
      );
    });
  });

  describe('Concurrent Mode', () => {
    it('should handle concurrent updates gracefully', async () => {
      const { rerender } = render(<TestComponent value="initial" onUpdate={() => {}} />);
      
      // Simulate concurrent updates
      await Promise.all([
        act(async () => {
          rerender(<TestComponent value="update1" onUpdate={() => {}} />);
          analyzer.trackPropUsage(TestComponent, { value: "update1" }, "TestComponent");
        }),
        act(async () => {
          rerender(<TestComponent value="update2" onUpdate={() => {}} />);
          analyzer.trackPropUsage(TestComponent, { value: "update2" }, "TestComponent");
        })
      ]);

      const analysis = analyzer.analyzeProps();
      expect(analysis.components[0].props[0].valueChanges).toBe(2);
    });

    it('should maintain state consistency during concurrent updates', async () => {
      const { rerender } = render(<TestComponent value="initial" onUpdate={() => {}} />);
      analyzer.trackPropUsage(TestComponent, { value: "initial" }, "TestComponent");

      let analysisResults: any[] = [];
      
      // Create multiple concurrent updates
      await Promise.all(
        Array.from({ length: 5 }, async (_, i) => {
          await act(async () => {
            rerender(<TestComponent value={`update-${i}`} onUpdate={() => {}} />);
            analyzer.trackPropUsage(TestComponent, { value: `update-${i}` }, "TestComponent");
            analysisResults.push(analyzer.analyzeProps());
          });
        })
      );

      // Verify state consistency
      expect(analysisResults.every(result => 
        result.components[0].props[0].type === 'string'
      )).toBe(true);
    });
  });

  describe('Memory Management', () => {
    it('should clean up resources on unmount', () => {
      const { unmount } = render(<MonitoringDashboard data={analyzer.analyzeProps()} />);
      const initialMemory = process.memoryUsage().heapUsed;
      
      unmount();
      
      // Force garbage collection if supported
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      expect(finalMemory).toBeLessThanOrEqual(initialMemory);
    });

    it('should not leak memory during updates', () => {
      const { rerender } = render(<TestComponent value="initial" onUpdate={() => {}} />);
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Perform many updates
      for (let i = 0; i < 1000; i++) {
        rerender(<TestComponent value={`update-${i}`} onUpdate={() => {}} />);
        analyzer.trackPropUsage(TestComponent, { value: `update-${i}` }, "TestComponent");
      }

      const finalMemory = process.memoryUsage().heapUsed;
      // Memory growth should be reasonable (less than 10MB)
      expect(finalMemory - initialMemory).toBeLessThan(10 * 1024 * 1024);
    });
  });

  describe('Batch Updates', () => {
    it('should handle batched prop changes efficiently', () => {
      const updateStartTime = performance.now();
      
      act(() => {
        ReactDOM.unstable_batchedUpdates(() => {
          for (let i = 0; i < 10; i++) {
            analyzer.trackPropUsage(TestComponent, { value: `update-${i}` }, "TestComponent");
          }
        });
      });

      const updateEndTime = performance.now();
      expect(updateEndTime - updateStartTime).toBeLessThan(100); // Should complete within 100ms
    });

    it('should maintain state consistency in batched updates', () => {
      const updates = Array.from({ length: 10 }, (_, i) => ({
        value: `update-${i}`,
        timestamp: Date.now() + i
      }));

      act(() => {
        ReactDOM.unstable_batchedUpdates(() => {
          updates.forEach(update => {
            analyzer.trackPropUsage(TestComponent, { value: update.value }, "TestComponent");
          });
        });
      });

      const analysis = analyzer.analyzeProps();
      expect(analysis.components[0].props[0].valueChanges).toBe(updates.length - 1);
    });
  });

  describe('Stress Testing', () => {
    it('should handle large numbers of updates', async () => {
      const LARGE_UPDATE_COUNT = 1000;
      const startTime = performance.now();
      
      for (let i = 0; i < LARGE_UPDATE_COUNT; i++) {
        analyzer.trackPropUsage(TestComponent, { value: `update-${i}` }, "TestComponent");
      }

      const analysis = analyzer.analyzeProps();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(analysis.components[0].props[0].valueChanges).toBe(LARGE_UPDATE_COUNT - 1);
    });

    it('should maintain accuracy under load', async () => {
      const COMPONENT_COUNT = 100;
      const UPDATE_COUNT = 100;
      
      // Create multiple components with multiple updates
      for (let i = 0; i < COMPONENT_COUNT; i++) {
        const ComponentName = `TestComponent${i}`;
        for (let j = 0; j < UPDATE_COUNT; j++) {
          analyzer.trackPropUsage(
            TestComponent,
            { value: `update-${j}` },
            ComponentName
          );
        }
      }

      const analysis = analyzer.analyzeProps();
      expect(analysis.components.length).toBe(COMPONENT_COUNT);
      expect(analysis.components[0].props[0].valueChanges).toBe(UPDATE_COUNT - 1);
    });

    it('should handle rapid consecutive updates', async () => {
      const RAPID_UPDATE_COUNT = 100;
      const INTERVAL = 10; // 10ms between updates
      
      const updatePromises = Array.from({ length: RAPID_UPDATE_COUNT }, (_, i) => 
        new Promise<void>(resolve => {
          setTimeout(() => {
            analyzer.trackPropUsage(
              TestComponent,
              { value: `rapid-${i}` },
              "TestComponent"
            );
            resolve();
          }, i * INTERVAL);
        })
      );

      await Promise.all(updatePromises);
      const analysis = analyzer.analyzeProps();
      
      expect(analysis.components[0].props[0].valueChanges).toBe(RAPID_UPDATE_COUNT - 1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<MonitoringDashboard data={analyzer.analyzeProps()} />);
      expect(screen.getByRole('region', { name: /monitoring/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      render(<OptimizationRecommendations data={analyzer.analyzeProps()} />);
      const suggestion = screen.getByRole('button', { name: /optimization/i });
      suggestion.focus();
      await userEvent.keyboard('{Enter}');
      expect(screen.getByText(/Implementation Steps/i)).toBeInTheDocument();
    });

    it('should pass accessibility audit', async () => {
      const { container } = render(<MonitoringDashboard data={analyzer.analyzeProps()} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
}); 