import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { api } from './api/endpoints';
import { App } from './App';
import { env } from './config/env';
import { ErrorBoundary } from './monitoring/ErrorBoundary';
import { startCrashReporting } from './monitoring/crashReporter';
import './styles/tokens.css';
import './styles/global.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

void startCrashReporting(import.meta.env.VITE_SENTRY_DSN, env.appEnv);

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <App api={api} />
    </ErrorBoundary>
  </StrictMode>,
);
