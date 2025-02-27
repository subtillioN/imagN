import React, { useState } from 'react';
import { MainView } from './components/MainView';
import { AppThemeProvider } from './components/ThemeProvider';
import Demo from './demo/Demo';

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

        {/* Dev Tools Toggle Button */}
        <button
          onClick={() => setShowDevTools(!showDevTools)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          {showDevTools ? 'Hide Dev Tools' : 'Show Dev Tools'}
        </button>

        {/* Dev Tools Panel */}
        {showDevTools && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'white',
              zIndex: 999,
              overflow: 'auto',
              padding: '20px',
              boxSizing: 'border-box'
            }}
          >
            <Demo />
          </div>
        )}
      </div>
    </AppThemeProvider>
  );
};

export default App; 