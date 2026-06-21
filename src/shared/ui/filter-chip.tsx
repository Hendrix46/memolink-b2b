import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface FilterChipProps {
  label: ReactNode;
  active?: boolean;
  count?: number | string;
  /** Optional leading status dot color. */
  dotColor?: string;
  onClick?: () => void;
}

/** Pill toggle used in filter bars (events list, media curation). */
export function FilterChip({ label, active, count, dotColor, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex h-[34px] items-center gap-2 rounded-lg border px-3 text-[12.5px] font-medium transition-colors',
        active
          ? 'border-accent bg-[rgba(109,94,246,0.14)] text-text'
          : 'border-border bg-surface text-text-secondary hover:border-border-strong',
      )}
    >
      {dotColor && <span className="size-1.5 rounded-full" style={{ background: dotColor }} />}
      {label}
      {count !== undefined && (
        <span className="font-mono text-[11px] opacity-60">{count}</span>
      )}
    </button>
  );
}
