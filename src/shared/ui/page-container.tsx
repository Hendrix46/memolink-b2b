import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface PageContainerProps {
  children: ReactNode;
  /** Constrain content width; the design caps page content at 1500px. */
  width?: 'default' | 'narrow';
  className?: string;
}

/** Centered, max-width content wrapper with the standard page gutters. */
export function PageContainer({ children, width = 'default', className }: PageContainerProps) {
  return (
    <div
      className={cn(
        'animate-in mx-auto px-[34px] pb-16 pt-7',
        width === 'narrow' ? 'max-w-[1100px]' : 'max-w-[1500px]',
        className,
      )}
    >
      {children}
    </div>
  );
}
