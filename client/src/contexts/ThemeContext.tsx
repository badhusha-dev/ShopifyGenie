
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme } from '../design/tokens';

interface ThemeContextType {
  isDark: boolean;
  currentTheme: Theme;
  toggleDarkMode: () => void;
  setTheme: (theme: Theme) => void;
  applyTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme-mode');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme-color');
    return (saved as Theme) || 'emerald';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme-mode', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    applyTheme(currentTheme);
    localStorage.setItem('theme-color', currentTheme);
  }, [currentTheme]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  const setTheme = (theme: Theme) => {
    setCurrentTheme(theme);
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

  const value = {
    isDark,
    currentTheme,
    toggleDarkMode,
    setTheme,
    applyTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
