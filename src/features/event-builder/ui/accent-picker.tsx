import { cn } from '@/shared/lib/cn';
import { ACCENT_PRESETS } from '../model/types';
import { useEventDraftStore } from '../model/event-draft-store';

/** Accent color presets + a custom color well. */
export function AccentPicker() {
  const accent = useEventDraftStore((s) => s.draft.accent);
  const patch = useEventDraftStore((s) => s.patch);

  return (
    <div className="flex items-center gap-2">
      {ACCENT_PRESETS.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={`Accent ${c}`}
          onClick={() => patch({ accent: c })}
          className={cn(
            'size-8 rounded-lg transition',
            accent === c && 'ring-2 ring-white/70 ring-offset-2 ring-offset-surface',
          )}
          style={{ background: c }}
        />
      ))}
      <label className="relative size-8 cursor-pointer overflow-hidden rounded-lg border border-border" title="Custom color">
        <span
          className="absolute inset-0"
          style={{ background: ACCENT_PRESETS.includes(accent) ? 'conic-gradient(red,orange,yellow,lime,cyan,blue,magenta,red)' : accent }}
        />
        <input
          type="color"
          value={accent}
          onChange={(e) => patch({ accent: e.target.value })}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
    </div>
  );
}
