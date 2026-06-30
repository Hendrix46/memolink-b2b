import { cn } from '@/shared/lib/cn';

interface LogoMarkProps {
  size?: number;
  className?: string;
}

/**
 * The Memolink brand mark — the looping "memory link" symbol, identical to the
 * one on memolink.io. Single path, themed via `currentColor` (defaults to the
 * brand indigo), so it adapts to any surface.
 */
export function LogoMark({ size = 28, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="1400 750 2500 2200"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Memolink"
      className={cn('text-accent', className)}
    >
      <g transform="matrix(1.3333333,0,0,-1.3333333,0,4000)">
        <g transform="translate(2705.7229,2120.5381)">
          <path
            fill="currentColor"
            d="m 0,0 c -94.788,39.249 -202.833,17.744 -275.368,-54.781 l -352.994,-352.994 135.409,-135.398 23.204,23.205 c 89.602,89.608 242.814,26.148 242.814,-100.573 v 0 c 0,-126.719 -153.21,-190.18 -242.813,-100.575 l -666.33,666.346 c -72.535,72.525 -180.58,94.03 -275.368,54.781 -94.747,-39.249 -155.979,-130.879 -155.979,-233.438 v -774.191 c 0,-102.559 61.232,-194.189 155.979,-233.439 94.747,-39.27 202.854,-17.744 275.368,54.791 l 352.984,352.973 -135.399,135.409 -23.168,-23.168 c -89.564,-89.564 -242.704,-26.131 -242.704,100.532 v 0 c 0,126.662 153.139,190.095 242.703,100.533 l 666.294,-666.279 c 72.514,-72.535 180.621,-94.061 275.368,-54.791 94.747,39.25 155.979,130.88 155.979,233.439 v 774.191 C 155.979,-130.879 94.747,-39.249 0,0"
          />
        </g>
      </g>
    </svg>
  );
}

interface LogoProps {
  /** Pixel size of the mark. */
  size?: number;
  /** Show the "Memolink" wordmark next to the mark. */
  withWordmark?: boolean;
  /** Color class applied to the mark (e.g. `text-accent`, `text-white`). */
  markClassName?: string;
  className?: string;
}

/** Brand lockup: the mark, optionally paired with the Memolink wordmark. */
export function Logo({ size = 28, withWordmark = true, markClassName, className }: LogoProps) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark size={size} className={markClassName} />
      {withWordmark && (
        <span className="text-base font-semibold tracking-[-0.02em] text-text">Memolink</span>
      )}
    </span>
  );
}
