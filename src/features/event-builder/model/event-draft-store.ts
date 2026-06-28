import { create } from 'zustand';

import type { AgendaDraftItem, CustomField, EventDraft, ModuleKey } from './types';

let uid = 0;
const nextId = (prefix: string) => `${prefix}_${(uid += 1)}`;

function createInitialDraft(): EventDraft {
  return {
    name: '',
    description: '',
    category: 'Conference',
    tags: [],
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '18:00',
    timezone: 'Asia/Tashkent',
    locationType: 'in-person',
    venue: '',
    address: '',
    virtualUrl: '',

    coverSeed: 'new-event',
    accent: '#6D5EF6',
    layout: 'masonry',
    welcomeMessage: '',
    watermark: true,

    modules: {
      agenda: true,
      registrations: true,
      mediaGallery: true,
      qrCheckIn: false,
      delivery: true,
      networking: false,
      livestream: false,
    },

    visibility: 'private',
    capacity: 500,
    requireApproval: false,

    customFields: [],
    agenda: [],
  };
}

interface EventDraftState {
  draft: EventDraft;

  /** Shallow-merge top-level fields. */
  patch: (partial: Partial<EventDraft>) => void;
  setModule: (key: ModuleKey, on: boolean) => void;

  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;

  addField: () => void;
  updateField: (id: string, patch: Partial<CustomField>) => void;
  removeField: (id: string) => void;

  addSession: () => void;
  updateSession: (id: string, patch: Partial<AgendaDraftItem>) => void;
  removeSession: (id: string) => void;

  reset: () => void;
}

/**
 * Draft state for the event builder. Holds the entire customizable event while
 * the client configures it across the dynamic wizard, so every step and the live
 * preview read from one source of truth. Reset on submit / unmount.
 */
export const useEventDraftStore = create<EventDraftState>((set) => ({
  draft: createInitialDraft(),

  patch: (partial) => set((s) => ({ draft: { ...s.draft, ...partial } })),
  setModule: (key, on) =>
    set((s) => ({ draft: { ...s.draft, modules: { ...s.draft.modules, [key]: on } } })),

  addTag: (tag) =>
    set((s) => {
      const clean = tag.trim();
      if (!clean || s.draft.tags.includes(clean)) return s;
      return { draft: { ...s.draft, tags: [...s.draft.tags, clean] } };
    }),
  removeTag: (tag) => set((s) => ({ draft: { ...s.draft, tags: s.draft.tags.filter((t) => t !== tag) } })),

  addField: () =>
    set((s) => ({
      draft: {
        ...s.draft,
        customFields: [
          ...s.draft.customFields,
          { id: nextId('fld'), label: '', type: 'text', required: false, options: [] },
        ],
      },
    })),
  updateField: (id, patch) =>
    set((s) => ({
      draft: { ...s.draft, customFields: s.draft.customFields.map((f) => (f.id === id ? { ...f, ...patch } : f)) },
    })),
  removeField: (id) =>
    set((s) => ({ draft: { ...s.draft, customFields: s.draft.customFields.filter((f) => f.id !== id) } })),

  addSession: () =>
    set((s) => ({
      draft: {
        ...s.draft,
        agenda: [
          ...s.draft.agenda,
          { id: nextId('ses'), time: '09:00', title: '', speaker: '', room: '', track: 'Talk' },
        ],
      },
    })),
  updateSession: (id, patch) =>
    set((s) => ({
      draft: { ...s.draft, agenda: s.draft.agenda.map((a) => (a.id === id ? { ...a, ...patch } : a)) },
    })),
  removeSession: (id) =>
    set((s) => ({ draft: { ...s.draft, agenda: s.draft.agenda.filter((a) => a.id !== id) } })),

  reset: () => set({ draft: createInitialDraft() }),
}));
