import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PropPatternDetection from '../../components/DevTools/PropPatternDetection';

// Mock Recharts to prevent actual rendering
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  TreeMap: ({ children, onClick }: { children: React.ReactNode, onClick: (data: any) => void }) => (
    <div data-testid="treemap" onClick={() => onClick({ id: 'test-pattern', name: 'Test Pattern' })}>
      TreeMap {children}
    </div>
  ),
  Tooltip: () => null,
}));

const mockData = {
  components: [
    {
      componentName: 'TestComponent',
      props: [
        {
          name: 'frequentProp',
          type: 'string',
          required: true,
          usageCount: 10,
          valueChanges: 9,
          lastValue: 'test',
        },
        {
          name: 'stableProp',
          type: 'number',
          required: false,
          usageCount: 10,
          valueChanges: 2,
          lastValue: 42,
        },
      ],
    },
  ],
  unusedProps: [
    {
      componentName: 'TestComponent',
      propName: 'unusedProp',
      type: 'string',
    },
  ],
  propPatterns: [],
  frequentUpdates: [],
};

describe('PropPatternDetection', () => {
  it('renders without crashing', () => {
    render(<PropPatternDetection data={mockData} />);
    expect(screen.getByTestId('prop-pattern-detection')).toBeInTheDocument();
  });

  it('displays the correct number of detected patterns', () => {
    render(<PropPatternDetection data={mockData} />);
    expect(screen.getByText('2 patterns detected')).toBeInTheDocument();
  });

  it('shows pattern details when a pattern is selected', () => {
    render(<PropPatternDetection data={mockData} />);
    const treemap = screen.getByTestId('treemap');
    fireEvent.click(treemap);
    expect(screen.getByText('Test Pattern')).toBeInTheDocument();
  });

  it('detects frequent update patterns', () => {
    render(<PropPatternDetection data={mockData} />);
    expect(screen.getByText(/Frequent Updates/)).toBeInTheDocument();
  });

  it('detects unused props patterns', () => {
    render(<PropPatternDetection data={mockData} />);
    expect(screen.getByText(/Unused Props/)).toBeInTheDocument();
  });

  it('displays confidence scores for patterns', () => {
    render(<PropPatternDetection data={mockData} />);
    const treemap = screen.getByTestId('treemap');
    fireEvent.click(treemap);
    expect(screen.getByText(/Confidence Score/)).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    const emptyData = {
      components: [],
      unusedProps: [],
      propPatterns: [],
      frequentUpdates: [],
    };
    render(<PropPatternDetection data={emptyData} />);
    expect(screen.getByText('0 patterns detected')).toBeInTheDocument();
  });

  it('displays affected components count', () => {
    render(<PropPatternDetection data={mockData} />);
    const treemap = screen.getByTestId('treemap');
    fireEvent.click(treemap);
    expect(screen.getByText(/Affected Components/)).toBeInTheDocument();
  });
}); 