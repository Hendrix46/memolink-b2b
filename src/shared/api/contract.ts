/**
 * Wire contracts shared by every Memolink endpoint (Frontend Integration Guide
 * v4.1 §2). `BaseContractResponse<T>` wraps every JSON response; the two page
 * shapes cover offset (`PagedResponse`) and keyset (`CursorPage`) pagination.
 */

export interface BaseContractResponse<T> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
  timestamp: string;
  errorCode: number | null;
  path: string | null;
  /** Populated only on field-validation failures — one entry per invalid field. */
  errors: string[] | null;
}

/** Offset pagination — pages are 1-indexed; `size` is capped at 100. */
export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/** Keyset pagination — pass the opaque `nextCursor` back as `?cursor=`. */
export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
