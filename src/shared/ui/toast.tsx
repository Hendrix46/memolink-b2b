import { createPortal } from 'react-dom';
import { Check, Info, TriangleAlert, X } from 'lucide-react';
import { create } from 'zustand';

import { cn } from '@/shared/lib/cn';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastOptions {
  /** Optional action button (e.g. Undo). Extends the visible duration. */
  action?: ToastAction;
  /** Override the auto-dismiss duration in ms. */
  duration?: number;
}

interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
  action?: ToastAction;
}

interface ToastState {
  toasts: Toast[];
  push: (tone: ToastTone, message: string, options?: ToastOptions) => void;
  dismiss: (id: number) => void;
}

let seq = 0;

const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (tone, message, options) => {
    const id = (seq += 1);
    set((s) => ({ toasts: [...s.toasts, { id, tone, message, action: options?.action }] }));
    const duration = options?.duration ?? (options?.action ? 6000 : 3600);
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), duration);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Imperative toast API usable from anywhere (event handlers, mutations). */
export const toast = {
  success: (message: string, options?: ToastOptions) => useToastStore.getState().push('success', message, options),
  error: (message: string, options?: ToastOptions) => useToastStore.getState().push('error', message, options),
  info: (message: string, options?: ToastOptions) => useToastStore.getState().push('info', message, options),
};

const TONE = {
  success: { color: 'var(--color-approved)', Icon: Check },
  error: { color: 'var(--color-rejected)', Icon: TriangleAlert },
  info: { color: 'var(--color-processing)', Icon: Info },
} as const;

/** Mount once at the app root. */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return createPortal(
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2.5">
      {toasts.map(({ id, tone, message, action }) => {
        const { color, Icon } = TONE[tone];
        return (
          <div
            key={id}
            className="animate-in flex w-80 items-center gap-3 rounded-[12px] border border-border bg-surface-raised p-3.5 shadow-[var(--shadow-pop)]"
          >
            <span
              className="flex size-7 flex-none items-center justify-center rounded-lg"
              style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}
            >
              <Icon size={15} />
            </span>
            <p className="flex-1 text-[13px] font-medium">{message}</p>
            {action && (
              <button
                onClick={() => {
                  action.onClick();
                  dismiss(id);
                }}
                className="flex-none rounded-md px-2 py-1 text-[12.5px] font-semibold text-accent transition-colors hover:bg-[rgba(109,94,246,0.12)]"
              >
                {action.label}
              </button>
            )}
            <button
              aria-label="Dismiss notification"
              onClick={() => dismiss(id)}
              className={cn('flex-none text-text-muted transition-colors hover:text-text')}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
