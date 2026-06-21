import type { CSSProperties } from 'react';

import { cn } from '@/shared/lib/cn';
import { initials as toInitials } from '@/shared/lib/format';
import { avatarGradient } from '@/shared/lib/visual';

export interface AvatarProps {
  name: string;
  size?: number;
  /** Override the generated gradient. */
  background?: string;
  className?: string;
}

/** Initials avatar with a deterministic gradient derived from the name. */
export function Avatar({ name, size = 36, background, className }: AvatarProps) {
  return (
    <span
      className={cn(
        'inline-flex flex-none items-center justify-center rounded-full font-semibold text-white',
        className,
      )}
      style={
        {
          width: size,
          height: size,
          fontSize: Math.round(size * 0.36),
          background: background ?? avatarGradient(name),
        } as CSSProperties
      }
      title={name}
      aria-label={name}
    >
      {toInitials(name)}
    </span>
  );
}

interface AvatarGroupProps {
  names: string[];
  max?: number;
  size?: number;
  /** Border color to separate overlapping avatars from the surface beneath. */
  ring?: string;
}

/** Overlapping stack of avatars with a "+N" overflow chip. */
export function AvatarGroup({ names, max = 3, size = 26, ring = '#15151C' }: AvatarGroupProps) {
  const shown = names.slice(0, max);
  const overflow = names.length - shown.length;

  return (
    <div className="flex">
      {shown.map((name, i) => (
        <span
          key={name}
          style={{ marginLeft: i === 0 ? 0 : -8, border: `2px solid ${ring}`, borderRadius: 999 }}
        >
          <Avatar name={name} size={size} />
        </span>
      ))}
      {overflow > 0 && (
        <span
          className="inline-flex items-center justify-center rounded-full bg-surface-raised font-semibold text-text-secondary"
          style={{
            width: size,
            height: size,
            marginLeft: -8,
            border: `2px solid ${ring}`,
            fontSize: Math.round(size * 0.36),
          }}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
