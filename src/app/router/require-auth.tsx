import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useIsAuthenticated } from '@/entities/session';
import { paths } from '@/shared/config/paths';

/** Gate protected routes — unauthenticated users go to login, preserving intent. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const authed = useIsAuthenticated();
  const location = useLocation();
  if (!authed) {
    return <Navigate to={paths.login} replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

/** Keep already-authenticated users out of the auth screens. */
export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const authed = useIsAuthenticated();
  if (authed) return <Navigate to={paths.dashboard} replace />;
  return <>{children}</>;
}
