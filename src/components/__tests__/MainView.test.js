import { MainView } from '../MainView';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import subject from 'callbag-subject';

describe('MainView Component', () => {
  const createMockStream = () => {
    const subj = subject();
    return {
      subscribe: (callback) => {
        subject(0, callback);
        return () => subject(2);
      }
    };
  };

  const createSources = () => ({
    state: {
      imageConfig$: createMockStream(),
      progress$: createMockStream(),
      results$: createMockStream()
    }
  });

  it('should render correctly and match snapshot', () => {
    const sources = createSources();
    const mainView = new MainView(sources);
    const { container } = render(mainView.view({}));
    
    expect(container).toMatchSnapshot();
  });

  it('should render all main sections', () => {
    const sources = createSources();
    const mainView = new MainView(sources);
    const { container } = render(mainView.view({}));

    expect(container.querySelector('.app-header')).toBeInTheDocument();
    expect(container.querySelector('.app-content')).toBeInTheDocument();
    expect(container.querySelector('.app-footer')).toBeInTheDocument();
    expect(container.querySelector('.workspace')).toBeInTheDocument();
  });

  it('should update state when streams emit new values', () => {
    const sources = createSources();
    const mainView = new MainView(sources);
    
    render(mainView.view({ progress: { status: 'Processing' } }));
    
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('should render navigation items correctly', () => {
    const sources = createSources();
    const mainView = new MainView(sources);
    render(mainView.view({}));

    expect(screen.getByRole('listitem', { name: 'Image Workspace' })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: 'Video Workspace' })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: 'Node Editor' })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: 'Presets' })).toBeInTheDocument();
  });
});