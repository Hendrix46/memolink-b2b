import { forwardRef, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, rows = 3, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          'w-full resize-y rounded-[10px] border border-border bg-surface px-3.5 py-2.5 text-[13.5px] text-text outline-none transition-colors',
          'placeholder:text-text-muted hover:border-border-strong focus:border-accent',
          className,
        )}
        {...rest}
      />
    );
  },
);
