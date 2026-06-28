/**
 * Runtime configuration. Values come from Vite env vars (`.env`, `.env.local`).
 * The Memolink REST API base — local dev defaults to the changelog's `:8888`.
 */
export const env = {
  /** Absolute base URL of the Memolink API (no trailing slash). */
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8888').replace(/\/$/, ''),
  /** Google Maps JS API key (location picker). Empty → map disabled gracefully. */
  googleMapsApiKey: (import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '').trim(),
} as const;
