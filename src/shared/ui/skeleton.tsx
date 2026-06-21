import type { CSSProperties } from 'react';

import { cn } from '@/shared/lib/cn';

export interface SkeletonProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  radius?: number | string;
}

/**
 * Shimmer placeholder. The spec mandates skeletons that match the final layout
 * (no spinners on grids — §8.4), so compose these into per-screen loaders.
 */
export function Skeleton({ className, width, height, radius }: SkeletonProps) {
  return (
    <span
      aria-hidden
      className={cn('relative block overflow-hidden bg-surface-raised', className)}
      style={
        {
          width,
          height,
          borderRadius: radius ?? 8,
        } as CSSProperties
      }
    >
      <span className="absolute inset-0 -translate-x-full animate-[ml-shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
    </span>
  );
}
