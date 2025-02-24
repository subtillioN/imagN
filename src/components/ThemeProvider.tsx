import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { ThemeName, themes } from '../theme';

// Create theme context
interface ThemeContextType {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: 'dark',
  setTheme: () => {},
});

// Hook to use the theme context
export const useAppTheme = () => useContext(ThemeContext);

interface AppThemeProviderProps {
  children: React.ReactNode;
}

export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  // Load theme from local storage or default to 'dark'
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(() => {
    const savedTheme = localStorage.getItem('app-theme');
    return (savedTheme as ThemeName) || 'dark';
  });

  // Get the theme object based on the current theme name
  const theme = useMemo(() => {
    const themeOption = themes.find(t => t.name === currentTheme);
    return themeOption ? themeOption.theme : themes[0].theme;
  }, [currentTheme]);

  // Set theme and save to local storage
  const setTheme = (themeName: ThemeName) => {
    setCurrentTheme(themeName);
    localStorage.setItem('app-theme', themeName);
  };

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('app-theme', currentTheme);
  }, [currentTheme]);

  // Theme context value
  const contextValue = useMemo(() => ({
    currentTheme,
    setTheme,
  }), [currentTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default AppThemeProvider; 