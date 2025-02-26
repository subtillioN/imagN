import React from 'react';
import { render, screen } from '@testing-library/react';
import RenderImpactAnalysis from '../../components/DevTools/RenderImpactAnalysis';

// Mock Recharts to prevent actual rendering
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  Treemap: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="treemap">Treemap {children}</div>
  ),
  Tooltip: () => null,
}));

const mockData = {
  components: [
    {
      componentName: 'HighImpactComponent',
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
      ],
    },
    {
      componentName: 'LowImpactComponent',
      props: [
        {
          name: 'theme',
          type: 'object',
          required: true,
          usageCount: 100,
          valueChanges: 2,
          lastValue: {},
        },
      ],
    },
  ],
  unusedProps: [],
  propPatterns: [],
  frequentUpdates: [],
};

describe('RenderImpactAnalysis', () => {
  it('renders without crashing', () => {
    render(<RenderImpactAnalysis data={mockData} />);
    expect(screen.getByTestId('render-impact-analysis')).toBeInTheDocument();
  });

  it('displays the correct number of analyzed components', () => {
    render(<RenderImpactAnalysis data={mockData} />);
    expect(screen.getByText('2 components analyzed')).toBeInTheDocument();
  });

  it('shows high impact component details', () => {
    render(<RenderImpactAnalysis data={mockData} />);
    expect(screen.getByText('HighImpactComponent')).toBeInTheDocument();
    expect(screen.getByText('140')).toBeInTheDocument(); // Total render count
  });

  it('shows low impact component details', () => {
    render(<RenderImpactAnalysis data={mockData} />);
    expect(screen.getByText('LowImpactComponent')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Total render count
  });

  it('displays the treemap visualization', () => {
    render(<RenderImpactAnalysis data={mockData} />);
    expect(screen.getByTestId('treemap')).toBeInTheDocument();
  });

  it('shows optimization warnings for high impact components', () => {
    render(<RenderImpactAnalysis data={mockData} />);
    expect(screen.getByText('Optimization Opportunities')).toBeInTheDocument();
    expect(screen.getByText(/Consider memoizing prop 'data'/)).toBeInTheDocument();
  });

  it('displays cascading effects information', () => {
    render(<RenderImpactAnalysis data={mockData} />);
    const labels = screen.getAllByText('Cascading Effects');
    expect(labels.length).toBeGreaterThan(0);
  });

  it('handles empty data gracefully', () => {
    const emptyData = {
      components: [],
      unusedProps: [],
      propPatterns: [],
      frequentUpdates: [],
    };
    render(<RenderImpactAnalysis data={emptyData} />);
    expect(screen.getByText('0 components analyzed')).toBeInTheDocument();
  });

  it('shows critical props for components', () => {
    render(<RenderImpactAnalysis data={mockData} />);
    expect(screen.getByText(/data \(Updates: 80/)).toBeInTheDocument();
    expect(screen.getByText(/onUpdate \(Updates: 60/)).toBeInTheDocument();
  });
}); 