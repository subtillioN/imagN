import darkTheme from './darkTheme';
import lightTheme from './lightTheme';
import contrastTheme from './contrastTheme';
import neonTheme from './neonTheme';
import minimalTheme from './minimalTheme';

export type ThemeName = 'dark' | 'light' | 'contrast' | 'neon' | 'minimal';

export interface ThemeOption {
  name: ThemeName;
  label: string;
  theme: any;
}

export const themes: ThemeOption[] = [
  {
    name: 'dark',
    label: 'Dark Theme',
    theme: darkTheme,
  },
  {
    name: 'light',
    label: 'Light Theme',
    theme: lightTheme,
  },
  {
    name: 'contrast',
    label: 'High Contrast',
    theme: contrastTheme,
  },
  {
    name: 'neon',
    label: 'Neon',
    theme: neonTheme,
  },
  {
    name: 'minimal',
    label: 'Minimal',
    theme: minimalTheme,
  },
];

export { darkTheme, lightTheme, contrastTheme, neonTheme, minimalTheme };

// Default theme
export default darkTheme; 