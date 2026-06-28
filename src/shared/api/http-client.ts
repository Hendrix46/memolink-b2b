import axios, {
  AxiosHeaders,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

import { env } from '@/shared/config/env';
import { ApiError } from './api-error';
import { authToken } from './auth-token';
import type { BaseContractResponse } from './contract';

type QueryValue = string | number | boolean | undefined | null;

export interface RequestOptions {
  /** Query-string params; `undefined`/`null` entries are dropped. */
  query?: Record<string, QueryValue>;
  /** JSON request body (ignored when `formData`/`binary` is set). */
  body?: unknown;
  /** Multipart body — axios sets the boundary content-type. */
  formData?: FormData;
  /** Raw octet-stream body (resumable upload parts). */
  binary?: BodyInit;
  /** Return the raw axios `Response` (byte streams, redirects). */
  raw?: boolean;
  /** Skip the Authorization header (public endpoints). */
  skipAuth?: boolean;
  /** Extra headers (e.g. `X-Gallery-Unlock-Token`). */
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/** Per-request flags carried on the axios config and read by the interceptors. */
interface MlConfig extends InternalAxiosRequestConfig {
  skipAuth?: boolean;
  /** Internal: prevents an infinite refresh loop. */
  _retried?: boolean;
}

const client = axios.create({
  baseURL: env.apiBaseUrl,
  // Let the envelope's success flag + status code drive errors; never throw on
  // an empty 2xx body. 4xx/5xx still reject and are mapped in the interceptor.
  validateStatus: (status) => status >= 200 && status < 300,
});

// Request interceptor — attach the bearer token (unless the call opts out).
client.interceptors.request.use((config: MlConfig) => {
  config.headers ??= new AxiosHeaders();
  config.headers.set('Accept', 'application/json');
  if (!config.skipAuth) {
    const token = authToken.get();
    if (token) config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Response interceptor — 401 refresh-and-retry, 429 backoff, error mapping.
client.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<BaseContractResponse<unknown>>) => {
    const config = error.config as MlConfig | undefined;
    const status = error.response?.status;

    // 401 → refresh the token once, then replay the original request.
    if (status === 401 && config && !config.skipAuth && !config._retried) {
      const refreshed = await authToken.refresh();
      if (refreshed) {
        config._retried = true;
        return client(config);
      }
      authToken.signalUnauthorized();
    }

    // 429 carries a slim body + Retry-After (v4.1 §2).
    if (status === 429) {
      const retryAfter = Number(error.response?.headers?.['retry-after']) || null;
      return Promise.reject(
        new ApiError('Rate limit exceeded. Please try again later.', 429, 429, null, retryAfter),
      );
    }

    const data = error.response?.data;
    return Promise.reject(
      new ApiError(
        data?.message ?? error.message ?? 'Request failed',
        status ?? 0,
        data?.errorCode ?? status ?? 0,
        data?.errors ?? null,
      ),
    );
  },
);

async function request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const headers = new AxiosHeaders(opts.headers);

  let data: unknown;
  if (opts.formData) {
    data = opts.formData; // axios sets multipart content-type + boundary
  } else if (opts.binary !== undefined) {
    data = opts.binary;
    headers.set('Content-Type', 'application/octet-stream');
  } else if (opts.body !== undefined) {
    data = opts.body; // axios serializes JSON + sets content-type
  }

  const res = await client.request<BaseContractResponse<T>>({
    url: path,
    method,
    params: opts.query,
    data,
    headers,
    signal: opts.signal,
    responseType: opts.raw ? 'blob' : 'json',
    // Custom flags consumed by the interceptors.
    skipAuth: opts.skipAuth,
  } as MlConfig);

  if (opts.raw) return res as unknown as T;

  const envelope = res.data;
  // Defensive: a malformed `success:false` slipping through a 2xx.
  if (envelope && typeof envelope === 'object' && envelope.success === false) {
    throw new ApiError(
      envelope.message ?? 'Request failed',
      res.status,
      envelope.errorCode ?? res.status,
      envelope.errors ?? null,
    );
  }

  return (envelope && typeof envelope === 'object' ? envelope.data : (undefined as T));
}

/** Typed Memolink HTTP client — axios under the hood; unwraps the envelope. */
export const http = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>('GET', path, opts),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('POST', path, { ...opts, body }),
  put: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PUT', path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>('PATCH', path, { ...opts, body }),
  delete: <T>(path: string, opts?: RequestOptions) => request<T>('DELETE', path, opts),
};

/** The configured axios instance, for advanced/raw use. */
export { client as axiosClient };
