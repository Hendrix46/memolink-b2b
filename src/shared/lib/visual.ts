/**
 * Deterministic visual helpers for placeholder media & avatars.
 * The spec is media-first but defers real assets — these produce stable,
 * pleasing gradients so the UI reads as "full of media" without binary assets.
 */

const AVATAR_GRADIENTS = [
  'linear-gradient(140deg,#6D5EF6,#9d7bff)',
  'linear-gradient(140deg,#E0A33E,#F0556E)',
  'linear-gradient(140deg,#3DD68C,#4AA8FF)',
  'linear-gradient(140deg,#4AA8FF,#6D5EF6)',
  'linear-gradient(140deg,#F0556E,#9d7bff)',
  'linear-gradient(140deg,#3DD68C,#6D5EF6)',
];

const COVER_GRADIENTS = [
  'linear-gradient(135deg,#2a2350,#6D5EF6 120%)',
  'linear-gradient(135deg,#3a2030,#F0556E 130%)',
  'linear-gradient(135deg,#13314a,#4AA8FF 130%)',
  'linear-gradient(135deg,#143a2c,#3DD68C 140%)',
  'linear-gradient(135deg,#3a2e12,#E0A33E 140%)',
  'linear-gradient(135deg,#241c3a,#9d7bff 130%)',
  'linear-gradient(135deg,#1a2540,#6D5EF6 120%)',
];

/** Stable hash for a string seed. */
function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h << 5) - h + seed.charCodeAt(i);
  return Math.abs(h);
}

export const avatarGradient = (seed: string): string =>
  AVATAR_GRADIENTS[hash(seed) % AVATAR_GRADIENTS.length];

export const coverGradient = (seed: string): string =>
  COVER_GRADIENTS[hash(seed) % COVER_GRADIENTS.length];

/** CSS background shorthand for a cover surface, with a subtle texture overlay. */
export const coverBackground = (seed: string): string =>
  `${coverGradient(seed)}, var(--color-surface-raised)`;
