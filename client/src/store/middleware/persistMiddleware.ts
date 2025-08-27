
import { Middleware } from '@reduxjs/toolkit';

export const persistMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  // Persist specific state changes to localStorage
  const state = store.getState();

  // Persist theme settings
  if (action.type?.startsWith('theme/')) {
    localStorage.setItem('theme-mode', state.theme.isDark ? 'dark' : 'light');
    localStorage.setItem('theme-color', state.theme.currentTheme);
  }

  // Persist UI settings
  if (action.type?.startsWith('ui/')) {
    localStorage.setItem('language', state.ui.currentLanguage);
    localStorage.setItem('sidebar-collapsed', state.ui.sidebarCollapsed.toString());
  }

  // Persist auth token
  if (action.type === 'auth/loginUser/fulfilled' || action.type === 'auth/registerUser/fulfilled') {
    localStorage.setItem('auth_token', state.auth.token);
  }

  if (action.type === 'auth/logout') {
    localStorage.removeItem('auth_token');
  }

  return result;
};
