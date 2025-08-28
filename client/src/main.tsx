import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";
import { Provider } from 'react-redux';
import { store } from './store';

// Global error handlers
window.addEventListener('unhandledrejection', (event) => {
  // Log the error but don't spam the console with HMR ping failures
  if (event.reason?.message?.includes('Failed to fetch') && 
      event.reason?.stack?.includes('ping')) {
    event.preventDefault(); // Prevent console spam from HMR pings
    return;
  }

  console.error('Unhandled promise rejection:', event.reason);

  // You could send this to an error reporting service
  // errorReportingService.captureException(event.reason);
});

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Ensure DOM is ready
const initializeApp = () => {
  const container = document.getElementById("root");
  if (!container) {
    console.error("Root element not found");
    return;
  }

  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </Provider>
      </React.StrictMode>
    );
    console.log("App initialized successfully");
  } catch (error) {
    console.error("Failed to initialize app:", error);
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}