import { RotateCw, TriangleAlert } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import { Button } from './button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

/** Concise error + retry. Never a dead end (§8.4). */
export function ErrorState({
  title = 'Something went wrong',
  description = 'We couldn’t load this just now.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-border bg-surface px-6 py-16 text-center',
        className,
      )}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[rgba(240,85,110,0.12)] text-rejected">
        <TriangleAlert size={24} />
      </div>
      <h3 className="text-base font-semibold text-text">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[13.5px] text-text-secondary">{description}</p>
      {onRetry && (
        <Button className="mt-5" variant="secondary" leadingIcon={<RotateCw size={15} />} onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
