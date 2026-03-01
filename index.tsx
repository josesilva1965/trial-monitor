import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Error: Could not find root element to mount to.</div>';
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Application initialization error:", error);
  rootElement.innerHTML = `<div style="padding: 20px; color: #ef4444; font-family: sans-serif;">
    <h2 style="font-weight: bold; margin-bottom: 8px;">Application Error</h2>
    <p>Something went wrong while starting the app.</p>
    <pre style="background: #f3f4f6; padding: 12px; border-radius: 8px; margin-top: 12px; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
  </div>`;
}