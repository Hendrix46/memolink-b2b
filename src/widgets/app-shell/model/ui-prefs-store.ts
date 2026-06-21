import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { EventStatus } from '@/shared/config/status';

type EventsView = 'cards' | 'table';
type EventsStatus = EventStatus | 'all';
type Density = 'comfortable' | 'compact';

interface UiPrefsState {
  /** Saved view for the events list — remembered across sessions. */
  eventsView: EventsView;
  eventsStatus: EventsStatus;
  eventsDensity: Density;
  setEventsView: (v: EventsView) => void;
  setEventsStatus: (s: EventsStatus) => void;
  setEventsDensity: (d: Density) => void;
}

/**
 * Persisted UI preferences (saved views, density). Small power-user wins:
 * the list reopens exactly how the user left it.
 */
export const useUiPrefs = create<UiPrefsState>()(
  persist(
    (set) => ({
      eventsView: 'cards',
      eventsStatus: 'all',
      eventsDensity: 'comfortable',
      setEventsView: (eventsView) => set({ eventsView }),
      setEventsStatus: (eventsStatus) => set({ eventsStatus }),
      setEventsDensity: (eventsDensity) => set({ eventsDensity }),
    }),
    { name: 'memolink.ui-prefs' },
  ),
);
