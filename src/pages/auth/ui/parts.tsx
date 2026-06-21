import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff, TriangleAlert } from 'lucide-react';

import { cn } from '@/shared/lib/cn';

/** Password field with a show/hide toggle. Shares Input styling. */
export const PasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function PasswordInput({ className, ...rest }, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <div
        className={cn(
          'flex h-[42px] items-center gap-2.5 rounded-[10px] border border-border bg-surface px-3.5 transition-colors focus-within:border-accent hover:border-border-strong',
          className,
        )}
      >
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className="w-full bg-transparent text-[14px] text-text outline-none placeholder:text-text-muted"
          {...rest}
        />
        <button
          type="button"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((v) => !v)}
          className="flex-none text-text-muted transition-colors hover:text-text"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    );
  },
);

/** Inline error banner for auth forms. */
export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 rounded-[10px] border border-rejected/30 bg-[rgba(240,85,110,0.08)] px-3.5 py-2.5 text-[13px] text-rejected">
      <TriangleAlert size={15} className="flex-none" />
      {message}
    </div>
  );
}

/** Tall text input matching the auth form scale. */
export const AuthInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function AuthInput({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'h-[42px] w-full rounded-[10px] border border-border bg-surface px-3.5 text-[14px] text-text outline-none transition-colors',
          'placeholder:text-text-muted hover:border-border-strong focus:border-accent',
          className,
        )}
        {...rest}
      />
    );
  },
);

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-1.5 block text-[12.5px] font-medium text-text-secondary">{children}</span>;
}
