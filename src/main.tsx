import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
if (!container) {
    throw new Error('Failed to find root element');
}

const root = createRoot(container);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// For Hot Module Replacement
// @ts-ignore: Unreachable code error
if (import.meta && import.meta.hot) {
  // @ts-ignore: Unreachable code error
  import.meta.hot.accept();
} 