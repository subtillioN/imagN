import React from 'react';
import { MainView } from '../MainView';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createSource } from '../../streams/core';

const createMockStream = (initialValue) => {
  const stream = createSource({
    next: (sink) => {
      sink(1, initialValue);
      return () => {};
    }
  });
  return stream;
};

const createMockSources = () => ({
  state: {
    imageConfig$: createMockStream({ format: 'jpeg' }),
    progress$: createMockStream({ status: 'idle' }),
    results$: createMockStream({ data: null }),
    workflow$: createMockStream({ steps: [] })
  }
});

describe('MainView Component', () => {
  it('should render correctly', () => {
    const sources = createMockSources();
    render(<MainView sources={sources} />);
    expect(screen.getByText('Image Processing')).toBeInTheDocument();
  });

  it('should render configuration section', () => {
    const sources = createMockSources();
    render(<MainView sources={sources} />);
    expect(screen.getByText('Configuration')).toBeInTheDocument();
  });

  it('should render progress section', () => {
    const sources = createMockSources();
    render(<MainView sources={sources} />);
    expect(screen.getByText('Progress')).toBeInTheDocument();
  });

  it('should render results section', () => {
    const sources = createMockSources();
    render(<MainView sources={sources} />);
    expect(screen.getByText('Results')).toBeInTheDocument();
  });

  it('should render correctly and match snapshot', () => {
    const sources = createMockSources();
    const mainView = new MainView(sources);
    const { container } = render(mainView.view({}));
    
    expect(container).toMatchSnapshot();
  });

  it('should render all main sections', () => {
    const sources = createMockSources();
    const mainView = new MainView(sources);
    const { container } = render(mainView.view({}));

    expect(container.querySelector('.app-header')).toBeInTheDocument();
    expect(container.querySelector('.app-content')).toBeInTheDocument();
    expect(container.querySelector('.app-footer')).toBeInTheDocument();
    expect(container.querySelector('.workspace')).toBeInTheDocument();
  });

  it('should update state when streams emit new values', () => {
    const sources = createMockSources();
    const mainView = new MainView(sources);
    
    render(mainView.view({ progress: { status: 'Processing' } }));
    
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('should render navigation items correctly', () => {
    const sources = createMockSources();
    const mainView = new MainView(sources);
    render(mainView.view({}));

    expect(screen.getByRole('listitem', { name: 'Image Workspace' })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: 'Video Workspace' })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: 'Node Editor' })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: 'Presets' })).toBeInTheDocument();
  });
});