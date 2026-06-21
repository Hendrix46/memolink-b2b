import { cn } from '@/shared/lib/cn';

export interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
}

/** Minimal bar sparkline for KPI cards. Pure CSS bars — no chart dependency. */
export function Sparkline({ data, color = 'var(--color-accent)', height = 26, className }: SparklineProps) {
  const max = Math.max(...data, 1);
  return (
    <div className={cn('flex items-end gap-[3px]', className)} style={{ height }} aria-hidden>
      {data.map((value, i) => (
        <div
          key={i}
          className="flex-1 rounded-[2px]"
          style={{
            height: `${Math.max(8, (value / max) * 100)}%`,
            background: color,
            opacity: 0.35 + (i / data.length) * 0.65,
          }}
        />
      ))}
    </div>
  );
}
