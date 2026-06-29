import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import { IconButton } from './icon-button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  width?: number;
}

/**
 * Accessible dialog: focus is contained by the overlay, Esc closes, backdrop
 * click closes (§10 — modals: focus trap + Esc).
 */
export function Modal({ open, onClose, title, description, children, footer, width = 460 }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal
        aria-label={typeof title === 'string' ? title : undefined}
        onClick={(e) => e.stopPropagation()}
        style={{ width }}
        className={cn(
          'animate-pop max-h-[90vh] overflow-y-auto rounded-[var(--radius-card)] border border-border bg-surface-raised shadow-[var(--shadow-pop)]',
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-border p-5">
            <div>
              {title && <h2 className="text-base font-semibold text-text">{title}</h2>}
              {description && (
                <p className="mt-1 text-[13px] text-text-secondary">{description}</p>
              )}
            </div>
            <IconButton aria-label="Close dialog" size="sm" onClick={onClose}>
              <X size={16} />
            </IconButton>
          </div>
        )}
        {children && <div className="p-5">{children}</div>}
        {footer && <div className="flex justify-end gap-2.5 border-t border-border p-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
