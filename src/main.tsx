// src/main.tsx
import emailjs from '@emailjs/browser';
emailjs.init("mGHBEY_RstNcCUiXB");

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import './i18n'; // Add this import

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);