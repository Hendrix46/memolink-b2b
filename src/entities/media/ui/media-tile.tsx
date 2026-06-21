import { useTranslation } from 'react-i18next';
import { Check, Music2, Play } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import { formatDuration } from '@/shared/lib/format';
import { coverBackground } from '@/shared/lib/visual';
import type { MediaAsset } from '../model/types';

export interface MediaTileProps {
  asset: MediaAsset;
  /** Multi-select state (driven by the media-library feature). */
  selectable?: boolean;
  selected?: boolean;
  /** `range` is true when the user shift-clicked (range selection). */
  onToggleSelect?: (id: string, range: boolean) => void;
  onOpen?: (id: string) => void;
}

/** Single grid asset with hover overlay: type affordance and optional select. */
export function MediaTile({ asset, selectable, selected, onToggleSelect, onOpen }: MediaTileProps) {
  const { t } = useTranslation();
  const isAudio = asset.type === 'audio';

  return (
    <div
      className={cn(
        'group relative aspect-square overflow-hidden rounded-[11px]',
        selected && 'ring-2 ring-accent ring-offset-2 ring-offset-base',
      )}
      style={{ background: coverBackground(asset.coverSeed) }}
    >
      <button
        type="button"
        aria-label={t(`media.type.${asset.type}`)}
        onClick={() => onOpen?.(asset.id)}
        className="absolute inset-0 size-full cursor-zoom-in"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />

      {/* Audio assets show a centered waveform instead of a photo */}
      {isAudio && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/85">
          <Music2 size={22} />
          <div className="flex h-6 items-end gap-[2px]">
            {[6, 12, 8, 16, 10, 20, 9, 14, 7, 17, 11].map((h, i) => (
              <span key={i} className="w-[2px] rounded-full bg-white/70" style={{ height: h }} />
            ))}
          </div>
        </div>
      )}

      {selectable && (
        <button
          type="button"
          aria-label={selected ? 'Deselect asset' : 'Select asset'}
          aria-pressed={selected}
          onClick={(e) => onToggleSelect?.(asset.id, e.shiftKey)}
          className={cn(
            'absolute left-2.5 top-2.5 flex size-[21px] items-center justify-center rounded-md border transition',
            selected
              ? 'border-accent bg-accent text-white'
              : 'border-white/60 bg-black/30 opacity-0 group-hover:opacity-100',
          )}
        >
          {selected && <Check size={13} strokeWidth={3} />}
        </button>
      )}

      {asset.type !== 'image' && asset.durationSec !== undefined && (
        <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 font-mono text-[10.5px] text-white">
          {isAudio ? <Music2 size={9} /> : <Play size={9} fill="currentColor" />}
          {formatDuration(asset.durationSec)}
        </span>
      )}
    </div>
  );
}
