import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** CSS color value (token var) for the status. */
  color: string;
  label: ReactNode;
  /** Render a leading status dot. */
  dot?: boolean;
  /** Translucent surface behind the badge (for use over media). */
  surface?: boolean;
}

/**
 * Generic colored status badge. Pairs color with a label + dot so status is
 * never communicated by color alone (§10 accessibility).
 */
export function StatusBadge({
  color,
  label,
  dot = true,
  surface = false,
  className,
  style,
  ...rest
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold',
        surface && 'bg-[rgba(11,11,15,0.7)] backdrop-blur-sm',
        className,
      )}
      style={{ color, ...style } as CSSProperties}
      {...rest}
    >
      {dot && (
        <span
          aria-hidden
          className="size-1.5 rounded-full"
          style={{ background: color }}
        />
      )}
      {label}
    </span>
  );
}

interface CountChipProps {
  children: ReactNode;
  className?: string;
}

/** Small mono count pill, e.g. tab badges. */
export function CountChip({ children, className }: CountChipProps) {
  return (
    <span
      className={cn(
        'rounded-lg bg-accent px-[7px] py-px font-mono text-[11px] font-semibold text-white',
        className,
      )}
    >
      {children}
    </span>
  );
}
