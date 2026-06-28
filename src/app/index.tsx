import { RouterProvider } from 'react-router-dom';

import { bootstrapAuth } from '@/features/auth';
import { Toaster } from '@/shared/ui';
import { QueryProvider } from './providers/query-provider';
import { router } from './router/routes';

// Wire the token holder (refresh + sign-out) and re-push any persisted token
// once, before the tree renders and any request fires.
bootstrapAuth();

/** Application composition root: providers → router → global overlays. */
export function App() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
      <Toaster />
    </QueryProvider>
  );
}
