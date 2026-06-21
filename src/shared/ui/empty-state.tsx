import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/** Friendly empty state — one clear primary CTA (§8.4). */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-border px-6 py-16 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[rgba(109,94,246,0.12)] text-accent-soft">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-[13.5px] text-text-secondary">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
