import { useSessionStore } from '@/entities/session';
import { authToken } from '@/shared/api';
import { paths } from '@/shared/config/paths';
import { authApi } from '../api/auth.api';

/**
 * Wire the shared `authToken` holder to the session store. Called once at app
 * start (from the app layer, to keep `shared` free of entity/feature imports):
 *  - re-push any persisted access token so the first request is authenticated;
 *  - `refresh`: exchange the stored refresh token for a new bundle on a 401;
 *  - `onUnauthorized`: tear the session down and bounce to the login screen.
 */
export function bootstrapAuth(): void {
  const store = useSessionStore.getState();

  if (store.accessToken) authToken.set(store.accessToken);

  authToken.configure({
    refresh: async () => {
      const { refreshToken } = useSessionStore.getState();
      if (!refreshToken) return null;
      try {
        const tokens = await authApi.refresh(refreshToken);
        const { viewer, setSession } = useSessionStore.getState();
        setSession({ tokens, viewer });
        return tokens.accessToken;
      } catch {
        return null;
      }
    },
    onUnauthorized: () => {
      useSessionStore.getState().clearSession();
      if (window.location.pathname !== paths.login) {
        window.location.assign(paths.login);
      }
    },
  });
}
