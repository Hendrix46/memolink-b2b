import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { UserOption } from './types';

interface UserDirectoryState {
  /** userId → resolved display identity, accumulated from every named source. */
  byId: Record<string, UserOption>;
  record: (users: UserOption[]) => void;
}

/**
 * Client-side user directory. The backend returns id-only references in many
 * places (agenda speakers, org members, photographers) — no name/avatar. This
 * cache accumulates identities from every source that *does* carry names
 * (user search, the picker, the directory seed) and persists them, so those
 * id-only lists can render real names instead of raw UUIDs.
 */
export const useUserDirectory = create<UserDirectoryState>()(
  persist(
    (set) => ({
      byId: {},
      record: (users) =>
        set((state) => {
          let changed = false;
          const byId = { ...state.byId };
          for (const u of users) {
            const prev = byId[u.userId];
            if (!prev || prev.name !== u.name || prev.avatarUrl !== u.avatarUrl) {
              byId[u.userId] = u;
              changed = true;
            }
          }
          return changed ? { byId } : state;
        }),
    }),
    { name: 'memolink.user-directory' },
  ),
);

/** Resolve a single userId to a cached display name (undefined when unknown). */
export function useUserName(userId: string | undefined): string | undefined {
  return useUserDirectory((s) => (userId ? s.byId[userId]?.name : undefined));
}

/** The whole id→identity map, for resolving many ids in a list without per-row hooks. */
export function useUserDirectoryMap(): Record<string, UserOption> {
  return useUserDirectory((s) => s.byId);
}
