import { http } from '@/shared/api';
import type { UserListItem, UserOption } from '../model/types';

/** Spring `Page<UserListItemResponseContract>` — only the fields we consume. */
interface UserListPage {
  content: UserListItem[];
  totalElements: number;
  totalPages: number;
  number: number;
}

/** "First Last", falling back to the userId when the directory row has no name. */
function displayName(u: UserListItem): string {
  const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
  return name || u.userId;
}

export const userApi = {
  /**
   * Case-insensitive substring search over first/last name or phone. Blank
   * `query` returns the first page of eligible users. Maps each row to a
   * display-ready `UserOption`.
   */
  async search(query: string, page = 1, size = 12): Promise<UserOption[]> {
    const data = await http.get<UserListPage>('/api/user/list', {
      query: { query: query.trim() || undefined, page, size },
    });
    return (data?.content ?? []).map((u) => ({
      userId: u.userId,
      name: displayName(u),
      avatarUrl: u.avatarUrl ?? null,
    }));
  },
};
