import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { installGlobalErrorHandlers } from './lib/errorReporting';
import './index.css';

// Errores fuera de React (eventos, promesas sin capturar) también quedan registrados.
installGlobalErrorHandlers();

const rootElement = document.getElementById('root');
if (rootElement === null) {
  throw new Error('No se encontró el elemento #root en index.html.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary level="app">
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
