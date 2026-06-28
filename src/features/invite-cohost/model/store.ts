import { create } from 'zustand';

interface InviteCohostState {
  open: boolean;
  /** Name of the event people are being invited to co-host. */
  eventName: string;
  openModal: (eventName: string) => void;
  close: () => void;
}

/** Controls the global Invite co-host modal (spec 04 §4). */
export const useInviteCohost = create<InviteCohostState>((set) => ({
  open: false,
  eventName: '',
  openModal: (eventName) => set({ open: true, eventName }),
  close: () => set({ open: false }),
}));
