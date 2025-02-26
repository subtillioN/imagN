import xs, { Stream } from 'xstream';
import { WorkflowPreset } from '../types/workflow';
import { workflowPresetService } from '../services/workflowPresets';
import { WorkflowStorageService } from '../services/workflowStorage';
import { from } from 'rxjs';
import { Observable } from 'rxjs';

// Helper function to convert RxJS Observable to xstream Stream
function fromRxJS<T>(observable: Observable<T>): Stream<T> {
  return xs.create({
    start: listener => {
      const subscription = observable.subscribe({
        next: value => listener.next(value),
        error: err => listener.error(err),
        complete: () => listener.complete()
      });
      return {
        unsubscribe: () => subscription.unsubscribe()
      };
    },
    stop: () => {}
  });
}

export interface WorkflowSource {
  presets$: Stream<WorkflowPreset[]>;
  storage: WorkflowStorageService;
}

export interface WorkflowSink {
  loadPresets$: Stream<void>;
  saveWorkflow$: Stream<WorkflowPreset>;
  updateWorkflow$: Stream<WorkflowPreset>;
  deleteWorkflow$: Stream<string>;
}

export function makeWorkflowDriver() {
  const storage = new WorkflowStorageService();
  
  return function workflowDriver(sink$: Stream<WorkflowSink>) {
    // Handle preset loading
    const presets$ = sink$.map(sink => sink.loadPresets$)
      .flatten()
      .map(() => fromRxJS(workflowPresetService.getAllPresets()))
      .flatten();

    // Handle workflow operations
    sink$.map(sink => sink.saveWorkflow$)
      .flatten()
      .addListener({
        next: workflow => storage.saveWorkflow(workflow)
      });

    sink$.map(sink => sink.updateWorkflow$)
      .flatten()
      .addListener({
        next: workflow => storage.updateWorkflow(workflow)
      });

    sink$.map(sink => sink.deleteWorkflow$)
      .flatten()
      .addListener({
        next: id => storage.deleteWorkflow(id)
      });

    return {
      presets$,
      storage
    };
  };
} 