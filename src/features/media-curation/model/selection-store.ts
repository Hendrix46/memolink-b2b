import { create } from 'zustand';

interface SelectionState {
  selected: Set<string>;
  /** Anchor for shift-click range selection. */
  lastSelected: string | null;
  toggle: (id: string) => void;
  /** Select every id between the anchor and `id` (inclusive) within `ordered`. */
  selectRange: (id: string, ordered: string[]) => void;
  selectMany: (ids: string[]) => void;
  clear: () => void;
}

/**
 * Multi-select state for the media library (design spec §5.5 bulk select).
 * Kept out of React Query — this is pure client UI state and changes rapidly.
 */
export const useSelectionStore = create<SelectionState>((set, get) => ({
  selected: new Set(),
  lastSelected: null,
  toggle: (id) =>
    set((s) => {
      const next = new Set(s.selected);
      next.has(id) ? next.delete(id) : next.add(id);
      return { selected: next, lastSelected: id };
    }),
  selectRange: (id, ordered) => {
    const { lastSelected, selected } = get();
    const anchor = lastSelected ?? id;
    const a = ordered.indexOf(anchor);
    const b = ordered.indexOf(id);
    if (a === -1 || b === -1) return get().toggle(id);
    const [lo, hi] = a < b ? [a, b] : [b, a];
    const next = new Set(selected);
    for (let i = lo; i <= hi; i += 1) next.add(ordered[i]);
    set({ selected: next, lastSelected: id });
  },
  selectMany: (ids) => set({ selected: new Set(ids), lastSelected: ids.at(-1) ?? null }),
  clear: () => set({ selected: new Set(), lastSelected: null }),
}));
