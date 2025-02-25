import { from } from 'rxjs';

class WorkflowPresetService {
  constructor() {
    this.presets = new Map();
    this.initializePresets();
  }

  initializePresets() {
    // Image Generation Preset
    this.registerPreset('image-generation', {
      name: 'Basic Image Generation',
      description: 'Generate images with AI',
      category: 'image',
      type: 'generation',
      tags: ['default', 'image', 'generation'],
      categories: ['default', 'image', 'generation'],
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

    // Video Generation Preset
    this.registerPreset('video-generation', {
      name: 'Basic Video Generation',
      description: 'Generate videos with AI',
      category: 'video',
      type: 'generation',
      tags: ['default', 'video', 'generation'],
      categories: ['default', 'video', 'generation'],
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

    // Node Editor Preset
    this.registerPreset('node-editor', {
      name: 'Custom Node Editor',
      description: 'Create custom node-based workflows',
      category: 'node',
      type: 'custom',
      tags: ['default', 'node', 'custom'],
      categories: ['default', 'node', 'custom'],
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

    // Style Transfer
    this.registerPreset('style-transfer', {
      name: 'Style Transfer Suite',
      description: 'Artistic style transfer with customizable parameters',
      category: 'image',
      type: 'style',
      tags: ['default', 'image', 'style', 'artistic'],
      categories: ['default', 'image', 'style', 'artistic'],
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

    // Add more presets as needed
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
      .filter(preset => preset.tags.includes('default'));
    return from(Promise.resolve(defaultPresets));
  }

  getUserPresets() {
    const userPresets = Array.from(this.presets.values())
      .filter(preset => preset.tags.includes('user'));
    return from(Promise.resolve(userPresets));
  }

  getPresetsByCategory(category) {
    const filteredPresets = Array.from(this.presets.values())
      .filter(preset => 
        // Check if the category exists in tags
        (preset.tags && preset.tags.includes(category)) ||
        // Fallback to category property for backward compatibility
        preset.category === category
      );
    return from(Promise.resolve(filteredPresets));
  }

  getPresetsByType(type) {
    const filteredPresets = Array.from(this.presets.values())
      .filter(preset => 
        // Check if the type exists in tags
        (preset.tags && preset.tags.includes(type)) ||
        // Fallback to type property for backward compatibility
        preset.type === type
      );
    return from(Promise.resolve(filteredPresets));
  }

  getPresetsByTag(tag) {
    const filteredPresets = Array.from(this.presets.values())
      .filter(preset => preset.tags.includes(tag));
    return from(Promise.resolve(filteredPresets));
  }

  getAllCategories() {
    const categories = new Set();
    Array.from(this.presets.values()).forEach(preset => {
      // Add categories from tags
      if (preset.tags && Array.isArray(preset.tags)) {
        preset.tags.forEach(tag => {
          // Add to categories if it's a main category tag
          if (['image', 'video', 'node'].includes(tag)) {
            categories.add(tag);
          }
        });
      }
      
      // For backward compatibility
      if (preset.category && !['default', 'user'].includes(preset.category)) {
        categories.add(preset.category);
      }
    });
    return from(Promise.resolve(Array.from(categories)));
  }

  getAllTypes() {
    const types = new Set();
    Array.from(this.presets.values()).forEach(preset => {
      // Add types from tags
      if (preset.tags && Array.isArray(preset.tags)) {
        preset.tags.forEach(tag => {
          // Add to types if it's a type tag
          if (['generation', 'editing', 'style', 'custom'].includes(tag)) {
            types.add(tag);
          }
        });
      }
      
      // For backward compatibility
      if (preset.type) {
        types.add(preset.type);
      }
    });
    return from(Promise.resolve(Array.from(types)));
  }

  getAllTags() {
    const tags = new Set();
    Array.from(this.presets.values()).forEach(preset => {
      preset.tags.forEach(tag => {
        // Skip 'default' and 'user' tags as they're used for grouping
        if (tag !== 'default' && tag !== 'user') {
          tags.add(tag);
        }
      });
    });
    return from(Promise.resolve(Array.from(tags)));
  }
}

export const workflowPresetService = new WorkflowPresetService();