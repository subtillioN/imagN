import React, { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';
import styles from './NodeEditor.module.css';

const NodeEditor = () => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [executionState, setExecutionState] = useState({
    isRunning: false,
    progress: 0,
    currentNode: null
  });

  // Stream for handling node execution events
  const executionStream$ = new Subject();

  useEffect(() => {
    const subscription = executionStream$.subscribe({
      next: (event) => {
        switch (event.type) {
          case 'NODE_EXECUTION_START':
            setExecutionState(prev => ({
              ...prev,
              isRunning: true,
              currentNode: event.nodeId
            }));
            break;
          case 'NODE_EXECUTION_COMPLETE':
            setExecutionState(prev => ({
              ...prev,
              progress: prev.progress + 1,
              currentNode: null
            }));
            break;
          case 'WORKFLOW_COMPLETE':
            setExecutionState({
              isRunning: false,
              progress: 0,
              currentNode: null
            });
            break;
          default:
            break;
        }
      },
      error: (error) => {
        console.error('Execution error:', error);
        setExecutionState({
          isRunning: false,
          progress: 0,
          currentNode: null
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const executeWorkflow = async () => {
    if (executionState.isRunning) return;

    try {
      executionStream$.next({ type: 'WORKFLOW_START' });
      
      for (const node of nodes) {
        executionStream$.next({
          type: 'NODE_EXECUTION_START',
          nodeId: node.id
        });

        // Simulate node execution
        await new Promise(resolve => setTimeout(resolve, 1000));

        executionStream$.next({
          type: 'NODE_EXECUTION_COMPLETE',
          nodeId: node.id
        });
      }

      executionStream$.next({ type: 'WORKFLOW_COMPLETE' });
    } catch (error) {
      executionStream$.error(error);
    }
  };

  return (
    <div className={styles.nodeEditor}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.controls}>
        <button 
          onClick={executeWorkflow}
          disabled={executionState.isRunning}
        >
          Execute Workflow
        </button>
      </div>
    </div>
  );
};

export default NodeEditor;