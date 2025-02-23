import { from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export class WorkflowStorageService {
  constructor() {
    this.storageKey = 'imagn_workflows';
  }

  serializeWorkflow(workflow) {
    return {
      id: workflow.id || `workflow-${Date.now()}`,
      name: workflow.name || 'Untitled Workflow',
      nodes: workflow.nodes.map(node => ({
        ...node,
        position: {
          x: node.position?.x || 0,
          y: node.position?.y || 0
        }
      })),
      connections: workflow.connections.map(conn => ({
        id: conn.id,
        from: {
          nodeId: conn.from.nodeId,
          outputId: conn.from.outputId
        },
        to: {
          nodeId: conn.to.nodeId,
          inputId: conn.to.inputId
        }
      }))
    };
  }

  saveWorkflow(workflow) {
    return from(Promise.resolve()).pipe(
      map(() => {
        const serialized = this.serializeWorkflow(workflow);
        const workflows = this.getAllWorkflows();
        const existingIndex = workflows.findIndex(w => w.id === serialized.id);

        if (existingIndex >= 0) {
          workflows[existingIndex] = serialized;
        } else {
          workflows.push(serialized);
        }

        localStorage.setItem(this.storageKey, JSON.stringify(workflows));
        return serialized;
      }),
      catchError(error => {
        console.error('Error saving workflow:', error);
        throw error;
      })
    );
  }

  loadWorkflow(id) {
    return from(Promise.resolve()).pipe(
      map(() => {
        const workflows = this.getAllWorkflows();
        const workflow = workflows.find(w => w.id === id);
        if (!workflow) {
          throw new Error(`Workflow with id ${id} not found`);
        }
        return workflow;
      }),
      catchError(error => {
        console.error('Error loading workflow:', error);
        throw error;
      })
    );
  }

  getAllWorkflows() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting workflows:', error);
      return [];
    }
  }

  deleteWorkflow(id) {
    return from(Promise.resolve()).pipe(
      map(() => {
        const workflows = this.getAllWorkflows();
        const filteredWorkflows = workflows.filter(w => w.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(filteredWorkflows));
        return true;
      }),
      catchError(error => {
        console.error('Error deleting workflow:', error);
        throw error;
      })
    );
  }
}