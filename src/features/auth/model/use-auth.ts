import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { useSessionStore } from '@/entities/session';
import { paths } from '@/shared/config/paths';
import { authApi, type Credentials, type RegisterInput } from '../api/auth.api';

/** Sign in → establish session → land on the organizer dashboard. */
export function useLogin() {
  const signIn = useSessionStore((s) => s.signIn);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (creds: Credentials) => authApi.login(creds),
    onSuccess: (viewer) => {
      signIn(viewer);
      navigate(paths.dashboard, { replace: true });
    },
  });
}

/** Create workspace → establish session. */
export function useRegister() {
  const signIn = useSessionStore((s) => s.signIn);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: (viewer) => {
      signIn(viewer);
      navigate(paths.dashboard, { replace: true });
    },
  });
}

export function usePasswordReset() {
  return useMutation({ mutationFn: (email: string) => authApi.requestPasswordReset(email) });
}

/** Clear the session and return to the login screen. */
export function useSignOut() {
  const signOut = useSessionStore((s) => s.signOut);
  const navigate = useNavigate();
  return () => {
    signOut();
    navigate(paths.login, { replace: true });
  };
}
