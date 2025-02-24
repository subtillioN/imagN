import { ImageConfigView } from '../ImageConfigView';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { makeSubject } from 'callbag-subject';

describe('ImageConfigView Component', () => {
  const createMockStream = () => {
    const subject = makeSubject();
    return {
      subscribe: (callback) => {
        subject(0, callback);
        return () => subject(2);
      }
    };
  };

  const createSources = () => ({
    state: {
      config$: createMockStream(),
      parameters$: createMockStream()
    }
  });

  it('should render correctly and match snapshot', () => {
    const sources = createSources();
    const imageConfigView = new ImageConfigView(sources);
    const { container } = render(imageConfigView.view({}));
    
    expect(container).toMatchSnapshot();
  });

  it('should render all configuration sections', () => {
    const sources = createSources();
    const imageConfigView = new ImageConfigView(sources);
    const { container } = render(imageConfigView.view({}));

    expect(container.querySelector('.image-config-container')).toBeInTheDocument();
    expect(container.querySelector('.parameters-section')).toBeInTheDocument();
    expect(container.querySelector('.preview-section')).toBeInTheDocument();
    expect(container.querySelector('.controls-section')).toBeInTheDocument();
  });

  it('should render all parameter inputs', () => {
    const sources = createSources();
    const imageConfigView = new ImageConfigView(sources);
    const { container } = render(imageConfigView.view({}));

    expect(container.querySelector('.size-select')).toBeInTheDocument();
    expect(container.querySelector('.style-select')).toBeInTheDocument();
    expect(container.querySelector('.prompt-input')).toBeInTheDocument();
    expect(container.querySelector('.generate-btn')).toBeInTheDocument();
    expect(container.querySelector('.reset-btn')).toBeInTheDocument();
  });

  it('should update state when streams emit new values', () => {
    const sources = createSources();
    const imageConfigView = new ImageConfigView(sources);
    const { container } = render(imageConfigView.view({}));

    // Simulate stream updates
    sources.state.config$.subscribe(callback => callback({ theme: 'dark' }));
    sources.state.parameters$.subscribe(callback => callback({ size: '1024x1024' }));

    expect(imageConfigView.state.config).toEqual({ theme: 'dark' });
    expect(imageConfigView.state.parameters).toEqual({ size: '1024x1024' });
  });
});