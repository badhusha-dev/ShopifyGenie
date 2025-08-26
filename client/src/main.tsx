import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.debug('Unhandled promise rejection (handled):', event.reason);
  // Prevent the default behavior that logs to console
  event.preventDefault();
});

// Global error handler
window.addEventListener('error', (event) => {
  console.debug('Global error (handled):', event.error);
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
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
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