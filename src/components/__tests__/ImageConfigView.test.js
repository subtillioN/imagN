import React from 'react';
import { render, screen } from '@testing-library/react';
import { ImageConfigView } from '../ImageConfigView';

describe('ImageConfigView Component', () => {
  it('should render correctly', () => {
    const config = {
      format: 'jpeg',
      compression: 0.8,
      width: 100,
      height: 100,
      quality: 80
    };
    render(<ImageConfigView config={config} />);
    expect(screen.getByLabelText('Format')).toBeInTheDocument();
    expect(screen.getByLabelText('Compression')).toBeInTheDocument();
    expect(screen.getByLabelText('Width')).toBeInTheDocument();
    expect(screen.getByLabelText('Height')).toBeInTheDocument();
    expect(screen.getByLabelText('Quality')).toBeInTheDocument();
  });

  it('should render configuration sections', () => {
    const config = {
      format: 'jpeg',
      compression: 0.8,
      width: 100,
      height: 100,
      quality: 80
    };
    render(<ImageConfigView config={config} />);
    expect(screen.getByLabelText('Format')).toHaveValue('jpeg');
    expect(screen.getByLabelText('Compression')).toHaveValue(0.8);
  });

  it('should handle null config', () => {
    render(<ImageConfigView config={null} />);
    expect(screen.getByLabelText('Format')).toHaveValue('jpeg');
    expect(screen.getByLabelText('Compression')).toHaveValue(0.8);
    expect(screen.getByLabelText('Width')).toHaveValue(100);
    expect(screen.getByLabelText('Height')).toHaveValue(100);
    expect(screen.getByLabelText('Quality')).toHaveValue(80);
  });
});