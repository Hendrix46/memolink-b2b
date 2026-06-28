import type { CSSProperties } from 'react';

import { cn } from '@/shared/lib/cn';

export interface ProgressBarProps {
  /** 0–1. */
  value: number;
  /** Track height in px. */
  height?: number;
  /** Fill color; defaults to accent. Pass a status color to signal warnings. */
  color?: string;
  className?: string;
  'aria-label'?: string;
}

export function ProgressBar({
  value,
  height = 5,
  color = 'var(--color-accent)',
  className,
  'aria-label': ariaLabel,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0)) * 100;
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      className={cn('overflow-hidden rounded-full bg-border', className)}
      style={{ height }}
    >
      <div
        className="h-full rounded-full transition-[width] duration-300"
        style={{ width: `${pct}%`, background: color } as CSSProperties}
      />
    </div>
  );
}
