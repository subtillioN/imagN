import React from 'react';
import { render, screen } from '@testing-library/react';
import { NodeConnection } from '../NodeConnection';

describe('NodeConnection Component', () => {
  const mockSource = {
    id: '1',
    position: { x: 100, y: 100 }
  };

  const mockTarget = {
    id: '2',
    position: { x: 300, y: 100 }
  };

  it('should render correctly', () => {
    render(
      <NodeConnection
        source={mockSource}
        target={mockTarget}
        data-testid="connection-1"
      />
    );
    expect(screen.getByTestId('connection-1')).toBeInTheDocument();
  });

  it('should calculate correct path', () => {
    const { container } = render(
      <NodeConnection
        source={mockSource}
        target={mockTarget}
        data-testid="connection-1"
      />
    );
    const path = container.querySelector('path');
    expect(path).toHaveAttribute('d', 'M150,125 L300,125');
  });

  it('should not render when source or target is missing', () => {
    const { container } = render(
      <NodeConnection
        source={null}
        target={mockTarget}
        data-testid="connection-1"
      />
    );
    expect(container.firstChild).toBeNull();
  });
});