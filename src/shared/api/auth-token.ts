/**
 * Bearer-token holder. Lives in `shared` (the lowest FSD layer) so the HTTP
 * client can read the access token without importing the session entity. The
 * auth feature pushes the token in via `set` and wires `configure` with refresh
 * + sign-out handlers, which the client invokes on a 401.
 */
type RefreshFn = () => Promise<string | null>;

let accessToken: string | null = null;
let refreshFn: RefreshFn | null = null;
let onUnauthorized: (() => void) | null = null;
let refreshing: Promise<string | null> | null = null;

export const authToken = {
  get: (): string | null => accessToken,
  set: (token: string | null): void => {
    accessToken = token;
  },
  configure: (opts: { refresh?: RefreshFn; onUnauthorized?: () => void }): void => {
    if (opts.refresh) refreshFn = opts.refresh;
    if (opts.onUnauthorized) onUnauthorized = opts.onUnauthorized;
  },
  /** Refresh the access token (deduped — concurrent 401s share one refresh). */
  refresh: (): Promise<string | null> => {
    if (!refreshFn) return Promise.resolve(null);
    if (!refreshing) {
      refreshing = refreshFn().finally(() => {
        refreshing = null;
      });
    }
    return refreshing;
  },
  signalUnauthorized: (): void => onUnauthorized?.(),
};
