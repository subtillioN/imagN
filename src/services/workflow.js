import { Subject, from, of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';

class WorkflowExecutionService {
  constructor() {
    this.executionState$ = new Subject();
    this.nodeRegistry = new Map();
  }

  registerNode(nodeType, executor) {
    this.nodeRegistry.set(nodeType, executor);
  }

  validateGraph(nodes, connections) {
    // Check if all nodes and connections exist
    const hasValidConnections = connections.every(conn => {
      const sourceNode = nodes.find(n => n.id === conn.sourceId);
      const targetNode = nodes.find(n => n.id === conn.targetId);
      return sourceNode && targetNode;
    });

    if (!hasValidConnections) {
      throw new Error('Invalid connections: Some nodes do not exist');
    }

    // Check for cycles in the graph
    const visited = new Set();
    const recursionStack = new Set();

    const hasCycle = (nodeId) => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingConnections = connections.filter(c => c.sourceId === nodeId);
      for (const conn of outgoingConnections) {
        if (hasCycle(conn.targetId)) return true;
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (hasCycle(node.id)) {
        throw new Error('Invalid graph: Cycle detected');
      }
    }

    // Validate node input/output data types
    for (const conn of connections) {
      const sourceNode = nodes.find(n => n.id === conn.sourceId);
      const targetNode = nodes.find(n => n.id === conn.targetId);

      if (!sourceNode.outputs?.[conn.sourceOutput]) {
        throw new Error(`Invalid output port ${conn.sourceOutput} for node ${sourceNode.id}`);
      }

      if (!targetNode.inputs?.[conn.targetInput]) {
        throw new Error(`Invalid input port ${conn.targetInput} for node ${targetNode.id}`);
      }

      const sourceType = sourceNode.outputs[conn.sourceOutput].type;
      const targetType = targetNode.inputs[conn.targetInput].type;

      if (sourceType !== targetType) {
        throw new Error(
          `Type mismatch: Cannot connect ${sourceType} to ${targetType} between nodes ${sourceNode.id} and ${targetNode.id}`
        );
      }
    }

    // Validate required inputs
    for (const node of nodes) {
      if (!node.inputs) continue;

      for (const [inputName, input] of Object.entries(node.inputs)) {
        if (input.required) {
          const hasConnection = connections.some(
            conn => conn.targetId === node.id && conn.targetInput === inputName
          );
          if (!hasConnection) {
            throw new Error(`Required input ${inputName} is not connected for node ${node.id}`);
          }
        }
      }
    }

    return true;
  }

  executeNode(node, inputs) {
    const executor = this.nodeRegistry.get(node.type);
    if (!executor) {
      throw new Error(`No executor found for node type: ${node.type}`);
    }

    return from(Promise.resolve(executor(node, inputs))).pipe(
      tap(() => this.executionState$.next({
        type: 'NODE_EXECUTION_COMPLETE',
        nodeId: node.id,
        status: 'success'
      })),
      catchError(error => {
        this.executionState$.next({
          type: 'NODE_EXECUTION_ERROR',
          nodeId: node.id,
          error: error.message
        });
        return of({ error: error.message });
      })
    );
  }

  executeGraph(nodes, connections) {
    if (!this.validateGraph(nodes, connections)) {
      throw new Error('Invalid node graph');
    }

    this.executionState$.next({ type: 'WORKFLOW_START' });

    // Sort nodes based on dependencies
    const sortedNodes = this.topologicalSort(nodes, connections);

    // Execute nodes in order
    return from(sortedNodes).pipe(
      mergeMap(node => {
        const nodeInputs = this.getNodeInputs(node, connections);
        return this.executeNode(node, nodeInputs);
      }),
      tap({
        complete: () => this.executionState$.next({ type: 'WORKFLOW_COMPLETE' })
      }),
      catchError(error => {
        this.executionState$.next({
          type: 'WORKFLOW_ERROR',
          error: error.message
        });
        return of({ error: error.message });
      })
    );
  }

  topologicalSort(nodes, connections) {
    const visited = new Set();
    const sorted = [];

    function visit(nodeId) {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const outgoingConnections = connections.filter(c => c.sourceId === nodeId);
      for (const conn of outgoingConnections) {
        visit(conn.targetId);
      }

      sorted.unshift(nodes.find(n => n.id === nodeId));
    }

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        visit(node.id);
      }
    }

    return sorted;
  }

  getNodeInputs(node, connections) {
    const inputConnections = connections.filter(c => c.targetId === node.id);
    return inputConnections.reduce((inputs, conn) => {
      inputs[conn.targetInput] = conn.sourceOutput;
      return inputs;
    }, {});
  }

  getExecutionState() {
    return this.executionState$.asObservable();
  }
}

export const workflowService = new WorkflowExecutionService();