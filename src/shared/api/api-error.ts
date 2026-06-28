/**
 * Typed API error thrown by the HTTP client. Mirrors the Memolink error
 * envelope (v4.1 §2): `status` is the HTTP status, `errorCode` the business code,
 * `errors` the per-field validation list, `retryAfter` the 429 backoff (seconds).
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status = 500,
    readonly errorCode: number | null = null,
    readonly errors: string[] | null = null,
    readonly retryAfter: number | null = null,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** A field-validation failure carrying one or more messages. */
  get isValidation(): boolean {
    return this.status === 400 && Array.isArray(this.errors) && this.errors.length > 0;
  }

  /** A quota / conflict error the UI should surface distinctly (409). */
  get isConflict(): boolean {
    return this.status === 409;
  }

  /** Rate-limited — honor `retryAfter`. */
  get isRateLimited(): boolean {
    return this.status === 429;
  }
}
