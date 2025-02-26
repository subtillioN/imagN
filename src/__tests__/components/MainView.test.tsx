/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MainView } from '../../components/MainView';
import { workflowPresetService } from '../../services/workflowPresets';
import { createSource } from '../../streams/core';
import { createMockSource, createMockWorkflowPreset, createMockProject } from '../utils/test-utils';

// Mock the workflow preset service
jest.mock('../../services/workflowPresets', () => ({
  workflowPresetService: {
    getAllPresets: jest.fn(),
    getDefaultPresets: jest.fn(),
    getUserPresets: jest.fn(),
  },
}));

const createMockStream = (initialValue: any) => {
  const stream = createSource({
    next: (sink) => {
      sink(1, initialValue);
      return () => {};
    }
  });

  stream.update = (value: any) => {
    stream.source(1, value);
    stream.source(2);
  };

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
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it('should switch tabs correctly', () => {
    const sources = createMockSources();
    render(<MainView sources={sources} />);

    // Click on Configuration tab
    fireEvent.click(screen.getByText('Configuration'));
    expect(screen.getByTestId('image-config')).toBeInTheDocument();

    // Click on Progress tab
    fireEvent.click(screen.getByText('Progress'));
    expect(screen.getByText('Progress')).toBeInTheDocument();

    // Click on Results tab
    fireEvent.click(screen.getByText('Results'));
    expect(screen.getByText('Results')).toBeInTheDocument();
  });

  it('should update state when streams emit new values', () => {
    const sources = createMockSources();
    const { rerender } = render(<MainView sources={sources} />);

    // Update progress stream
    sources.state.progress$.update({ status: 'processing' });

    // Re-render with updated sources
    rerender(<MainView sources={sources} />);
    expect(screen.getByText('processing')).toBeInTheDocument();
  });

  it('renders with default state', () => {
    render(<MainView />);
    
    // Check header
    expect(screen.getByText('Image Processing Workflow')).toBeInTheDocument();
    
    // Check tabs
    expect(screen.getByTestId('workflow-tab')).toBeInTheDocument();
    expect(screen.getByTestId('progress-tab')).toBeInTheDocument();
    expect(screen.getByTestId('results-tab')).toBeInTheDocument();
  });

  it('handles tab switching', () => {
    render(<MainView />);
    
    // Initially on Workflow tab
    expect(screen.getByTestId('node-editor')).toBeInTheDocument();
    
    // Switch to Progress tab
    fireEvent.click(screen.getByTestId('progress-tab'));
    expect(screen.getByTestId('progress-view')).toBeInTheDocument();
    
    // Switch to Results tab
    fireEvent.click(screen.getByTestId('results-tab'));
    expect(screen.getByTestId('results-view')).toBeInTheDocument();
  });

  it('handles new project dialog', () => {
    render(<MainView />);
    
    // Open dialog
    fireEvent.click(screen.getByTestId('new-project-button'));
    expect(screen.getByText('Create New Project')).toBeInTheDocument();
    
    // Fill form
    fireEvent.change(screen.getByLabelText('Project Name'), {
      target: { value: 'Test Project' }
    });
    
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Test Description' }
    });
    
    // Close dialog
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Create New Project')).not.toBeInTheDocument();
  });

  it('handles load project dialog', () => {
    const mockProject = createMockProject();
    render(<MainView />);
    
    // Open dialog
    fireEvent.click(screen.getByTestId('load-project-button'));
    expect(screen.getByText('Load Project')).toBeInTheDocument();
    
    // Check project list
    expect(screen.getByText(mockProject.name)).toBeInTheDocument();
    
    // Load project
    fireEvent.click(screen.getByText('Load'));
    
    // Dialog should close
    expect(screen.queryByText('Load Project')).not.toBeInTheDocument();
  });

  it('handles tag management', () => {
    const mockPreset = createMockWorkflowPreset();
    render(<MainView />);
    
    // Open dialog
    fireEvent.click(screen.getByTestId('tag-management-button'));
    expect(screen.getByText('Manage Tags')).toBeInTheDocument();
    
    // Add new tag
    fireEvent.change(screen.getByLabelText('New Tag'), {
      target: { value: 'new-tag' }
    });
    
    fireEvent.click(screen.getByText('Add'));
    
    // Tag should appear in list
    expect(screen.getByText('new-tag')).toBeInTheDocument();
    
    // Remove tag
    fireEvent.click(screen.getByLabelText('delete'));
    expect(screen.queryByText('new-tag')).not.toBeInTheDocument();
  });

  it('handles notifications', () => {
    render(<MainView />);
    
    // Trigger a notification
    const errorMessage = 'Error loading presets';
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Load presets (which will fail and show error)
    fireEvent.click(screen.getByTestId('load-presets-button'));
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    consoleError.mockRestore();
  });
});

describe('MainView - Tag Search and Filtering', () => {
  const mockSystemPresets = [
    {
      id: 'preset1',
      name: 'Image Generation',
      description: 'Basic image generation preset',
      tags: ['default', 'image', 'generation', 'basic'],
    },
    {
      id: 'preset2',
      name: 'Video Style Transfer',
      description: 'Apply artistic styles to videos',
      tags: ['default', 'video', 'style', 'artistic'],
    },
  ];

  const mockUserPresets = [
    {
      id: 'user1',
      name: 'Custom Image Filter',
      description: 'User-defined image filter',
      tags: ['user', 'image', 'filter', 'custom'],
    },
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup mock responses
    (workflowPresetService.getAllPresets as jest.Mock).mockResolvedValue([
      ...mockSystemPresets,
      ...mockUserPresets,
    ]);
  });

  it('renders search input and tag filters', () => {
    render(<MainView />);
    
    // Open new project dialog
    fireEvent.click(screen.getByText('New Project'));
    
    // Check if search input exists
    expect(screen.getByLabelText('Search presets by name or tags')).toBeInTheDocument();
    
    // Check if tag chips are rendered
    const expectedTags = ['image', 'video', 'generation', 'style', 'filter', 'custom'];
    expectedTags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it('filters presets based on search query', () => {
    render(<MainView />);
    
    // Open new project dialog
    fireEvent.click(screen.getByText('New Project'));
    
    // Type in search box
    const searchInput = screen.getByLabelText('Search presets by name or tags');
    fireEvent.change(searchInput, { target: { value: 'image' } });
    
    // Check if only image-related presets are shown
    expect(screen.getByText('Image Generation')).toBeInTheDocument();
    expect(screen.getByText('Custom Image Filter')).toBeInTheDocument();
    expect(screen.queryByText('Video Style Transfer')).not.toBeInTheDocument();
  });

  it('filters presets based on selected tags', () => {
    render(<MainView />);
    
    // Open new project dialog
    fireEvent.click(screen.getByText('New Project'));
    
    // Click on 'video' tag
    fireEvent.click(screen.getByText('video'));
    
    // Check if only video presets are shown
    expect(screen.queryByText('Image Generation')).not.toBeInTheDocument();
    expect(screen.queryByText('Custom Image Filter')).not.toBeInTheDocument();
    expect(screen.getByText('Video Style Transfer')).toBeInTheDocument();
  });

  it('combines search query with tag filters', () => {
    render(<MainView />);
    
    // Open new project dialog
    fireEvent.click(screen.getByText('New Project'));
    
    // Click on 'image' tag and search for 'custom'
    fireEvent.click(screen.getByText('image'));
    const searchInput = screen.getByLabelText('Search presets by name or tags');
    fireEvent.change(searchInput, { target: { value: 'custom' } });
    
    // Check if only matching preset is shown
    expect(screen.queryByText('Image Generation')).not.toBeInTheDocument();
    expect(screen.getByText('Custom Image Filter')).toBeInTheDocument();
    expect(screen.queryByText('Video Style Transfer')).not.toBeInTheDocument();
  });

  it('shows "no presets" message when no matches found', () => {
    render(<MainView />);
    
    // Open new project dialog
    fireEvent.click(screen.getByText('New Project'));
    
    // Search for non-existent preset
    const searchInput = screen.getByLabelText('Search presets by name or tags');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    // Check if no matches message is shown
    expect(screen.getByText('No presets match the selected categories')).toBeInTheDocument();
  });

  it('toggles tags on and off', () => {
    render(<MainView />);
    
    // Open new project dialog
    fireEvent.click(screen.getByText('New Project'));
    
    // Click image tag twice
    const imageTag = screen.getByText('image');
    fireEvent.click(imageTag);
    
    // Check if only image presets are shown
    expect(screen.getByText('Image Generation')).toBeInTheDocument();
    expect(screen.getByText('Custom Image Filter')).toBeInTheDocument();
    expect(screen.queryByText('Video Style Transfer')).not.toBeInTheDocument();
    
    // Click again to deselect
    fireEvent.click(imageTag);
    
    // Check if all presets are shown again
    expect(screen.getByText('Image Generation')).toBeInTheDocument();
    expect(screen.getByText('Custom Image Filter')).toBeInTheDocument();
    expect(screen.getByText('Video Style Transfer')).toBeInTheDocument();
  });
}); 