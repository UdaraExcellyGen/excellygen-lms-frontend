// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import './i18n';

// OPTIMIZATION: Performance monitoring for development
const initializePerformanceMonitoring = () => {
  if ('performance' in window && 'PerformanceObserver' in window) {
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime);
        }
        if (entry.entryType === 'first-input') {
          console.log('FID:', entry.processingStart - entry.startTime);
        }
        if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
          console.log('CLS:', entry.value);
        }
      });
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
  }
};

// OPTIMIZATION: Lazy load EmailJS to reduce initial bundle size
const initializeEmailJS = async () => {
  try {
    const emailjs = await import('@emailjs/browser');
    emailjs.default.init("mGHBEY_RstNcCUiXB");
  } catch (error) {
    console.warn('Failed to initialize EmailJS:', error);
  }
};

// OPTIMIZATION: Initialize app with proper error handling
const initializeApp = async () => {
  try {
    // Initialize performance monitoring in development only
    if (import.meta.env.DEV) {
      initializePerformanceMonitoring();
    }

    // Get root element
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    // Create root and render app
    const root = ReactDOM.createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    // Initialize EmailJS after app renders (non-blocking)
    setTimeout(initializeEmailJS, 2000);

  } catch (error) {
    console.error('Failed to initialize app:', error);
    
    // Fallback error UI
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          display: flex; 
          justify-content: center; 
          align-items: center; 
          height: 100vh; 
          font-family: system-ui, -apple-system, sans-serif;
          background: linear-gradient(135deg, #52007C 0%, #34137C 100%);
          color: white;
          text-align: center;
          margin: 0;
          padding: 20px;
          box-sizing: border-box;
        ">
          <div>
            <h1 style="margin-bottom: 16px; font-size: 24px; font-weight: 600;">Unable to load application</h1>
            <p style="margin-bottom: 24px; opacity: 0.9;">Please refresh the page or contact support if the problem persists.</p>
            <button 
              onclick="window.location.reload()" 
              style="
                padding: 12px 24px;
                background: white;
                color: #52007C;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                font-size: 14px;
              "
              onmouseover="this.style.background='#f5f5f5'"
              onmouseout="this.style.background='white'"
            >
              Reload Page
            </button>
          </div>
        </div>
      `;
    }
  }
};

// Start the application immediately
initializeApp();