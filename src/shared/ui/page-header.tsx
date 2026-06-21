import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Trailing actions (e.g. primary button). */
  actions?: ReactNode;
  className?: string;
}

/** Consistent page title block — title + subtitle on the left, actions right. */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6 flex flex-wrap items-end justify-between gap-4', className)}>
      <div>
        <h1 className="text-[26px] font-semibold tracking-[-0.02em]">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-text-secondary">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </div>
  );
}
