import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Reduce padding for dense surfaces. */
  compact?: boolean;
  /** Add hover lift — use for clickable cards. */
  interactive?: boolean;
}

export function Card({ compact, interactive, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-border bg-surface',
        compact ? 'p-4' : 'p-5',
        interactive &&
          'cursor-pointer transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-border-strong',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

interface SectionHeaderProps {
  title: ReactNode;
  action?: ReactNode;
  /** Optional leading indicator (e.g. a live dot). */
  indicator?: ReactNode;
  /** Optional supporting line under the title. */
  description?: ReactNode;
  className?: string;
}

/** Standard "title (+ description) + trailing action" header used inside cards. */
export function SectionHeader({ title, action, indicator, description, className }: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'mb-4 flex justify-between gap-3',
        description ? 'items-start' : 'items-center',
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="flex items-center gap-2.5 text-[15px] font-semibold text-text">
          {indicator}
          {title}
        </h2>
        {description && <p className="mt-1 text-[12.5px] text-text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
