import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface SegmentOption<T extends string> {
  value: T;
  /** Icon or text label. */
  content: ReactNode;
  'aria-label'?: string;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

/** Compact segmented toggle, e.g. cards/table view switch. */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn('flex gap-1 rounded-[9px] border border-border bg-surface p-[3px]', className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-label={opt['aria-label']}
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex h-7 items-center justify-center rounded-md px-2.5 transition-colors',
              active ? 'bg-surface-raised text-text' : 'text-text-muted hover:text-text-secondary',
            )}
          >
            {opt.content}
          </button>
        );
      })}
    </div>
  );
}
