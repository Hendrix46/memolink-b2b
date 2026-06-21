/**
 * Mock transport. The design spec defers all backend wiring (§Out of Scope), so
 * every entity api file resolves through this client. It simulates network
 * latency and an occasional failure so React Query's loading/error/retry paths
 * are exercised exactly as they will be against the real Memolink API.
 *
 * Swapping to a real backend later is a one-file change: replace `resolve` with
 * a `fetch` wrapper and keep the entity-level api signatures identical.
 */

export interface MockOptions {
  /** Artificial latency window in ms. */
  delay?: [min: number, max: number];
  /** Probability (0–1) the request rejects, to surface error states. */
  failureRate?: number;
}

const DEFAULT_DELAY: [number, number] = [180, 520];

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status = 500,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Resolve a value as if it came over the wire. */
export function resolve<T>(value: T | (() => T), options: MockOptions = {}): Promise<T> {
  const [min, max] = options.delay ?? DEFAULT_DELAY;
  const ms = min + Math.random() * (max - min);

  return new Promise<T>((res, rej) => {
    setTimeout(() => {
      if (options.failureRate && Math.random() < options.failureRate) {
        rej(new ApiError('Request failed — please retry.', 503));
        return;
      }
      res(typeof value === 'function' ? (value as () => T)() : value);
    }, ms);
  });
}
