import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PerformanceImpact from '../../components/DevTools/PerformanceImpact';

// Mock Recharts to prevent actual rendering
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  Treemap: () => <div data-testid="treemap">Treemap</div>,
  Tooltip: () => <div>Tooltip</div>,
}));

const mockData = {
  components: [{
    componentName: 'TestComponent',
    props: [
      {
        name: 'prop1',
        type: 'string',
        required: true,
        usageCount: 10,
        valueChanges: 25,
        lastValue: 'test',
      },
      {
        name: 'prop2',
        type: 'number',
        required: false,
        usageCount: 5,
        valueChanges: 15,
        lastValue: 42,
      },
    ],
  }],
  unusedProps: [],
  propPatterns: [],
  frequentUpdates: [{
    componentName: 'TestComponent',
    propName: 'prop1',
    updateCount: 25,
  }],
};

describe('PerformanceImpact', () => {
  it('renders without crashing', () => {
    render(<PerformanceImpact data={mockData} />);
    expect(screen.getByTestId('performance-impact')).toBeInTheDocument();
  });

  it('displays component name', () => {
    render(<PerformanceImpact data={mockData} />);
    expect(screen.getByText('TestComponent')).toBeInTheDocument();
  });

  it('shows performance metrics', () => {
    render(<PerformanceImpact data={mockData} />);
    expect(screen.getByText('Total Updates')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument(); // Sum of usage counts
    expect(screen.getByText('High Impact Props')).toBeInTheDocument();
  });

  it('allows switching between metrics', () => {
    render(<PerformanceImpact data={mockData} />);
    const updateFreqButton = screen.getByText('Update Frequency');
    const renderImpactButton = screen.getByText('Render Impact');

    fireEvent.click(renderImpactButton);
    expect(renderImpactButton).toHaveClass('active');
    expect(updateFreqButton).not.toHaveClass('active');

    fireEvent.click(updateFreqButton);
    expect(updateFreqButton).toHaveClass('active');
    expect(renderImpactButton).not.toHaveClass('active');
  });

  it('displays treemap visualization', () => {
    render(<PerformanceImpact data={mockData} />);
    expect(screen.getByTestId('treemap')).toBeInTheDocument();
  });

  it('shows impact legend', () => {
    render(<PerformanceImpact data={mockData} />);
    expect(screen.getByText('Impact Level')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('displays performance warnings for high impact props', () => {
    render(<PerformanceImpact data={mockData} />);
    const warnings = screen.getByTestId('performance-warnings');
    expect(warnings).toBeInTheDocument();
    expect(warnings).toHaveTextContent('prop1');
  });

  it('updates visualization when data changes', () => {
    const { rerender } = render(<PerformanceImpact data={mockData} />);
    
    const updatedData = {
      ...mockData,
      components: [{
        componentName: 'TestComponent',
        props: [
          {
            ...mockData.components[0].props[0],
            usageCount: 20,
          },
          mockData.components[0].props[1],
        ],
      }],
    };

    rerender(<PerformanceImpact data={updatedData} />);
    expect(screen.getByText('25')).toBeInTheDocument(); // New total updates
  });

  it('handles empty data gracefully', () => {
    const emptyData = {
      components: [],
      unusedProps: [],
      propPatterns: [],
      frequentUpdates: [],
    };

    render(<PerformanceImpact data={emptyData} />);
    expect(screen.getByText('No performance data available')).toBeInTheDocument();
  });
}); 