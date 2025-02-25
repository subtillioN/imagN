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

    // Comic Book Style Preset
    this.registerPreset('comic-book-style', {
      name: 'Comic Book Creator',
      description: 'Transform images into comic book style art with speech bubbles and effects',
      category: 'image',
      type: 'style',
      tags: ['default', 'image', 'style', 'comic', 'artistic'],
      nodes: [
        {
          id: 'input',
          type: 'ImageInput',
          position: { x: 100, y: 100 }
        },
        {
          id: 'comicFilter',
          type: 'StyleTransfer',
          position: { x: 300, y: 100 },
          params: {
            style: 'comic',
            intensity: 0.9,
            lineWeight: 2.0,
            colorPalette: 'vintage'
          }
        },
        {
          id: 'bubbleGen',
          type: 'SpeechBubbleGenerator',
          position: { x: 300, y: 250 },
          params: {
            style: 'comic',
            autoPosition: true
          }
        },
        {
          id: 'effectsLayer',
          type: 'ComicEffects',
          position: { x: 500, y: 100 },
          params: {
            effects: ['speedLines', 'impactStars', 'halftone'],
            intensity: 0.7
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
          to: { nodeId: 'comicFilter', inputId: 'input' }
        },
        {
          id: 'conn2',
          from: { nodeId: 'comicFilter', outputId: 'output' },
          to: { nodeId: 'effectsLayer', inputId: 'input' }
        },
        {
          id: 'conn3',
          from: { nodeId: 'bubbleGen', outputId: 'bubbles' },
          to: { nodeId: 'effectsLayer', inputId: 'overlay' }
        },
        {
          id: 'conn4',
          from: { nodeId: 'effectsLayer', outputId: 'output' },
          to: { nodeId: 'output', inputId: 'image' }
        }
      ]
    });

    // Dream Sequence Video
    this.registerPreset('dream-sequence', {
      name: 'Dream Sequence Generator',
      description: 'Create dreamy, surreal video sequences with ethereal effects',
      category: 'video',
      type: 'style',
      tags: ['default', 'video', 'style', 'artistic', 'effects'],
      nodes: [
        {
          id: 'input',
          type: 'VideoInput',
          position: { x: 100, y: 100 }
        },
        {
          id: 'colorGrading',
          type: 'ColorGrading',
          position: { x: 300, y: 100 },
          params: {
            saturation: 1.2,
            brightness: 1.1,
            contrast: 0.9,
            temperature: 6500,
            tint: 10
          }
        },
        {
          id: 'dreamEffect',
          type: 'DreamEffect',
          position: { x: 500, y: 100 },
          params: {
            blurAmount: 0.3,
            glowIntensity: 0.6,
            bloomRadius: 20,
            vignette: 0.4
          }
        },
        {
          id: 'particleSystem',
          type: 'ParticleGenerator',
          position: { x: 500, y: 250 },
          params: {
            type: 'sparkles',
            density: 0.3,
            size: 2,
            color: '#FFFFFF',
            opacity: 0.6
          }
        },
        {
          id: 'output',
          type: 'VideoOutput',
          position: { x: 700, y: 100 }
        }
      ],
      connections: [
        {
          id: 'conn1',
          from: { nodeId: 'input', outputId: 'video' },
          to: { nodeId: 'colorGrading', inputId: 'input' }
        },
        {
          id: 'conn2',
          from: { nodeId: 'colorGrading', outputId: 'output' },
          to: { nodeId: 'dreamEffect', inputId: 'input' }
        },
        {
          id: 'conn3',
          from: { nodeId: 'particleSystem', outputId: 'particles' },
          to: { nodeId: 'dreamEffect', inputId: 'overlay' }
        },
        {
          id: 'conn4',
          from: { nodeId: 'dreamEffect', outputId: 'output' },
          to: { nodeId: 'output', inputId: 'video' }
        }
      ]
    });

    // AI Portrait Studio
    this.registerPreset('ai-portrait-studio', {
      name: 'AI Portrait Studio',
      description: 'Create stunning AI-enhanced portraits with professional lighting and effects',
      category: 'image',
      type: 'generation',
      tags: ['default', 'image', 'generation', 'portrait', 'professional'],
      nodes: [
        {
          id: 'input',
          type: 'ImageInput',
          position: { x: 100, y: 100 }
        },
        {
          id: 'faceEnhancer',
          type: 'FaceEnhancement',
          position: { x: 300, y: 100 },
          params: {
            skinSmoothing: 0.3,
            eyeEnhancement: 0.5,
            facialFeaturePreservation: 0.8
          }
        },
        {
          id: 'lighting',
          type: 'LightingSimulator',
          position: { x: 500, y: 100 },
          params: {
            setup: 'threePoint',
            keyLight: { intensity: 0.8, temperature: 5600 },
            fillLight: { intensity: 0.4, temperature: 5200 },
            backLight: { intensity: 0.6, temperature: 6000 }
          }
        },
        {
          id: 'background',
          type: 'BackgroundGenerator',
          position: { x: 500, y: 250 },
          params: {
            type: 'gradient',
            colors: ['#2C3E50', '#3498DB'],
            blur: 0.3
          }
        },
        {
          id: 'finalTouches',
          type: 'ImageEnhancer',
          position: { x: 700, y: 100 },
          params: {
            clarity: 0.3,
            vibrance: 0.2,
            shadows: 0.1,
            highlights: -0.1,
            vignette: 0.2
          }
        },
        {
          id: 'output',
          type: 'ImageOutput',
          position: { x: 900, y: 100 }
        }
      ],
      connections: [
        {
          id: 'conn1',
          from: { nodeId: 'input', outputId: 'image' },
          to: { nodeId: 'faceEnhancer', inputId: 'input' }
        },
        {
          id: 'conn2',
          from: { nodeId: 'faceEnhancer', outputId: 'output' },
          to: { nodeId: 'lighting', inputId: 'input' }
        },
        {
          id: 'conn3',
          from: { nodeId: 'background', outputId: 'background' },
          to: { nodeId: 'lighting', inputId: 'background' }
        },
        {
          id: 'conn4',
          from: { nodeId: 'lighting', outputId: 'output' },
          to: { nodeId: 'finalTouches', inputId: 'input' }
        },
        {
          id: 'conn5',
          from: { nodeId: 'finalTouches', outputId: 'output' },
          to: { nodeId: 'output', inputId: 'image' }
        }
      ]
    });

    // Music Video Creator
    this.registerPreset('music-video-generator', {
      name: 'Music Video Creator',
      description: 'Generate dynamic music videos with AI-powered visuals that react to audio',
      category: 'video',
      type: 'generation',
      tags: ['default', 'video', 'generation', 'music', 'creative'],
      nodes: [
        {
          id: 'audioInput',
          type: 'AudioInput',
          position: { x: 100, y: 100 }
        },
        {
          id: 'audioAnalyzer',
          type: 'AudioAnalyzer',
          position: { x: 300, y: 100 },
          params: {
            beatDetection: true,
            frequencyAnalysis: true,
            tempoTracking: true
          }
        },
        {
          id: 'visualGenerator',
          type: 'MusicVisualGenerator',
          position: { x: 500, y: 100 },
          params: {
            style: 'abstract',
            colorScheme: 'dynamic',
            complexity: 0.7,
            responsiveness: 0.8
          }
        },
        {
          id: 'effectsProcessor',
          type: 'VideoEffects',
          position: { x: 700, y: 100 },
          params: {
            beatSync: true,
            transitions: ['fade', 'zoom', 'glitch'],
            colorShift: 0.3,
            kaleidoscope: 0.2
          }
        },
        {
          id: 'output',
          type: 'VideoOutput',
          position: { x: 900, y: 100 }
        }
      ],
      connections: [
        {
          id: 'conn1',
          from: { nodeId: 'audioInput', outputId: 'audio' },
          to: { nodeId: 'audioAnalyzer', inputId: 'input' }
        },
        {
          id: 'conn2',
          from: { nodeId: 'audioAnalyzer', outputId: 'analysis' },
          to: { nodeId: 'visualGenerator', inputId: 'audioData' }
        },
        {
          id: 'conn3',
          from: { nodeId: 'visualGenerator', outputId: 'visuals' },
          to: { nodeId: 'effectsProcessor', inputId: 'input' }
        },
        {
          id: 'conn4',
          from: { nodeId: 'audioAnalyzer', outputId: 'beats' },
          to: { nodeId: 'effectsProcessor', inputId: 'timing' }
        },
        {
          id: 'conn5',
          from: { nodeId: 'effectsProcessor', outputId: 'output' },
          to: { nodeId: 'output', inputId: 'video' }
        }
      ]
    });

    // Anime Style Converter
    this.registerPreset('anime-converter', {
      name: 'Anime Style Converter',
      description: 'Transform photos and videos into anime-style artwork with customizable style parameters',
      category: 'image',
      type: 'style',
      tags: ['default', 'image', 'style', 'anime', 'artistic'],
      nodes: [
        {
          id: 'input',
          type: 'ImageInput',
          position: { x: 100, y: 100 }
        },
        {
          id: 'animeStyler',
          type: 'StyleTransfer',
          position: { x: 300, y: 100 },
          params: {
            style: 'anime',
            lineArtStrength: 0.8,
            colorPalette: 'vibrant',
            shading: 'cel',
            eyeEnhancement: true
          }
        },
        {
          id: 'detailEnhancer',
          type: 'DetailEnhancer',
          position: { x: 500, y: 100 },
          params: {
            sharpness: 0.6,
            detail: 0.7,
            denoise: 0.3
          }
        },
        {
          id: 'backgroundEffect',
          type: 'AnimeEffects',
          position: { x: 500, y: 250 },
          params: {
            sparkles: true,
            speedLines: false,
            glowEffects: true,
            toneMapping: 'anime'
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
          to: { nodeId: 'animeStyler', inputId: 'input' }
        },
        {
          id: 'conn2',
          from: { nodeId: 'animeStyler', outputId: 'output' },
          to: { nodeId: 'detailEnhancer', inputId: 'input' }
        },
        {
          id: 'conn3',
          from: { nodeId: 'detailEnhancer', outputId: 'output' },
          to: { nodeId: 'backgroundEffect', inputId: 'input' }
        },
        {
          id: 'conn4',
          from: { nodeId: 'backgroundEffect', outputId: 'output' },
          to: { nodeId: 'output', inputId: 'image' }
        }
      ]
    });

    // Time-lapse Creator
    this.registerPreset('timelapse-creator', {
      name: 'Time-lapse Creator Pro',
      description: 'Create stunning time-lapse videos with advanced stabilization and effects',
      category: 'video',
      type: 'generation',
      tags: ['default', 'video', 'timelapse', 'professional'],
      nodes: [
        {
          id: 'input',
          type: 'ImageSequenceInput',
          position: { x: 100, y: 100 },
          params: {
            frameRate: 30,
            interpolation: true
          }
        },
        {
          id: 'stabilizer',
          type: 'VideoStabilizer',
          position: { x: 300, y: 100 },
          params: {
            smoothing: 0.8,
            horizonLock: true,
            cropMargin: 0.1
          }
        },
        {
          id: 'exposureRamp',
          type: 'ExposureRamping',
          position: { x: 500, y: 100 },
          params: {
            autoExposure: true,
            smoothingWindow: 10,
            highlights: 0.8
          }
        },
        {
          id: 'motionBlur',
          type: 'MotionBlur',
          position: { x: 700, y: 100 },
          params: {
            amount: 0.5,
            samples: 10,
            adaptive: true
          }
        },
        {
          id: 'output',
          type: 'VideoOutput',
          position: { x: 900, y: 100 }
        }
      ],
      connections: [
        {
          id: 'conn1',
          from: { nodeId: 'input', outputId: 'sequence' },
          to: { nodeId: 'stabilizer', inputId: 'input' }
        },
        {
          id: 'conn2',
          from: { nodeId: 'stabilizer', outputId: 'output' },
          to: { nodeId: 'exposureRamp', inputId: 'input' }
        },
        {
          id: 'conn3',
          from: { nodeId: 'exposureRamp', outputId: 'output' },
          to: { nodeId: 'motionBlur', inputId: 'input' }
        },
        {
          id: 'conn4',
          from: { nodeId: 'motionBlur', outputId: 'output' },
          to: { nodeId: 'output', inputId: 'video' }
        }
      ]
    });

    // 3D Hologram Generator
    this.registerPreset('hologram-generator', {
      name: '3D Hologram Generator',
      description: 'Create stunning holographic displays from 2D images or 3D models',
      category: 'image',
      type: 'generation',
      tags: ['default', 'image', 'generation', '3d', 'hologram'],
      nodes: [
        {
          id: 'input',
          type: 'ImageInput',
          position: { x: 100, y: 100 }
        },
        {
          id: 'depthEstimator',
          type: 'DepthEstimator',
          position: { x: 300, y: 100 },
          params: {
            mode: 'neural',
            refinement: 'high',
            confidence: 0.8
          }
        },
        {
          id: 'hologramProcessor',
          type: 'HologramEffect',
          position: { x: 500, y: 100 },
          params: {
            type: '3d',
            glowIntensity: 0.7,
            scanlines: true,
            flickerAmount: 0.2,
            colorShift: 0.3
          }
        },
        {
          id: 'particleSystem',
          type: 'ParticleGenerator',
          position: { x: 500, y: 250 },
          params: {
            type: 'holographic',
            density: 0.4,
            speed: 0.3,
            color: '#00FFFF'
          }
        },
        {
          id: 'output',
          type: 'HologramOutput',
          position: { x: 700, y: 100 },
          params: {
            displayType: 'pyramid',
            rotation: 'auto'
          }
        }
      ],
      connections: [
        {
          id: 'conn1',
          from: { nodeId: 'input', outputId: 'image' },
          to: { nodeId: 'depthEstimator', inputId: 'input' }
        },
        {
          id: 'conn2',
          from: { nodeId: 'depthEstimator', outputId: 'depth' },
          to: { nodeId: 'hologramProcessor', inputId: 'depth' }
        },
        {
          id: 'conn3',
          from: { nodeId: 'input', outputId: 'image' },
          to: { nodeId: 'hologramProcessor', inputId: 'image' }
        },
        {
          id: 'conn4',
          from: { nodeId: 'particleSystem', outputId: 'particles' },
          to: { nodeId: 'hologramProcessor', inputId: 'overlay' }
        },
        {
          id: 'conn5',
          from: { nodeId: 'hologramProcessor', outputId: 'output' },
          to: { nodeId: 'output', inputId: 'hologram' }
        }
      ]
    });

    // AI Storyboard Creator
    this.registerPreset('storyboard-creator', {
      name: 'AI Storyboard Creator',
      description: 'Generate professional storyboards from text descriptions or rough sketches',
      category: 'image',
      type: 'generation',
      tags: ['default', 'image', 'generation', 'storyboard', 'professional'],
      nodes: [
        {
          id: 'textInput',
          type: 'TextPrompt',
          position: { x: 100, y: 100 },
          params: {
            multiline: true,
            defaultText: 'Describe your scene here...'
          }
        },
        {
          id: 'sketchInput',
          type: 'SketchInput',
          position: { x: 100, y: 250 },
          params: {
            brushTypes: ['pencil', 'marker'],
            canvasSize: '16:9'
          }
        },
        {
          id: 'storyboardGenerator',
          type: 'StoryboardGenerator',
          position: { x: 300, y: 100 },
          params: {
            style: 'cinematic',
            panels: 3,
            aspectRatio: '16:9',
            detailLevel: 'high'
          }
        },
        {
          id: 'annotationLayer',
          type: 'StoryboardAnnotation',
          position: { x: 500, y: 100 },
          params: {
            showCameraMovement: true,
            showActionArrows: true,
            autoLayout: true
          }
        },
        {
          id: 'styleEnhancer',
          type: 'ArtisticEnhancer',
          position: { x: 700, y: 100 },
          params: {
            style: 'storyboard',
            lineweight: 0.8,
            contrast: 0.7,
            atmosphere: 0.5
          }
        },
        {
          id: 'output',
          type: 'StoryboardOutput',
          position: { x: 900, y: 100 },
          params: {
            format: 'sequence',
            exportResolution: 'high'
          }
        }
      ],
      connections: [
        {
          id: 'conn1',
          from: { nodeId: 'textInput', outputId: 'text' },
          to: { nodeId: 'storyboardGenerator', inputId: 'description' }
        },
        {
          id: 'conn2',
          from: { nodeId: 'sketchInput', outputId: 'sketch' },
          to: { nodeId: 'storyboardGenerator', inputId: 'reference' }
        },
        {
          id: 'conn3',
          from: { nodeId: 'storyboardGenerator', outputId: 'panels' },
          to: { nodeId: 'annotationLayer', inputId: 'panels' }
        },
        {
          id: 'conn4',
          from: { nodeId: 'annotationLayer', outputId: 'annotated' },
          to: { nodeId: 'styleEnhancer', inputId: 'input' }
        },
        {
          id: 'conn5',
          from: { nodeId: 'styleEnhancer', outputId: 'output' },
          to: { nodeId: 'output', inputId: 'storyboard' }
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