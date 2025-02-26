import { ReactSource } from '@cycle/react';
import { Source } from 'callbag';
import { WorkflowPreset } from './workflow';
import { WorkflowStorageService } from '../services/workflowStorage';
import { MainViewState } from './state';

export interface MainViewSources {
  react: ReactSource;
  state?: {
    imageConfig$?: Source<any>;
    progress$?: Source<any>;
    results$?: Source<any>;
    workflow$?: Source<any>;
  };
  workflowPresets?: Source<WorkflowPreset[]>;
  storage?: WorkflowStorageService;
}

export interface MainViewProps {
  sources?: MainViewSources;
} 