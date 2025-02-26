import React from 'react';
import { render, screen } from '@testing-library/react';
import OptimizationRecommendations from '../../components/DevTools/OptimizationRecommendations';

// Mock Recharts to prevent actual rendering
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">BarChart {children}</div>
  ),
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

const mockData = {
  components: [
    {
      componentName: 'ComplexComponent',
      props: [
        {
          name: 'data',
          type: 'array',
          required: true,
          usageCount: 100,
          valueChanges: 80,
          lastValue: [],
        },
        {
          name: 'onUpdate',
          type: 'function',
          required: true,
          usageCount: 100,
          valueChanges: 60,
          lastValue: () => {},
        },
        {
          name: 'config',
          type: 'object',
          required: true,
          usageCount: 100,
          valueChanges: 5,
          lastValue: {},
        },
        {
          name: 'theme',
          type: 'object',
          required: true,
          usageCount: 100,
          valueChanges: 2,
          lastValue: {},
        },
        {
          name: 'setData',
          type: 'function',
          required: true,
          usageCount: 100,
          valueChanges: 30,
          lastValue: () => {},
        },
        {
          name: 'updateConfig',
          type: 'function',
          required: true,
          usageCount: 100,
          valueChanges: 25,
          lastValue: () => {},
        },
      ],
    },
    {
      componentName: 'SimpleComponent',
      props: [
        {
          name: 'text',
          type: 'string',
          required: true,
          usageCount: 100,
          valueChanges: 1,
          lastValue: 'Hello',
        },
      ],
    },
  ],
  unusedProps: [],
  propPatterns: [],
  frequentUpdates: [],
};

describe('OptimizationRecommendations', () => {
  it('renders without crashing', () => {
    render(<OptimizationRecommendations data={mockData} />);
    expect(screen.getByTestId('optimization-recommendations')).toBeInTheDocument();
  });

  it('displays the correct number of recommendations', () => {
    render(<OptimizationRecommendations data={mockData} />);
    // Should show recommendations for memoization, prop structure, and state management
    expect(screen.getByText(/3 recommendations found/)).toBeInTheDocument();
  });

  it('shows memoization recommendations for frequently updating props', () => {
    render(<OptimizationRecommendations data={mockData} />);
    expect(screen.getByText(/Component has 2 frequently updating props/)).toBeInTheDocument();
    expect(screen.getByText(/data/)).toBeInTheDocument();
    expect(screen.getByText(/onUpdate/)).toBeInTheDocument();
  });

  it('suggests prop structure optimization for components with many props', () => {
    render(<OptimizationRecommendations data={mockData} />);
    expect(screen.getByText(/Consider grouping related props into objects/)).toBeInTheDocument();
    expect(screen.getByText(/config/)).toBeInTheDocument();
    expect(screen.getByText(/theme/)).toBeInTheDocument();
  });

  it('recommends state management improvements for multiple state handlers', () => {
    render(<OptimizationRecommendations data={mockData} />);
    expect(screen.getByText(/Consider using reducer pattern for complex state/)).toBeInTheDocument();
    expect(screen.getByText(/setData/)).toBeInTheDocument();
    expect(screen.getByText(/updateConfig/)).toBeInTheDocument();
  });

  it('displays the impact visualization chart', () => {
    render(<OptimizationRecommendations data={mockData} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('shows suggested code implementations', () => {
    render(<OptimizationRecommendations data={mockData} />);
    const codeBlocks = screen.getAllByText(/Suggested Implementation/);
    expect(codeBlocks.length).toBeGreaterThan(0);
  });

  it('displays priority levels for recommendations', () => {
    render(<OptimizationRecommendations data={mockData} />);
    expect(screen.getAllByText(/Priority/)).toHaveLength(3);
    expect(screen.getByText(/high/i)).toBeInTheDocument();
  });

  it('shows potential improvements for each recommendation', () => {
    render(<OptimizationRecommendations data={mockData} />);
    expect(screen.getAllByText(/Potential Improvement/)).toHaveLength(3);
  });

  it('handles empty data gracefully', () => {
    const emptyData = {
      components: [],
      unusedProps: [],
      propPatterns: [],
      frequentUpdates: [],
    };
    render(<OptimizationRecommendations data={emptyData} />);
    expect(screen.getByText('0 recommendations found')).toBeInTheDocument();
  });
}); 