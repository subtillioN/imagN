import React, { useState } from 'react';
import { MainView } from './components/MainView';
import { AppThemeProvider } from './components/ThemeProvider';
import DevToolsButton from './components/DevToolsButton';
import DevToolsPanel from './components/DevToolsPanel';

// Create initial sources for the MainView
const createStream = () => {
  return {
    subscribe: (callback: any) => {
      return () => {};
    }
  };
};

// Initialize sources
const sources = {
  state: {
    imageConfig$: createStream(),
    progress$: createStream(),
    results$: createStream()
  }
};

const App: React.FC = () => {
  const [showDevTools, setShowDevTools] = useState(false);

  return (
    <AppThemeProvider>
      <div style={{ position: 'relative' }}>
        {/* Main App */}
        <MainView sources={sources} />

        {/* Dev Tools */}
        <DevToolsButton onClick={() => setShowDevTools(!showDevTools)} isOpen={showDevTools} />
        <DevToolsPanel isOpen={showDevTools} />
      </div>
    </AppThemeProvider>
  );
};

export default App; 