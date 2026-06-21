import { RouterProvider } from 'react-router-dom';

import { Toaster } from '@/shared/ui';
import { QueryProvider } from './providers/query-provider';
import { router } from './router/routes';

/** Application composition root: providers → router → global overlays. */
export function App() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
      <Toaster />
    </QueryProvider>
  );
}
