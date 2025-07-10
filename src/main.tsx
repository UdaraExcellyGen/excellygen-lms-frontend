// src/main.tsx or src/index.tsx
import emailjs from '@emailjs/browser';
emailjs.init("mGHBEY_RstNcCUiXB");

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';  // Add this import
import './i18n'; // Add this import

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);