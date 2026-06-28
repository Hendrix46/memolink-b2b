import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, LocateFixed, MapPin, Search } from 'lucide-react';

import { Field, Input, toast } from '@/shared/ui';
import { loadGoogleMaps } from '@/shared/lib/google-maps';
import { useEventDraftStore } from '../model/event-draft-store';

/** Tashkent — the default map center (Asia/Tashkent business clock). */
const DEFAULT_CENTER = { lat: 41.311081, lng: 69.240562 };
/** Debounce before geocoding free-typed address text. */
const GEOCODE_DEBOUNCE = 700;

type Status = 'loading' | 'ready' | 'unavailable';

/**
 * Strip the literal "null"/"undefined" the LLM sometimes emits — WITHOUT
 * trimming, so the user can still type spaces between words.
 */
const clean = (v?: string | null): string => {
  const s = v ?? '';
  const t = s.trim();
  return t === 'null' || t === 'undefined' ? '' : s;
};

/**
 * Map-based location picker.
 *
 * A dedicated search box (Google Places Autocomplete, biased to the current map
 * viewport) finds places; the venue + address fields are plain controlled inputs
 * that reflect the draft and stay in sync no matter how the location changes —
 * search, dragging the marker, clicking the map (reverse-geocode), the locate
 * control, or typing. Autocomplete is intentionally NOT bound to the address
 * field: its blur-restore would otherwise revert a pin-selected address.
 *
 * Falls back to plain venue/address inputs when Google Maps is not configured
 * (`VITE_GOOGLE_MAPS_API_KEY` missing) or fails to load.
 */
export function LocationPicker() {
  const { t } = useTranslation();
  const d = useEventDraftStore((s) => s.draft);
  const patch = useEventDraftStore((s) => s.patch);

  const mapEl = useRef<HTMLDivElement>(null);
  const searchEl = useRef<HTMLInputElement>(null);
  // Loosely-typed Google Maps handles (see shared/lib/google-maps).
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatus] = useState<Status>('loading');
  const [locating, setLocating] = useState(false);

  // Initialize the map + search autocomplete once.
  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then((g) => {
        if (cancelled || !mapEl.current || mapRef.current) return;
        const maps = (g as any).maps;
        const hasCoords = typeof d.latitude === 'number' && typeof d.longitude === 'number';
        const center = hasCoords ? { lat: d.latitude as number, lng: d.longitude as number } : DEFAULT_CENTER;

        const map = new maps.Map(mapEl.current, {
          center,
          zoom: hasCoords ? 15 : 11,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
        });
        const marker = new maps.Marker({ position: center, map, draggable: true });
        geocoderRef.current = new maps.Geocoder();
        mapRef.current = map;
        markerRef.current = marker;

        marker.addListener('dragend', () => {
          const pos = marker.getPosition();
          if (pos) applyLatLng(pos.lat(), pos.lng(), true);
        });
        map.addListener('click', (e: any) => {
          if (!e.latLng) return;
          marker.setPosition(e.latLng);
          applyLatLng(e.latLng.lat(), e.latLng.lng(), true);
        });

        // No saved location yet → center on the user's area so autocomplete and
        // the initial pin are local. Permission denied keeps the Tashkent default.
        if (!hasCoords && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              map.setCenter(here);
              map.setZoom(13);
              marker.setPosition(here);
              patch({ latitude: here.lat, longitude: here.lng });
            },
            () => {},
            { enableHighAccuracy: false, timeout: 8000 },
          );
        }

        // Places Autocomplete on the dedicated search box.
        if (!maps.places?.Autocomplete) {
          console.warn(
            '[LocationPicker] Places library not loaded. Hard-refresh the page (Ctrl+Shift+R) and ensure the Places API is enabled for the key.',
          );
        }
        if (searchEl.current && maps.places?.Autocomplete) {
          const ac = new maps.places.Autocomplete(searchEl.current, {
            fields: ['geometry', 'formatted_address', 'name'],
          });
          // Bias suggestions toward the current map viewport (the user's area).
          ac.bindTo('bounds', map);
          ac.addListener('place_changed', () => {
            const place = ac.getPlace();
            const loc = place?.geometry?.location;
            if (!loc) return;
            recenter(loc.lat(), loc.lng());
            patch({
              latitude: loc.lat(),
              longitude: loc.lng(),
              address: clean(place.formatted_address ?? ''),
            });
            const currentVenue = useEventDraftStore.getState().draft.venue;
            if (!currentVenue && place.name) patch({ venue: place.name });
          });
        }

        setStatus('ready');
      })
      .catch((err) => {
        // Surfaced for diagnosis (missing key / API not enabled / referrer block).
        console.warn('[LocationPicker] Google Maps unavailable:', err?.message ?? err);
        if (!cancelled) setStatus('unavailable');
      });
    return () => {
      cancelled = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Persist coordinates; optionally reverse-geocode to fill the address. */
  const applyLatLng = (lat: number, lng: number, reverse: boolean) => {
    patch({ latitude: lat, longitude: lng });
    if (!reverse || !geocoderRef.current) return;
    geocoderRef.current.geocode({ location: { lat, lng } }, (results: any[], statusStr: string) => {
      if (statusStr === 'OK' && results?.[0]) patch({ address: clean(results[0].formatted_address) });
    });
  };

  const recenter = (lat: number, lng: number) => {
    if (mapRef.current && markerRef.current) {
      const pos = { lat, lng };
      mapRef.current.setCenter(pos);
      mapRef.current.setZoom(15);
      markerRef.current.setPosition(pos);
    }
  };

  /** Typing a full address (debounced) geocodes it → moves the marker. */
  const onAddressChange = (value: string) => {
    patch({ address: value });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const query = value.trim();
    if (!geocoderRef.current || !query) return;
    debounceRef.current = setTimeout(() => {
      geocoderRef.current.geocode({ address: query }, (results: any[], statusStr: string) => {
        if (statusStr === 'OK' && results?.[0]) {
          const loc = results[0].geometry.location;
          recenter(loc.lat(), loc.lng());
          patch({ latitude: loc.lat(), longitude: loc.lng() });
        }
      });
    }, GEOCODE_DEBOUNCE);
  };

  /** Center on the user's current position (browser geolocation). */
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t('builder.location.geoUnsupported'));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        recenter(latitude, longitude);
        applyLatLng(latitude, longitude, true);
      },
      () => {
        setLocating(false);
        toast.error(t('builder.location.geoDenied'));
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const mapMode = status !== 'unavailable';

  return (
    <div className="space-y-3">
      {mapMode && (
        <Input
          ref={searchEl}
          placeholder={t('builder.location.searchPh')}
          leadingIcon={<Search size={15} />}
          autoComplete="off"
        />
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label={t('builder.location.venue')}>
          <Input
            value={clean(d.venue)}
            onChange={(e) => patch({ venue: e.target.value })}
            placeholder={t('builder.location.venuePh')}
            leadingIcon={<MapPin size={15} />}
          />
        </Field>
        <Field label={t('builder.location.address')}>
          <Input
            value={clean(d.address)}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder={t('builder.location.addressPh')}
          />
        </Field>
      </div>

      {mapMode && (
        <>
          <div className="relative overflow-hidden rounded-[12px] border border-border">
            <div ref={mapEl} className="h-[240px] w-full bg-surface" />

            {/* Locate control — sits on the map (top-right). */}
            <button
              type="button"
              onClick={useMyLocation}
              aria-label={t('builder.location.useMyLocation')}
              title={t('builder.location.useMyLocation')}
              className="absolute right-2.5 top-2.5 flex size-9 items-center justify-center rounded-[9px] border border-border bg-surface/95 text-text-secondary shadow-[var(--shadow-pop)] backdrop-blur transition-colors hover:border-border-strong hover:text-text"
            >
              {locating ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
            </button>

            {status === 'loading' && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface text-text-muted">
                <Loader2 size={20} className="animate-spin" />
              </div>
            )}
          </div>
          {typeof d.latitude === 'number' && typeof d.longitude === 'number' && (
            <p className="font-mono text-[11.5px] text-text-muted">
              {d.latitude.toFixed(5)}, {d.longitude.toFixed(5)}
            </p>
          )}
        </>
      )}

      {status === 'unavailable' && (
        <div className="flex items-center justify-between gap-3 rounded-[10px] border border-border bg-surface px-3.5 py-2.5">
          <span className="text-[12px] text-text-muted">{t('builder.location.mapUnavailable')}</span>
          <button
            type="button"
            onClick={useMyLocation}
            className="flex flex-none items-center gap-1.5 text-[12.5px] font-medium text-accent-soft hover:text-accent"
          >
            {locating ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
            {t('builder.location.useMyLocation')}
          </button>
        </div>
      )}
    </div>
  );
}
