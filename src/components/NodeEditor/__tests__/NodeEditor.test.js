import React from 'react';
import { render, screen } from '@testing-library/react';
import { NodeEditor } from '../NodeEditor';

describe('NodeEditor Component', () => {
  const mockNodes = [
    { id: '1', type: 'input', position: { x: 100, y: 100 } },
    { id: '2', type: 'output', position: { x: 300, y: 100 } }
  ];

  const mockConnections = [
    { id: '1', source: '1', target: '2' }
  ];

  it('should render nodes', () => {
    render(<NodeEditor nodes={mockNodes} connections={mockConnections} />);
    expect(screen.getByTestId('node-1')).toBeInTheDocument();
    expect(screen.getByTestId('node-2')).toBeInTheDocument();
  });

  it('should render connections', () => {
    render(<NodeEditor nodes={mockNodes} connections={mockConnections} />);
    expect(screen.getByTestId('connection-1')).toBeInTheDocument();
  });

  it('should render empty state', () => {
    render(<NodeEditor nodes={[]} connections={[]} />);
    expect(screen.getByTestId('node-editor')).toBeInTheDocument();
  });
});