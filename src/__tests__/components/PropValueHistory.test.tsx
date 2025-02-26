import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PropValueHistory from '../../components/DevTools/PropValueHistory';

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null
}));

describe('PropValueHistory', () => {
  const mockData = {
    components: [
      {
        componentName: 'TestComponent',
        props: [
          {
            name: 'testProp',
            type: 'string',
            required: true,
            usageCount: 5,
            valueChanges: 3,
            lastValue: {
              timestamp: 1234567890,
              value: 'test value',
              renderCount: 5
            },
            valueHistory: [
              {
                timestamp: 1234567880,
                value: 'initial value',
                renderCount: 1
              },
              {
                timestamp: 1234567885,
                value: 'updated value',
                renderCount: 3
              },
              {
                timestamp: 1234567890,
                value: 'test value',
                renderCount: 5
              }
            ]
          }
        ]
      }
    ],
    unusedProps: [],
    propPatterns: [],
    frequentUpdates: []
  };

  it('renders without crashing', () => {
    render(<PropValueHistory data={mockData} />);
    expect(screen.getByText('Prop Value History')).toBeInTheDocument();
  });

  it('displays component selection dropdown', () => {
    render(<PropValueHistory data={mockData} />);
    const select = screen.getByLabelText('Component:');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('TestComponent')).toBeInTheDocument();
  });

  it('shows prop selection after component is selected', () => {
    render(<PropValueHistory data={mockData} />);
    const componentSelect = screen.getByLabelText('Component:');
    
    fireEvent.change(componentSelect, { target: { value: 'TestComponent' } });
    
    const propSelect = screen.getByLabelText('Prop:');
    expect(propSelect).toBeInTheDocument();
    expect(screen.getByText('testProp')).toBeInTheDocument();
  });

  it('displays history chart when component and prop are selected', () => {
    render(<PropValueHistory data={mockData} />);
    
    // Select component
    fireEvent.change(screen.getByLabelText('Component:'), {
      target: { value: 'TestComponent' }
    });
    
    // Select prop
    fireEvent.change(screen.getByLabelText('Prop:'), {
      target: { value: 'testProp' }
    });
    
    expect(screen.queryByText('Select a component and prop to view its value history')).not.toBeInTheDocument();
    expect(screen.getByTestId('history-chart')).toBeInTheDocument();
  });

  it('shows correct statistics when component and prop are selected', () => {
    render(<PropValueHistory data={mockData} />);
    
    // Select component and prop
    fireEvent.change(screen.getByLabelText('Component:'), {
      target: { value: 'TestComponent' }
    });
    fireEvent.change(screen.getByLabelText('Prop:'), {
      target: { value: 'testProp' }
    });
    
    expect(screen.getByText('Total Updates:')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // valueChanges
    expect(screen.getByText('Last Updated:')).toBeInTheDocument();
  });

  it('allows history size adjustment', () => {
    render(<PropValueHistory data={mockData} maxHistory={50} />);
    const input = screen.getByLabelText('History Size:');
    expect(input).toHaveValue(50);
    
    fireEvent.change(input, { target: { value: '30' } });
    expect(input).toHaveValue(30);
  });

  it('resets prop selection when component changes', () => {
    render(<PropValueHistory data={mockData} />);
    
    // Select component and prop
    fireEvent.change(screen.getByLabelText('Component:'), {
      target: { value: 'TestComponent' }
    });
    fireEvent.change(screen.getByLabelText('Prop:'), {
      target: { value: 'testProp' }
    });
    
    // Change component
    fireEvent.change(screen.getByLabelText('Component:'), {
      target: { value: '' }
    });
    
    expect(screen.queryByLabelText('Prop:')).not.toBeInTheDocument();
  });
}); 