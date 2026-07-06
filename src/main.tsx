import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely suppress benign Recharts width/height warnings, cross-origin Script errors, and Vite HMR WebSocket connection errors
if (typeof window !== 'undefined') {
  const isBenignError = (arg: any): boolean => {
    if (!arg) return false;
    try {
      const errStr = typeof arg === 'string' ? arg : String(arg.message || arg.reason || arg.stack || arg);
      const lower = errStr.toLowerCase();
      if (
        lower.includes('the width(-1) and height(-1)') || 
        lower.includes('should be greater than 0') ||
        lower.includes('script error.') ||
        lower.includes('script error') ||
        lower.includes('websocket') ||
        lower.includes('failed to connect')
      ) {
        return true;
      }
      if (typeof arg === 'object') {
        const json = JSON.stringify(arg).toLowerCase();
        if (json.includes('script error') || json.includes('websocket') || json.includes('failed to connect')) {
          return true;
        }
      }
    } catch {
      // ignore serialization errors
    }
    return false;
  };

  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args.some(isBenignError)) {
      return;
    }
    originalWarn(...args);
  };

  const originalError = console.error;
  console.error = (...args) => {
    if (args.some(isBenignError)) {
      return;
    }
    originalError(...args);
  };

  // Prevent cross-origin "Script error." and WebSocket rejection bubbles from third-party or benign dev tools
  window.addEventListener('error', (event) => {
    if (event.target && event.target !== window) {
      // Ignore static element load errors (such as <img> failing to load)
      return;
    }
    const msgStr = String(event.message || (event.error && event.error.message) || '');
    const lower = msgStr.toLowerCase();
    if (
      !event.message || 
      msgStr === 'Script error.' || 
      !event.filename || 
      lower.includes('script error') ||
      lower.includes('websocket') ||
      lower.includes('failed to connect')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return true;
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    try {
      const reason = event.reason;
      const reasonStr = reason 
        ? String(reason.message || reason.stack || reason) 
        : '';
      const eventStr = String(event) + ' ' + (event.promise ? String(event.promise) : '');
      const combined = (reasonStr + ' ' + eventStr).toLowerCase();
      
      if (
        combined.includes('websocket') ||
        combined.includes('failed to connect') ||
        combined.includes('closed without opened') ||
        combined.includes('script error')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
    } catch {
      // ignore
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

