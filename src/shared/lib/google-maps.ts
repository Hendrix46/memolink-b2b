import { env } from '@/shared/config/env';

/**
 * Lazily load the Google Maps JS API (Maps + Places + Geocoding) exactly once.
 * Resolves with the `google` namespace, or rejects when no API key is configured
 * (`VITE_GOOGLE_MAPS_API_KEY`) or the script fails to load. Callers degrade to a
 * plain address form on rejection.
 *
 * We intentionally type the namespace as `any` to avoid pulling in the heavy
 * `@types/google.maps` dependency; usage is isolated to the location picker.
 */
type GoogleNamespace = { maps: Record<string, unknown> } & Record<string, unknown>;

let loader: Promise<GoogleNamespace> | null = null;

const getGlobalGoogle = (): GoogleNamespace | undefined =>
  (window as unknown as { google?: GoogleNamespace }).google;

export function isMapsConfigured(): boolean {
  return Boolean(env.googleMapsApiKey);
}

export function loadGoogleMaps(): Promise<GoogleNamespace> {
  if (loader) return loader;
  const pending = new Promise<GoogleNamespace>((resolve, reject) => {
    if (!env.googleMapsApiKey) {
      reject(new Error('google-maps:no-key'));
      return;
    }
    const existing = getGlobalGoogle();
    if (existing?.maps) {
      resolve(existing);
      return;
    }
    const script = document.createElement('script');
    // Classic synchronous load: Map / Marker / Geocoder / places are all ready on
    // `onload` (the `loading=async` bootstrap defers the constructors and breaks
    // `new Map`). `places` powers the search Autocomplete.
    const params = new URLSearchParams({ key: env.googleMapsApiKey, libraries: 'places' });
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const g = getGlobalGoogle();
      if (g?.maps) resolve(g);
      else reject(new Error('google-maps:unavailable'));
    };
    script.onerror = () => reject(new Error('google-maps:load-failed'));
    document.head.appendChild(script);
  });
  // Cache the success, but reset on failure so a later retry (e.g. once the key
  // is configured) can load it again.
  loader = pending.catch((err) => {
    loader = null;
    throw err;
  });
  return loader;
}
