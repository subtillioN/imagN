import { from } from 'rxjs';

class WorkflowPresetService {
  constructor() {
    this.imagePresets = new Map();
    this.videoPresets = new Map();
    this.initializePresets();
  }

  initializePresets() {
    // Image Presets
    this.registerImagePreset('styleTransfer', {
      name: 'Style Transfer Suite',
      description: 'Artistic style transfer with customizable parameters',
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

    this.registerImagePreset('portraitEnhance', {
      name: 'Portrait Enhancement',
      description: 'Advanced portrait enhancement with facial feature refinement',
      nodes: [
        {
          id: 'input',
          type: 'ImageInput',
          position: { x: 100, y: 100 }
        },
        {
          id: 'faceDetect',
          type: 'FaceDetector',
          position: { x: 300, y: 100 }
        },
        {
          id: 'skinTone',
          type: 'SkinToneOptimizer',
          position: { x: 500, y: 100 },
          params: {
            smoothing: 0.6,
            brightness: 1.1
          }
        },
        {
          id: 'features',
          type: 'FacialFeatureEnhancer',
          position: { x: 700, y: 100 },
          params: {
            sharpness: 0.7,
            clarity: 0.8
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
          to: { nodeId: 'faceDetect', inputId: 'input' }
        },
        {
          id: 'conn2',
          from: { nodeId: 'faceDetect', outputId: 'face' },
          to: { nodeId: 'skinTone', inputId: 'input' }
        },
        {
          id: 'conn3',
          from: { nodeId: 'skinTone', outputId: 'output' },
          to: { nodeId: 'features', inputId: 'input' }
        },
        {
          id: 'conn4',
          from: { nodeId: 'features', outputId: 'output' },
          to: { nodeId: 'output', inputId: 'image' }
        }
      ]
    });

    this.registerImagePreset('upscale', {
      name: 'High-Quality Image Upscaling',
      description: 'Multi-stage upscaling with detail enhancement',
      nodes: [
        {
          id: 'input',
          type: 'ImageInput',
          position: { x: 100, y: 100 }
        },
        {
          id: 'upscale',
          type: 'Upscaler',
          position: { x: 300, y: 100 },
          params: {
            scale: 2,
            method: 'lanczos'
          }
        },
        {
          id: 'enhance',
          type: 'DetailEnhancer',
          position: { x: 500, y: 100 },
          params: {
            strength: 0.5,
            radius: 1
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
          to: { nodeId: 'upscale', inputId: 'input' }
        },
        {
          id: 'conn2',
          from: { nodeId: 'upscale', outputId: 'output' },
          to: { nodeId: 'enhance', inputId: 'input' }
        },
        {
          id: 'conn3',
          from: { nodeId: 'enhance', outputId: 'output' },
          to: { nodeId: 'output', inputId: 'image' }
        }
      ]
    });

    // Video Presets
    this.registerVideoPreset('styleConsistency', {
      name: 'Style Consistency',
      description: 'Maintain consistent visual style across video frames',
      nodes: [
        {
          id: 'input',
          type: 'VideoInput',
          position: { x: 100, y: 100 }
        },
        {
          id: 'styleAnalyzer',
          type: 'StyleAnalyzer',
          position: { x: 300, y: 100 },
          params: {
            referenceFrame: 0,
            analysisDepth: 0.8
          }
        },
        {
          id: 'temporalFilter',
          type: 'TemporalStyleFilter',
          position: { x: 500, y: 100 },
          params: {
            smoothness: 0.7,
            consistency: 0.85
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
          to: { nodeId: 'styleAnalyzer', inputId: 'input' }
        },
        {
          id: 'conn2',
          from: { nodeId: 'styleAnalyzer', outputId: 'style' },
          to: { nodeId: 'temporalFilter', inputId: 'style' }
        },
        {
          id: 'conn3',
          from: { nodeId: 'input', outputId: 'video' },
          to: { nodeId: 'temporalFilter', inputId: 'video' }
        },
        {
          id: 'conn4',
          from: { nodeId: 'temporalFilter', outputId: 'output' },
          to: { nodeId: 'output', inputId: 'video' }
        }
      ]
    });

    this.registerVideoPreset('videoEnhancement', {
      name: 'Video Enhancement',
      description: 'Comprehensive video quality improvement',
      nodes: [
        {
          id: 'input',
          type: 'VideoInput',
          position: { x: 100, y: 100 }
        },
        {
          id: 'upscale',
          type: 'VideoUpscaler',
          position: { x: 300, y: 100 },
          params: {
            scale: 2,
            method: 'neural'
          }
        },
        {
          id: 'colorGrade',
          type: 'ColorGrading',
          position: { x: 500, y: 100 },
          params: {
            contrast: 1.1,
            saturation: 1.2,
            exposure: 1.0
          }
        },
        {
          id: 'stabilize',
          type: 'Stabilizer',
          position: { x: 700, y: 100 },
          params: {
            smoothness: 0.8
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
          from: { nodeId: 'input', outputId: 'video' },
          to: { nodeId: 'upscale', inputId: 'input' }
        },
        {
          id: 'conn2',
          from: { nodeId: 'upscale', outputId: 'output' },
          to: { nodeId: 'colorGrade', inputId: 'input' }
        },
        {
          id: 'conn3',
          from: { nodeId: 'colorGrade', outputId: 'output' },
          to: { nodeId: 'stabilize', inputId: 'input' }
        },
        {
          id: 'conn4',
          from: { nodeId: 'stabilize', outputId: 'output' },
          to: { nodeId: 'output', inputId: 'video' }
        }
      ]
    });

    this.registerVideoPreset('specialEffects', {
      name: 'Special Effects',
      description: 'Dynamic visual effects and transitions',
      nodes: [
        {
          id: 'input',
          type: 'VideoInput',
          position: { x: 100, y: 100 }
        },
        {
          id: 'effectGenerator',
          type: 'EffectGenerator',
          position: { x: 300, y: 100 },
          params: {
            effectType: 'particle',
            intensity: 0.7
          }
        },
        {
          id: 'transition',
          type: 'TransitionEffect',
          position: { x: 500, y: 100 },
          params: {
            type: 'fade',
            duration: 1.5
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
          to: { nodeId: 'effectGenerator', inputId: 'input' }
        },
        {
          id: 'conn2',
          from: { nodeId: 'effectGenerator', outputId: 'output' },
          to: { nodeId: 'transition', inputId: 'input' }
        },
        {
          id: 'conn3',
          from: { nodeId: 'transition', outputId: 'output' },
          to: { nodeId: 'output', inputId: 'video' }
        }
      ]
    });

    this.registerVideoPreset('frameInterpolation', {
      name: 'Frame Interpolation',
      description: 'Smooth motion enhancement and FPS conversion',
      nodes: [
        {
          id: 'input',
          type: 'VideoInput',
          position: { x: 100, y: 100 }
        },
        {
          id: 'interpolate',
          type: 'FrameInterpolator',
          position: { x: 300, y: 100 },
          params: {
            targetFps: 60,
            method: 'flow-based'
          }
        },
        {
          id: 'smooth',
          type: 'MotionSmoothing',
          position: { x: 500, y: 100 },
          params: {
            strength: 0.75
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
          to: { nodeId: 'interpolate', inputId: 'input' }
        },
        {
          id: 'conn2',
          from: { nodeId: 'interpolate', outputId: 'output' },
          to: { nodeId: 'smooth', inputId: 'input' }
        },
        {
          id: 'conn3',
          from: { nodeId: 'smooth', outputId: 'output' },
          to: { nodeId: 'output', inputId: 'video' }
        }
      ]
    });
  }

  registerImagePreset(id, preset) {
    this.imagePresets.set(id, preset);
  }

  registerVideoPreset(id, preset) {
    this.videoPresets.set(id, preset);
  }

  getImagePreset(id) {
    return from(Promise.resolve(this.imagePresets.get(id)));
  }

  getVideoPreset(id) {
    return from(Promise.resolve(this.videoPresets.get(id)));
  }

  getAllImagePresets() {
    return from(Promise.resolve(Array.from(this.imagePresets.values())));
  }

  getAllVideoPresets() {
    return from(Promise.resolve(Array.from(this.videoPresets.values())));
  }
}

export const workflowPresetService = new WorkflowPresetService();