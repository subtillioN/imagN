import xs, { Stream } from 'xstream';
import { Project } from '../types/project';

export interface StorageSource {
  getItem(key: string): Stream<string | null>;
  getAllProjects(): Stream<Project[]>;
}

export interface StorageSink {
  setItem: Stream<{ key: string; value: string }>;
  removeItem: Stream<string>;
  saveProject: Stream<Project>;
  removeProject: Stream<string>;
}

export function makeStorageDriver() {
  return function storageDriver(sink$: Stream<StorageSink>) {
    // Handle setItem operations
    sink$.map(sink => sink.setItem)
      .flatten()
      .addListener({
        next: ({ key, value }) => {
          try {
            localStorage.setItem(key, value);
          } catch (e) {
            console.error('Failed to save to localStorage:', e);
          }
        }
      });

    // Handle removeItem operations
    sink$.map(sink => sink.removeItem)
      .flatten()
      .addListener({
        next: key => {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            console.error('Failed to remove from localStorage:', e);
          }
        }
      });

    // Handle project save operations
    sink$.map(sink => sink.saveProject)
      .flatten()
      .addListener({
        next: project => {
          try {
            const projects = JSON.parse(localStorage.getItem('projects') || '[]');
            const index = projects.findIndex((p: Project) => p.id === project.id);
            
            if (index >= 0) {
              projects[index] = project;
            } else {
              projects.push(project);
            }
            
            localStorage.setItem('projects', JSON.stringify(projects));
          } catch (e) {
            console.error('Failed to save project:', e);
          }
        }
      });

    // Handle project removal operations
    sink$.map(sink => sink.removeProject)
      .flatten()
      .addListener({
        next: projectId => {
          try {
            const projects = JSON.parse(localStorage.getItem('projects') || '[]');
            const filteredProjects = projects.filter((p: Project) => p.id !== projectId);
            localStorage.setItem('projects', JSON.stringify(filteredProjects));
          } catch (e) {
            console.error('Failed to remove project:', e);
          }
        }
      });

    return {
      getItem: (key: string) => xs.of(localStorage.getItem(key)),
      getAllProjects: () => {
        try {
          const projects = JSON.parse(localStorage.getItem('projects') || '[]');
          return xs.of(projects);
        } catch (e) {
          console.error('Failed to load projects:', e);
          return xs.of([]);
        }
      }
    };
  };
} 