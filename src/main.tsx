import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely suppress benign Recharts width/height warnings and cross-origin Script errors during initial component load and tab switching
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
        lower.includes('script error')
      ) {
        return true;
      }
      if (typeof arg === 'object') {
        const json = JSON.stringify(arg).toLowerCase();
        if (json.includes('script error')) {
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

  // Prevent cross-origin "Script error." bubbles from third-party iframes (such as YouTube Player SDK or analytics)
  window.addEventListener('error', (event) => {
    if (event.target && event.target !== window) {
      // Ignore static element load errors (such as <img> failing to load)
      return;
    }
    const msgStr = String(event.message || (event.error && event.error.message) || '');
    if (
      !event.message || 
      msgStr === 'Script error.' || 
      !event.filename || 
      msgStr.toLowerCase().includes('script error')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return true;
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason) {
      const reasonStr = String(event.reason.message || event.reason);
      if (reasonStr.toLowerCase().includes('script error')) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

