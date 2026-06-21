import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: ReactNode;
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { leadingIcon, invalid, className, ...rest },
  ref,
) {
  return (
    <div
      className={cn(
        'flex h-[38px] items-center gap-2.5 rounded-[10px] border bg-surface px-3.5 transition-colors',
        'focus-within:border-accent',
        invalid ? 'border-rejected' : 'border-border hover:border-border-strong',
        className,
      )}
    >
      {leadingIcon && <span className="flex-none text-text-muted">{leadingIcon}</span>}
      <input
        ref={ref}
        className="w-full bg-transparent text-[13.5px] text-text outline-none placeholder:text-text-muted"
        {...rest}
      />
    </div>
  );
});

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

/** Labelled field wrapper with inline validation messaging. */
export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-medium text-text-secondary">{label}</span>
      {children}
      {error ? (
        <span className="text-[11.5px] text-rejected">{error}</span>
      ) : (
        hint && <span className="text-[11.5px] text-text-muted">{hint}</span>
      )}
    </label>
  );
}
