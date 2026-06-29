import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/shared/config/query-keys';
import { userApi } from '../api/user.api';
import { useUserDirectory } from './user-directory';

/**
 * Directory search for picking real users (speakers, co-hosts). Pass an already
 * debounced query; `enabled` gates the request so an empty/closed picker is idle.
 * Results are cached per query and recorded into the user directory so their
 * names can be resolved later wherever the backend returns id-only references.
 */
export function useUserSearch(query: string, enabled = true) {
  const record = useUserDirectory((s) => s.record);
  const trimmed = query.trim();
  const result = useQuery({
    queryKey: queryKeys.users.search(trimmed),
    queryFn: () => userApi.search(trimmed),
    enabled,
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (result.data?.length) record(result.data);
  }, [result.data, record]);

  return result;
}

/**
 * Seed the user directory with a page of users so id-only lists (org members,
 * agenda speakers) can show names. Best-effort: resolves whoever the directory
 * search returns. Call on screens that render many bare userIds.
 */
export function useUserDirectorySeed(enabled = true) {
  const record = useUserDirectory((s) => s.record);
  const result = useQuery({
    queryKey: queryKeys.users.directorySeed,
    queryFn: () => userApi.search('', 1, 100),
    enabled,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (result.data?.length) record(result.data);
  }, [result.data, record]);

  return result;
}
