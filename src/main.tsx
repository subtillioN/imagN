import React from 'react';
import ReactDOM from 'react-dom/client';
import { MainView } from './components/MainView';
import { AppThemeProvider } from './components/ThemeProvider';

// Create initial sources for the MainView
const createStream = () => {
  return {
    subscribe: (callback: any) => {
      return () => {};
    }
  };
};

// Remove the forced dark theme styles that were added previously
const existingStyles = document.head.querySelectorAll('style');
existingStyles.forEach(style => {
  if (style.textContent?.includes('forceDarkTheme')) {
    document.head.removeChild(style);
  }
});

// Add code to check for old buttons and remove them
window.addEventListener('DOMContentLoaded', () => {
  // Try to find any buttons matching the XPath /html/body/div/div/button
  const oldButtons = document.querySelectorAll('body > div > div > button');
  console.log('Found potential old dev tools buttons:', oldButtons);
  
  // Remove any found buttons that aren't part of our React app
  oldButtons.forEach(button => {
    if (!button.closest('#root')) {
      console.log('Removing old button:', button);
      button.remove();
    }
  });
});

// Initialize sources
const sources = {
  state: {
    imageConfig$: createStream(),
    progress$: createStream(),
    results$: createStream()
  }
};

// Initialize React app
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

// Render the application with the theme provider
root.render(
  <React.StrictMode>
    <AppThemeProvider>
      <MainView sources={sources} />
    </AppThemeProvider>
  </React.StrictMode>
);

// For Hot Module Replacement
// @ts-ignore: Unreachable code error
if (import.meta && import.meta.hot) {
  // @ts-ignore: Unreachable code error
  import.meta.hot.accept();
} 