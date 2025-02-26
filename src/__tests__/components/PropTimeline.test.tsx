import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PropTimeline from '../../components/DevTools/PropTimeline';

// Mock RosenCharts
jest.mock('@rosencharts/react', () => ({
  RosenCharts: {
    Timeline: jest.fn()
  }
}));

describe('PropTimeline', () => {
  const mockData = {
    components: [
      {
        componentName: 'TestComponent',
        props: [
          {
            name: 'testProp',
            type: 'string',
            required: false,
            usageCount: 2,
            valueChanges: 1,
            lastValue: {
              value: 'test',
              timestamp: Date.now()
            }
          }
        ]
      }
    ],
    unusedProps: [],
    propPatterns: [],
    frequentUpdates: []
  };

  const defaultProps = {
    data: mockData,
    startTime: Date.now() - 3600000, // 1 hour ago
    endTime: Date.now()
  };

  beforeEach(() => {
    // Clear mock calls
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<PropTimeline {...defaultProps} />);
    expect(screen.getByText('Prop Changes Timeline')).toBeInTheDocument();
  });

  it('renders timeline controls', () => {
    render(<PropTimeline {...defaultProps} />);
    expect(screen.getByText('Reset Zoom')).toBeInTheDocument();
    expect(screen.getByText('Last Hour')).toBeInTheDocument();
    expect(screen.getByText('Last 24 Hours')).toBeInTheDocument();
  });

  it('renders legend items', () => {
    render(<PropTimeline {...defaultProps} />);
    expect(screen.getByText('Update')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  it('initializes timeline chart with correct data', () => {
    render(<PropTimeline {...defaultProps} />);
    
    const { RosenCharts } = require('@rosencharts/react');
    const timelineCall = RosenCharts.Timeline.mock.calls[0];
    
    expect(timelineCall).toBeDefined();
    expect(timelineCall[1].data).toHaveLength(1);
    expect(timelineCall[1].theme).toBe('dark');
    expect(timelineCall[1].xField).toBe('timestamp');
    expect(timelineCall[1].yField).toBe('componentName');
  });

  it('transforms data correctly for visualization', () => {
    render(<PropTimeline {...defaultProps} />);
    
    const { RosenCharts } = require('@rosencharts/react');
    const timelineCall = RosenCharts.Timeline.mock.calls[0];
    const transformedData = timelineCall[1].data[0];
    
    expect(transformedData).toEqual({
      timestamp: mockData.components[0].props[0].lastValue.timestamp,
      componentName: 'TestComponent',
      propName: 'testProp',
      value: mockData.components[0].props[0].lastValue,
      changeType: 'update'
    });
  });

  it('updates when data changes', () => {
    const { rerender } = render(<PropTimeline {...defaultProps} />);
    
    const newData = {
      ...mockData,
      components: [
        {
          ...mockData.components[0],
          props: [
            {
              ...mockData.components[0].props[0],
              valueChanges: 2
            }
          ]
        }
      ]
    };
    
    rerender(<PropTimeline {...defaultProps} data={newData} />);
    
    const { RosenCharts } = require('@rosencharts/react');
    expect(RosenCharts.Timeline).toHaveBeenCalledTimes(2);
  });

  it('updates when time range changes', () => {
    const { rerender } = render(<PropTimeline {...defaultProps} />);
    
    const newStartTime = Date.now() - 7200000; // 2 hours ago
    rerender(<PropTimeline {...defaultProps} startTime={newStartTime} />);
    
    const { RosenCharts } = require('@rosencharts/react');
    expect(RosenCharts.Timeline).toHaveBeenCalledTimes(2);
  });
}); 