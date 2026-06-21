import type { CSSProperties } from 'react';

export interface SuccessCheckProps {
  size?: number;
  /** Stroke color — defaults to the success green. */
  color?: string;
  /** Emit a single expanding ring (a calm "radar ping") behind the seal. */
  ping?: boolean;
  className?: string;
}

/**
 * Professional success seal: a ring and checkmark that draw themselves, with an
 * optional single ping. Restrained, enterprise-grade motion — no particles.
 * Uses SVG `pathLength="1"` so one keyframe animates any stroke. Reduced-motion
 * is honored by the global stylesheet (animations resolve instantly to the end).
 */
export function SuccessCheck({ size = 56, color = 'var(--color-approved)', ping = false, className }: SuccessCheckProps) {
  const drawCircle: CSSProperties = {
    strokeDasharray: 1,
    strokeDashoffset: 1,
    animation: 'ml-draw 0.55s cubic-bezier(0.65, 0, 0.35, 1) forwards',
  };
  const drawCheck: CSSProperties = {
    strokeDasharray: 1,
    strokeDashoffset: 1,
    animation: 'ml-draw 0.32s cubic-bezier(0.65, 0, 0.35, 1) 0.5s forwards',
  };

  return (
    <span
      className={className}
      style={{ position: 'relative', display: 'inline-grid', placeItems: 'center', width: size, height: size }}
    >
      {ping && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '9999px',
            border: `1.5px solid ${color}`,
            animation: 'ml-ring 1.1s ease-out forwards',
          }}
        />
      )}
      <span
        className="animate-pop-in"
        style={{
          display: 'grid',
          placeItems: 'center',
          width: size,
          height: size,
          borderRadius: '9999px',
          background: `color-mix(in srgb, ${color} 12%, transparent)`,
        }}
      >
        <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 52 52" fill="none">
          <circle cx="26" cy="26" r="23" stroke={color} strokeWidth="2.5" pathLength={1} style={drawCircle} />
          <path
            d="M16 26.5 L23 33.5 L37 18.5"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            style={drawCheck}
          />
        </svg>
      </span>
    </span>
  );
}
