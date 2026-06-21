import type { Viewer } from '@/entities/session';
import { ApiError, resolve } from '@/shared/api/mock-client';

export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterInput extends Credentials {
  name: string;
  workspace: string;
}

/** Derive a display name from an email local-part when none is provided. */
function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? 'there';
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase() + p.slice(1))
    .join(' ');
}

function buildViewer(email: string, name: string, workspace: string): Viewer {
  return {
    id: `u_${email}`,
    name,
    email,
    orgRole: 'admin',
    workspace: {
      id: 'ws',
      name: workspace,
      mark: workspace.slice(0, 2).toUpperCase(),
    },
  };
}

/**
 * Mock auth. No real backend (design spec §11) — this validates shape and
 * simulates the wire so the login/register flows, their loading and error
 * states behave exactly as they will against the real Memolink auth service.
 */
export const authApi = {
  login({ email, password }: Credentials): Promise<Viewer> {
    return resolve(() => {
      if (!email.includes('@') || password.length < 6) {
        throw new ApiError('Invalid email or password.', 401);
      }
      return buildViewer(email, nameFromEmail(email), 'JetBrains');
    }, { delay: [500, 900] });
  },

  register({ email, password, name, workspace }: RegisterInput): Promise<Viewer> {
    return resolve(() => {
      if (!email.includes('@') || password.length < 6) {
        throw new ApiError('Please provide a valid email and a password of 6+ characters.', 400);
      }
      return buildViewer(email, name || nameFromEmail(email), workspace || 'My Workspace');
    }, { delay: [600, 1000] });
  },

  requestPasswordReset(email: string): Promise<{ ok: true }> {
    return resolve(() => {
      if (!email.includes('@')) throw new ApiError('Enter a valid email address.', 400);
      return { ok: true } as const;
    }, { delay: [400, 800] });
  },
};
