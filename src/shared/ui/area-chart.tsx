import { useId } from 'react';

export interface AreaChartProps {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
}

/**
 * Minimal responsive area chart (SVG, no dependency). Smooths the series into a
 * filled gradient area with a stroked top line — premium feel for KPI trends.
 */
export function AreaChart({ data, color = 'var(--color-accent)', height = 140, className }: AreaChartProps) {
  const id = useId();
  const W = 100;
  const H = 40;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1 || 1)) * W;
    const y = H - ((v - min) / span) * (H - 4) - 2;
    return [x, y] as const;
  });

  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const area = `${line} L${W},${H} L0,${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height={height} className={className}>
      <defs>
        <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#fill-${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
