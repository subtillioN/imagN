import { from } from 'rxjs';

class WorkflowPresetService {
  constructor() {
    this.presets = new Map();
    this.initializePresets();
  }

  initializePresets() {
    // Default Presets
    this.registerPreset('image-generation', {
      name: 'Image Generation',
      description: 'Standard image generation workflow with AI models',
      category: 'default',
      nodes: [
        {
          id: 'input',
          type: 'TextPrompt',
          position: { x: 100, y: 100 },
          params: {
            defaultText: 'Enter your prompt here'
          }
        },
        {
          id: 'imageGen',
          type: 'ImageGenerator',
          position: { x: 300, y: 100 },
          params: {
            model: 'stable-diffusion-xl',
            steps: 30,
            width: 1024,
            height: 1024
          }
        },
        {
          id: 'output',
          type: 'ImageOutput',
          position: { x: 500, y: 100 }
        }
      ],
      connections: [
        {
          id: 'conn1',
          from: { nodeId: 'input', outputId: 'text' },
          to: { nodeId: 'imageGen', inputId: 'prompt' }
        },
        {
          id: 'conn2',
          from: { nodeId: 'imageGen', outputId: 'image' },
          to: { nodeId: 'output', inputId: 'image' }
        }
      ]
    });

    this.registerPreset('video-generation', {
      name: 'Video Generation',
      description: 'Create videos from text prompts or image sequences',
      category: 'default',
      nodes: [
        {
          id: 'input',
          type: 'TextPrompt',
          position: { x: 100, y: 100 },
          params: {
            defaultText: 'Enter your video prompt here'
          }
        },
        {
          id: 'videoGen',
          type: 'VideoGenerator',
          position: { x: 300, y: 100 },
          params: {
            model: 'gen-2',
            duration: 5,
            fps: 24,
            resolution: '1080p'
          }
        },
        {
          id: 'output',
          type: 'VideoOutput',
          position: { x: 500, y: 100 }
        }
      ],
      connections: [
        {
          id: 'conn1',
          from: { nodeId: 'input', outputId: 'text' },
          to: { nodeId: 'videoGen', inputId: 'prompt' }
        },
        {
          id: 'conn2',
          from: { nodeId: 'videoGen', outputId: 'video' },
          to: { nodeId: 'output', inputId: 'video' }
        }
      ]
    });

    this.registerPreset('node-workflow', {
      name: 'Node-based Workflow',
      description: 'Advanced customizable node-based workflow for complex projects',
      category: 'default',
      nodes: [
        {
          id: 'canvas',
          type: 'NodeCanvas',
          position: { x: 100, y: 100 },
          params: {
            gridSize: 20,
            snapToGrid: true
          }
        }
      ],
      connections: []
    });

    // Add the style transfer preset
    this.registerPreset('style-transfer', {
      name: 'Style Transfer Suite',
      description: 'Artistic style transfer with customizable parameters',
      category: 'default',
      nodes: [
        {
          id: 'input',
          type: 'ImageInput',
          position: { x: 100, y: 100 }
        },
        {
          id: 'styleExtractor',
          type: 'StyleExtractor',
          position: { x: 300, y: 100 },
          params: {
            style: 'artistic',
            intensity: 0.8
          }
        },
        {
          id: 'transfer',
          type: 'StyleTransfer',
          position: { x: 500, y: 100 },
          params: {
            preserveColor: true,
            contentWeight: 0.7
          }
        },
        {
          id: 'output',
          type: 'ImageOutput',
          position: { x: 700, y: 100 }
        }
      ],
      connections: [
        {
          id: 'conn1',
          from: { nodeId: 'input', outputId: 'image' },
          to: { nodeId: 'styleExtractor', inputId: 'input' }
        },
        {
          id: 'conn2',
          from: { nodeId: 'styleExtractor', outputId: 'style' },
          to: { nodeId: 'transfer', inputId: 'style' }
        },
        {
          id: 'conn3',
          from: { nodeId: 'input', outputId: 'image' },
          to: { nodeId: 'transfer', inputId: 'content' }
        },
        {
          id: 'conn4',
          from: { nodeId: 'transfer', outputId: 'output' },
          to: { nodeId: 'output', inputId: 'image' }
        }
      ]
    });
  }

  registerPreset(id, preset) {
    this.presets.set(id, {
      id,
      ...preset
    });
  }

  getPreset(id) {
    return this.presets.get(id);
  }

  getAllPresets() {
    return from(Promise.resolve(Array.from(this.presets.values())));
  }

  getDefaultPresets() {
    const defaultPresets = Array.from(this.presets.values())
      .filter(preset => preset.category === 'default');
    return from(Promise.resolve(defaultPresets));
  }

  getUserPresets() {
    const userPresets = Array.from(this.presets.values())
      .filter(preset => preset.category === 'user');
    return from(Promise.resolve(userPresets));
  }
}

export const workflowPresetService = new WorkflowPresetService();