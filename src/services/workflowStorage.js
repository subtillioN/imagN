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
      description: workflow.description || '',
      category: workflow.category || 'user',
      type: workflow.type || 'custom',
      tags: this.ensureWorkflowTags(workflow),
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

  ensureWorkflowTags(workflow) {
    const tags = Array.isArray(workflow.tags) ? [...workflow.tags] : [];
    
    if (!tags.includes('user')) {
      tags.push('user');
    }
    
    if (workflow.category && !tags.includes(workflow.category) && 
        workflow.category !== 'user' && workflow.category !== 'default') {
      tags.push(workflow.category);
    }
    
    if (workflow.type && !tags.includes(workflow.type)) {
      tags.push(workflow.type);
    }
    
    return tags;
  }

  saveWorkflow(workflow) {
    // Ensure workflow has required fields
    const workflowToSave = {
      ...workflow,
      id: workflow.id || this.generateId(),
      name: workflow.name || 'Untitled Workflow',
      description: workflow.description || '',
      category: workflow.category || 'user',
      type: workflow.type || 'custom',
      tags: this.ensureWorkflowTags(workflow),
    };

    // Save to localStorage
    const workflows = this.getAllWorkflows();
    workflows.push(workflowToSave);
    localStorage.setItem(this.storageKey, JSON.stringify(workflows));
    
    // Notify subscribers
    this.workflowsSubject.next(workflows);
    return workflowToSave;
  }

  updateWorkflow(workflow) {
    // Ensure workflow has required fields
    const workflowToUpdate = {
      ...workflow,
      name: workflow.name || 'Untitled Workflow',
      description: workflow.description || '',
      category: workflow.category || 'user',
      type: workflow.type || 'custom',
      tags: this.ensureWorkflowTags(workflow),
    };

    // Get all workflows
    const workflows = this.getAllWorkflows();
    
    // Find the workflow to update
    const index = workflows.findIndex(w => w.id === workflowToUpdate.id);
    
    if (index !== -1) {
      // Update the workflow
      workflows[index] = workflowToUpdate;
      
      // Save to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(workflows));
      
      // Notify subscribers
      this.workflowsSubject.next(workflows);
      
      return workflowToUpdate;
    }
    
    // If workflow not found, save as new
    return this.saveWorkflow(workflow);
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
      const workflows = data ? JSON.parse(data) : [];
      
      // Migrate workflows to the new structure
      return workflows.map(workflow => {
        let updated = { ...workflow };
        
        // Handle legacy workflows with category string
        if (workflow.category && !workflow.categories) {
          updated = {
            ...updated,
            categories: [workflow.category, 'user']
          };
        }
        
        // Ensure categories is an array and includes 'user'
        if (!workflow.categories) {
          updated = {
            ...updated,
            categories: ['user']
          };
        }
        
        // Make sure 'user' is in the categories array
        if (!workflow.categories.includes('user')) {
          updated = {
            ...updated,
            categories: [...workflow.categories, 'user']
          };
        }
        
        // Add new fields if they don't exist
        if (!updated.category) {
          updated.category = 'user';
        }
        
        if (!updated.type) {
          updated.type = 'custom';
        }
        
        if (!updated.tags) {
          // Convert categories to tags, ensuring 'user' is included
          updated.tags = Array.from(new Set([...updated.categories]));
        }
        
        return updated;
      });
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

  migrateWorkflows() {
    try {
      const workflows = JSON.parse(localStorage.getItem('userWorkflows') || '[]');
      const migratedWorkflows = workflows.map(workflow => {
        // Ensure all workflows have the 'user' category in their categories array
        let updated = { ...workflow };
        
        // Handle old format with single category
        if (workflow.category && !workflow.categories) {
          updated = {
            ...updated,
            categories: [workflow.category, 'user']
          };
        }
        
        // Ensure categories is an array and includes 'user'
        if (!workflow.categories) {
          updated = {
            ...updated,
            categories: ['user']
          };
        }
        
        // Make sure 'user' is in the categories array
        if (!workflow.categories.includes('user')) {
          updated = {
            ...updated,
            categories: [...workflow.categories, 'user']
          };
        }
        
        // Add new fields if they don't exist
        if (!workflow.category) {
          updated.category = 'user';
        }
        
        if (!workflow.type) {
          updated.type = 'custom';
        }
        
        if (!workflow.tags) {
          // Convert categories to tags, ensuring 'user' is included
          updated.tags = Array.from(new Set([...updated.categories]));
        }
        
        return updated;
      });
      
      localStorage.setItem('userWorkflows', JSON.stringify(migratedWorkflows));
      return migratedWorkflows;
    } catch (error) {
      console.error('Error migrating workflows:', error);
      return [];
    }
  }
}