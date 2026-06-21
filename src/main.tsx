import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app';
import '@/app/i18n';
import '@/app/styles/global.css';
import 'react-day-picker/style.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
