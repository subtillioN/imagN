import React from 'react';
import { render, screen } from '@testing-library/react';
import MemoizationSuggestions from '../../components/DevTools/MemoizationSuggestions';

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
      componentName: 'FrequentUpdates',
      props: [
        {
          name: 'data',
          type: 'array',
          required: true,
          usageCount: 100,
          valueChanges: 90,
          lastValue: [],
        },
        {
          name: 'onUpdate',
          type: 'function',
          required: true,
          usageCount: 100,
          valueChanges: 80,
          lastValue: () => {},
        },
      ],
    },
    {
      componentName: 'StableComponent',
      props: [
        {
          name: 'config',
          type: 'object',
          required: true,
          usageCount: 100,
          valueChanges: 2,
          lastValue: {},
        },
        {
          name: 'theme',
          type: 'object',
          required: true,
          usageCount: 100,
          valueChanges: 1,
          lastValue: {},
        },
      ],
    },
  ],
  unusedProps: [],
  propPatterns: [],
  frequentUpdates: [],
};

describe('MemoizationSuggestions', () => {
  it('renders without crashing', () => {
    render(<MemoizationSuggestions data={mockData} />);
    expect(screen.getByTestId('memoization-suggestions')).toBeInTheDocument();
  });

  it('displays the correct number of suggestions', () => {
    render(<MemoizationSuggestions data={mockData} />);
    expect(screen.getByText('2 suggestions found')).toBeInTheDocument();
  });

  it('shows suggestions for components with frequent updates', () => {
    render(<MemoizationSuggestions data={mockData} />);
    expect(screen.getByText('FrequentUpdates')).toBeInTheDocument();
    expect(screen.getByText(/2 out of 2 props update frequently/)).toBeInTheDocument();
  });

  it('shows suggestions for components with stable props', () => {
    render(<MemoizationSuggestions data={mockData} />);
    expect(screen.getByText('StableComponent')).toBeInTheDocument();
    expect(screen.getByText(/2 out of 2 props are stable/)).toBeInTheDocument();
  });

  it('displays impact levels correctly', () => {
    render(<MemoizationSuggestions data={mockData} />);
    const suggestions = screen.getAllByText(/Impact/);
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it('shows the bar chart visualization', () => {
    render(<MemoizationSuggestions data={mockData} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('displays affected props for each suggestion', () => {
    render(<MemoizationSuggestions data={mockData} />);
    expect(screen.getByText('data')).toBeInTheDocument();
    expect(screen.getByText('onUpdate')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    const emptyData = {
      components: [],
      unusedProps: [],
      propPatterns: [],
      frequentUpdates: [],
    };
    render(<MemoizationSuggestions data={emptyData} />);
    expect(screen.getByText(/No memoization suggestions found/)).toBeInTheDocument();
  });

  it('displays suggested actions', () => {
    render(<MemoizationSuggestions data={mockData} />);
    expect(screen.getAllByText(/Use React.memo/).length).toBeGreaterThan(0);
  });
}); 