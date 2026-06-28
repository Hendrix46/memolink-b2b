import { create } from 'zustand';

import type { MediaAsset } from '@/entities/media';

interface OpenOptions {
  /** When provided, the lightbox shows a delete control wired to this handler. */
  onDelete?: (id: string) => void;
  /** When provided, the lightbox shows a feature toggle wired to this handler. */
  onFeature?: (id: string, on: boolean) => void;
}

interface LightboxState {
  assets: MediaAsset[];
  index: number;
  open: boolean;
  onDelete?: (id: string) => void;
  onFeature?: (id: string, on: boolean) => void;
  openAt: (assets: MediaAsset[], id: string, options?: OpenOptions) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
}

export const useLightboxStore = create<LightboxState>((set, get) => ({
  assets: [],
  index: 0,
  open: false,
  onDelete: undefined,
  onFeature: undefined,
  openAt: (assets, id, options) => {
    const index = Math.max(0, assets.findIndex((a) => a.id === id));
    set({ assets, index, open: true, onDelete: options?.onDelete, onFeature: options?.onFeature });
  },
  close: () => set({ open: false }),
  next: () => {
    const { index, assets } = get();
    set({ index: Math.min(index + 1, assets.length - 1) });
  },
  prev: () => set({ index: Math.max(get().index - 1, 0) }),
}));
