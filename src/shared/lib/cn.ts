import { clsx, type ClassValue } from 'clsx';

/**
 * Class-name composer. Thin wrapper over clsx so call-sites stay terse and we
 * keep a single place to swap in `tailwind-merge` later if conflicts appear.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
