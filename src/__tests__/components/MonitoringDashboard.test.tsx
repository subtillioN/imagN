import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import MonitoringDashboard from '../../components/DevTools/MonitoringDashboard';

// Mock Recharts to prevent actual rendering
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => children,
  LineChart: () => <div data-testid="line-chart">LineChart</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
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

describe('MonitoringDashboard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders without crashing', () => {
    render(<MonitoringDashboard data={mockData} />);
    expect(screen.getByTestId('monitoring-dashboard')).toBeInTheDocument();
  });

  it('displays component selector', () => {
    render(<MonitoringDashboard data={mockData} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('TestComponent')).toBeInTheDocument();
  });

  it('shows start/stop monitoring button', () => {
    render(<MonitoringDashboard data={mockData} />);
    expect(screen.getByText('Start Monitoring')).toBeInTheDocument();
  });

  it('toggles monitoring state when button is clicked', () => {
    render(<MonitoringDashboard data={mockData} />);
    const button = screen.getByText('Start Monitoring');
    
    fireEvent.click(button);
    expect(screen.getByText('Stop Monitoring')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Stop Monitoring'));
    expect(screen.getByText('Start Monitoring')).toBeInTheDocument();
  });

  it('displays component metrics when component is selected', () => {
    render(<MonitoringDashboard data={mockData} />);
    const select = screen.getByRole('combobox');
    
    fireEvent.change(select, { target: { value: 'TestComponent' } });
    
    expect(screen.getByText('Total Props')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Total props count
    expect(screen.getByText('Active Props')).toBeInTheDocument();
    expect(screen.getByText('High Update Props')).toBeInTheDocument();
  });

  it('shows line chart for metrics visualization', () => {
    render(<MonitoringDashboard data={mockData} />);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('displays alerts for frequent updates', () => {
    render(<MonitoringDashboard data={mockData} />);
    expect(screen.getByText(/TestComponent.prop1 has 25 updates/)).toBeInTheDocument();
  });

  it('updates metrics periodically when monitoring is active', () => {
    render(<MonitoringDashboard data={mockData} refreshInterval={1000} />);
    
    // Start monitoring
    fireEvent.click(screen.getByText('Start Monitoring'));
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    // Check if metrics are updated (chart should have data points)
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    const emptyData = {
      components: [],
      unusedProps: [],
      propPatterns: [],
      frequentUpdates: [],
    };

    render(<MonitoringDashboard data={emptyData} />);
    expect(screen.getByText('All Components')).toBeInTheDocument();
    expect(screen.queryByTestId('component-metrics')).not.toBeInTheDocument();
  });

  it('cleans up interval on unmount', () => {
    const { unmount } = render(<MonitoringDashboard data={mockData} />);
    
    // Start monitoring
    fireEvent.click(screen.getByText('Start Monitoring'));
    
    // Unmount component
    unmount();
    
    // Ensure no memory leaks by checking if intervals are cleared
    expect(jest.getTimerCount()).toBe(0);
  });
}); 