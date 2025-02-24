import { NodeTypes, createNode } from '../NodeTypes';

describe('NodeTypes', () => {
  describe('Node Type Definitions', () => {
    it('should define IMAGE_INPUT node type', () => {
      expect(NodeTypes.IMAGE_INPUT).toBeDefined();
      expect(NodeTypes.IMAGE_INPUT.type).toBe('IMAGE_INPUT');
      expect(NodeTypes.IMAGE_INPUT.inputs).toHaveLength(0);
      expect(NodeTypes.IMAGE_INPUT.outputs).toHaveLength(1);
      expect(NodeTypes.IMAGE_INPUT.outputs[0].id).toBe('image');
    });

    it('should define IMAGE_FILTER node type', () => {
      expect(NodeTypes.IMAGE_FILTER).toBeDefined();
      expect(NodeTypes.IMAGE_FILTER.type).toBe('IMAGE_FILTER');
      expect(NodeTypes.IMAGE_FILTER.inputs).toHaveLength(2);
      expect(NodeTypes.IMAGE_FILTER.outputs).toHaveLength(1);
      expect(NodeTypes.IMAGE_FILTER.outputs[0].id).toBe('filtered');
    });

    it('should define STABLE_DIFFUSION node type', () => {
      expect(NodeTypes.STABLE_DIFFUSION).toBeDefined();
      expect(NodeTypes.STABLE_DIFFUSION.inputs).toHaveLength(3);
      expect(NodeTypes.STABLE_DIFFUSION.outputs).toHaveLength(1);
    });

    it('should define OUTPUT node type', () => {
      expect(NodeTypes.OUTPUT).toBeDefined();
      expect(NodeTypes.OUTPUT.inputs).toHaveLength(1);
      expect(NodeTypes.OUTPUT.outputs).toHaveLength(0);
    });
  });

  describe('createNode', () => {
    it('should create a node with correct structure', () => {
      const position = { x: 100, y: 200 };
      const node = createNode('IMAGE_INPUT', position);

      expect(node).toEqual({
        id: expect.stringContaining('IMAGE_INPUT-'),
        type: 'IMAGE_INPUT',
        title: 'Image Input',
        position,
        inputs: [],
        outputs: [{ id: 'image', name: 'Image' }]
      });
    });

    it('should create unique IDs for each node', () => {
      const node1 = createNode('IMAGE_INPUT', { x: 0, y: 0 });
      const node2 = createNode('IMAGE_INPUT', { x: 0, y: 0 });

      expect(node1.id).not.toBe(node2.id);
    });

    it('should throw error for invalid node type', () => {
      expect(() => {
        createNode('INVALID_TYPE', { x: 0, y: 0 });
      }).toThrow('Invalid node type: INVALID_TYPE');
    });

    it('should create node with correct inputs and outputs', () => {
      const node = createNode('IMAGE_FILTER', { x: 0, y: 0 });

      expect(node.inputs).toEqual([
        { id: 'image', name: 'Image' },
        { id: 'strength', name: 'Strength' }
      ]);
      expect(node.outputs).toEqual([
        { id: 'filtered', name: 'Filtered' }
      ]);
    });
  });
});