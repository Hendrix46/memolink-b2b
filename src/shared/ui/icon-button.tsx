import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required for a11y — icon-only controls must be labelled (§10). */
  'aria-label': string;
  children: ReactNode;
  size?: 'sm' | 'md';
}

const SIZE = {
  sm: 'size-8',
  md: 'size-[38px]',
} as const;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { size = 'md', className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'relative inline-flex items-center justify-center rounded-[10px]',
        'border border-border bg-surface text-text-secondary',
        'transition-colors duration-150 hover:border-border-strong hover:text-text',
        SIZE[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
