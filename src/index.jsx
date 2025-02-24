import React from 'react';
import { createRoot } from 'react-dom/client';
import { MainView } from './components/MainView';

// Create initial sources for the MainView
import subject from 'callbag-subject';

const createStream = () => {
  const subj = subject();
  return {
    subscribe: (callback) => {
      subj(0, callback);
      return () => subj(2);
    }
  };
};

const sources = {
  state: {
    imageConfig$: createStream(),
    progress$: createStream(),
    results$: createStream()
  }
};

// Initialize React app
const container = document.getElementById('app');
const root = createRoot(container);

// Render the MainView component
root.render(
  <React.StrictMode>
    <MainView sources={sources} />
  </React.StrictMode>
);