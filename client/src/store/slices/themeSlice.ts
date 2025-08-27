
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Theme } from '../../design/tokens';

interface ThemeState {
  isDark: boolean;
  currentTheme: Theme;
}

const getInitialDarkMode = (): boolean => {
  const saved = localStorage.getItem('theme-mode');
  if (saved) {
    return saved === 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem('theme-color');
  return (saved as Theme) || 'emerald';
};

const initialState: ThemeState = {
  isDark: getInitialDarkMode(),
  currentTheme: getInitialTheme(),
};

const applyTheme = (theme: Theme) => {
  // Remove existing theme classes
  document.body.classList.remove('theme-emerald', 'theme-blue', 'theme-purple', 'theme-coral');
  
  // Add new theme class
  document.body.classList.add(`theme-${theme}`);

  // Update CSS custom properties dynamically
  const themeColors = {
    emerald: { main: '#059669', light: '#10b981', dark: '#047857' },
    blue: { main: '#2563eb', light: '#3b82f6', dark: '#1d4ed8' },
    purple: { main: '#9333ea', light: '#a855f7', dark: '#7c3aed' },
    coral: { main: '#dc2626', light: '#ef4444', dark: '#b91c1c' },
  };

  const colors = themeColors[theme];
  document.documentElement.style.setProperty('--bs-primary', colors.main);
  document.documentElement.style.setProperty('--shopify-green', colors.main);
  document.documentElement.style.setProperty('--shopify-green-light', colors.light);
  document.documentElement.style.setProperty('--shopify-green-dark', colors.dark);
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDark = !state.isDark;
      document.documentElement.setAttribute('data-bs-theme', state.isDark ? 'dark' : 'light');
      localStorage.setItem('theme-mode', state.isDark ? 'dark' : 'light');
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.currentTheme = action.payload;
      applyTheme(action.payload);
      localStorage.setItem('theme-color', action.payload);
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDark = action.payload;
      document.documentElement.setAttribute('data-bs-theme', action.payload ? 'dark' : 'light');
      localStorage.setItem('theme-mode', action.payload ? 'dark' : 'light');
    },
  },
});

export const { toggleDarkMode, setTheme, setDarkMode } = themeSlice.actions;
export default themeSlice.reducer;
