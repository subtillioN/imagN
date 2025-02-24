import React from 'react';
import ReactDOM from 'react-dom/client';
import { MainView } from './components/MainView';

// Create initial sources for the MainView
const createStream = () => {
  return {
    subscribe: (callback: any) => {
      return () => {};
    }
  };
};

// Apply dark theme to document with !important flags
document.documentElement.style.cssText = 'background-color: #000000 !important; color: #f8fafc !important;';
document.body.style.cssText = 'background-color: #000000 !important; color: #f8fafc !important;';

// Force dark theme on all elements
const forceDarkTheme = document.createElement('style');
forceDarkTheme.textContent = `
  * {
    background-color: #000000 !important;
    color: #f8fafc !important;
    border-color: #101530 !important;
  }
  
  [class*="panel"], [class*="workspace"], [class*="header"], [class*="footer"], 
  [class*="container"], [class*="content"], [class*="button"] {
    background-color: #000000 !important;
    border-color: #101530 !important;
  }
  
  button, [role="button"], [class*="button"] {
    background-color: rgba(255, 255, 255, 0.02) !important;
    box-shadow: 0 0 5px rgba(0, 0, 255, 0.1) !important;
  }
  
  button:hover, [role="button"]:hover, [class*="button"]:hover {
    background-color: rgba(255, 255, 255, 0.04) !important;
  }
  
  .dev-tools-button-container {
    position: fixed !important;
    top: 16px !important;
    right: 16px !important;
    left: auto !important;
    z-index: 9999 !important;
  }
`;
document.head.appendChild(forceDarkTheme);

const sources = {
  state: {
    imageConfig$: createStream(),
    progress$: createStream(),
    results$: createStream()
  }
};

// Initialize React app
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

// Render the MainView component
root.render(
  <React.StrictMode>
    <MainView sources={sources} />
  </React.StrictMode>
);

// For Hot Module Replacement
if (import.meta && import.meta.hot) {
  import.meta.hot.accept();
} 