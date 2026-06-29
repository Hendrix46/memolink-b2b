import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';

export interface PopoverProps {
  /** The trigger element the popover anchors to. */
  anchorRef: RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Match the anchor's width (option lists). Calendars use intrinsic width. */
  matchWidth?: boolean;
  className?: string;
}

/**
 * Anchored floating layer rendered in a portal with fixed positioning. Because
 * it lives on `document.body` (above modals) it is never clipped by an ancestor's
 * `overflow` — the reason raw `absolute` dropdowns get cut off inside dialogs.
 * Repositions on scroll/resize, and closes on outside-click or Escape.
 */
export function Popover({ anchorRef, open, onClose, children, matchWidth, className }: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const r = anchor.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target) || ref.current?.contains(target)) return;
      onClose();
    };
    // Capture Escape first and stop it, so closing the popover doesn't also
    // close an enclosing modal (which listens for Escape on document too).
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      onClose();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open, anchorRef, onClose]);

  if (!open || !pos) return null;

  return createPortal(
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        width: matchWidth ? pos.width : undefined,
        zIndex: 200,
      }}
      className={className}
    >
      {children}
    </div>,
    document.body,
  );
}
