/** `UserListItemResponseContract` — a directory row from `GET /api/user/list`. */
export interface UserListItem {
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
}

/** Convenience view-model: a user with a resolved display name. */
export interface UserOption {
  userId: string;
  name: string;
  avatarUrl?: string | null;
}
