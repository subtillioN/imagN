import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ComponentRelationship from '../../components/DevTools/ComponentRelationship';

// Mock D3 modules
jest.mock('d3', () => ({
  select: () => ({
    selectAll: () => ({
      remove: jest.fn()
    }),
    append: () => ({
      selectAll: () => ({
        data: () => ({
          join: () => ({
            attr: () => ({
              call: () => ({})
            }),
            call: () => ({})
          })
        })
      }),
      append: () => ({
        attr: () => ({})
      })
    }),
    call: () => ({
      transition: () => ({
        duration: () => ({
          call: jest.fn()
        })
      })
    })
  }),
  forceSimulation: () => ({
    force: () => ({
      force: () => ({
        force: () => ({})
      }),
      id: () => ({
        distance: () => ({
          strength: () => ({})
        })
      })
    }),
    on: () => ({
      stop: jest.fn()
    })
  }),
  forceManyBody: () => ({
    strength: () => ({})
  }),
  forceCenter: () => ({}),
  forceLink: () => ({
    id: () => ({
      distance: () => ({
        strength: () => ({})
      })
    })
  }),
  drag: () => ({
    on: () => ({
      on: () => ({
        on: () => ({})
      })
    })
  }),
  zoom: () => ({
    on: () => ({}),
    transform: {},
    identity: {}
  })
}));

describe('ComponentRelationship', () => {
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
            valueChanges: 3
          }
        ]
      }
    ],
    unusedProps: [],
    propPatterns: [
      {
        pattern: 'string:required',
        count: 1,
        components: ['TestComponent']
      }
    ],
    frequentUpdates: []
  };

  it('renders without crashing', () => {
    render(<ComponentRelationship data={mockData} />);
    expect(screen.getByText('Component Relationships')).toBeInTheDocument();
  });

  it('renders controls', () => {
    render(<ComponentRelationship data={mockData} />);
    expect(screen.getByText('Reset View')).toBeInTheDocument();
  });

  it('renders legend', () => {
    render(<ComponentRelationship data={mockData} />);
    expect(screen.getByText('Component')).toBeInTheDocument();
    expect(screen.getByText('Prop')).toBeInTheDocument();
  });

  it('creates SVG element', () => {
    render(<ComponentRelationship data={mockData} />);
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('accepts custom dimensions', () => {
    render(<ComponentRelationship data={mockData} width={1000} height={800} />);
    const svg = document.querySelector('svg');
    expect(svg).toHaveAttribute('width', '1000');
    expect(svg).toHaveAttribute('height', '800');
  });

  it('handles reset view click', () => {
    render(<ComponentRelationship data={mockData} />);
    const resetButton = screen.getByText('Reset View');
    fireEvent.click(resetButton);
    // D3 transition is mocked, so we just verify the button click doesn't crash
    expect(resetButton).toBeInTheDocument();
  });

  it('updates when data changes', () => {
    const { rerender } = render(<ComponentRelationship data={mockData} />);
    
    const newData = {
      ...mockData,
      components: [
        ...mockData.components,
        {
          componentName: 'AnotherComponent',
          props: []
        }
      ]
    };

    rerender(<ComponentRelationship data={newData} />);
    // Component should re-render without crashing
    expect(screen.getByText('Component Relationships')).toBeInTheDocument();
  });
}); 