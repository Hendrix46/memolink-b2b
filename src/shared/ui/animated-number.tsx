import { useEffect, useRef, useState } from 'react';

export interface AnimatedNumberProps {
  /** Display value that may contain a number, e.g. "1,842", "412 GB", "$499". */
  value: string;
  durationMs?: number;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Count-up animation for KPI values. Extracts the leading numeric portion,
 * animates 0 → target, and preserves any prefix/suffix + thousands grouping.
 * Falls back to the static value under reduced-motion.
 */
export function AnimatedNumber({ value, durationMs = 900 }: AnimatedNumberProps) {
  const match = value.match(/[\d,.]*\d/);
  const target = match ? Number(match[0].replace(/,/g, '')) : NaN;
  const grouped = Boolean(match && match[0].includes(','));
  const prefix = match ? value.slice(0, match.index) : '';
  const suffix = match ? value.slice((match.index ?? 0) + match[0].length) : '';

  const [display, setDisplay] = useState(() => (Number.isNaN(target) ? value : prefix + '0' + suffix));
  const raf = useRef<number>(0);

  useEffect(() => {
    if (Number.isNaN(target)) {
      setDisplay(value);
      return;
    }
    if (prefersReducedMotion()) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const current = Math.round(target * eased);
      const num = grouped ? current.toLocaleString() : String(current);
      setDisplay(prefix + num + suffix);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{display}</>;
}
