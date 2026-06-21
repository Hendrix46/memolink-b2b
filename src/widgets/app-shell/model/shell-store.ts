import { create } from 'zustand';

interface ShellState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

/** Shell-level UI state (sidebar collapse). Persists only for the session. */
export const useShellStore = create<ShellState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
