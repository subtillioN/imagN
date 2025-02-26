export const NodeTypes = {
  // Image Processing Nodes
  IMAGE_INPUT: {
    type: 'IMAGE_INPUT',
    title: 'Image Input',
    inputs: [],
    outputs: [
      { id: 'image', name: 'Image' }
    ]
  },
  
  IMAGE_FILTER: {
    type: 'IMAGE_FILTER',
    title: 'Image Filter',
    inputs: [
      { id: 'image', name: 'Image' },
      { id: 'strength', name: 'Strength' }
    ],
    outputs: [
      { id: 'filtered', name: 'Filtered' }
    ]
  },

  STABLE_DIFFUSION: {
    type: 'STABLE_DIFFUSION',
    title: 'Stable Diffusion',
    inputs: [
      { id: 'prompt', name: 'Prompt' },
      { id: 'seed', name: 'Seed' },
      { id: 'steps', name: 'Steps' }
    ],
    outputs: [
      { id: 'generated', name: 'Generated' }
    ]
  },

  // Video Processing Nodes
  VIDEO_INPUT: {
    type: 'VIDEO_INPUT',
    title: 'Video Input',
    inputs: [],
    outputs: [
      { id: 'video', name: 'Video' },
      { id: 'frames', name: 'Frames' }
    ]
  },

  FRAME_SEQUENCE: {
    type: 'FRAME_SEQUENCE',
    title: 'Frame Sequence',
    inputs: [
      { id: 'frames', name: 'Frames' }
    ],
    outputs: [
      { id: 'sequence', name: 'Sequence' }
    ]
  },

  TRANSITION_EFFECT: {
    type: 'TRANSITION_EFFECT',
    title: 'Transition Effect',
    inputs: [
      { id: 'from', name: 'From' },
      { id: 'to', name: 'To' },
      { id: 'duration', name: 'Duration' }
    ],
    outputs: [
      { id: 'result', name: 'Result' }
    ]
  },

  OUTPUT: {
    type: 'OUTPUT',
    title: 'Output',
    inputs: [
      { id: 'input', name: 'Input' }
    ],
    outputs: []
  }
};

let nodeCounter = 0;

export const createNode = (type, position) => {
  const nodeType = NodeTypes[type];
  if (!nodeType) throw new Error(`Invalid node type: ${type}`);

  return {
    id: `${type}-${++nodeCounter}`,
    type,
    title: nodeType.title,
    position,
    inputs: nodeType.inputs,
    outputs: nodeType.outputs
  };
};