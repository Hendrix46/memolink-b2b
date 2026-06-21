import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon rendered before the label. */
  leadingIcon?: ReactNode;
  /** Icon rendered after the label. */
  trailingIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white shadow-[var(--shadow-accent)] hover:bg-accent-hover disabled:hover:bg-accent',
  secondary:
    'bg-surface-raised text-text border border-border hover:border-border-strong',
  ghost: 'bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text',
  destructive:
    'bg-[rgba(240,85,110,0.12)] text-rejected hover:bg-[rgba(240,85,110,0.2)]',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[12.5px] gap-1.5 rounded-lg',
  md: 'h-[38px] px-4 text-[13.5px] gap-2 rounded-[10px]',
  lg: 'h-10 px-[18px] text-sm gap-2 rounded-[10px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    leadingIcon,
    trailingIcon,
    loading = false,
    fullWidth = false,
    disabled,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex select-none items-center justify-center font-semibold whitespace-nowrap',
        'transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-55',
        VARIANT[variant],
        SIZE[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden
          className="size-4 animate-[ml-spin_0.6s_linear_infinite] rounded-full border-2 border-white/30 border-t-white"
        />
      ) : (
        leadingIcon
      )}
      {children}
      {!loading && trailingIcon}
    </button>
  );
});
