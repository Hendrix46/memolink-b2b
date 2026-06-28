import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePlus, X } from 'lucide-react';

import { toast } from '@/shared/ui';
import { coverGradient } from '@/shared/lib/visual';
import { useEventDraftStore } from '../model/event-draft-store';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Cover-image picker. Stores the selected file + a preview object URL in the
 * draft; the file is uploaded as the event poster after creation
 * (`POST /api/event/{eventId}/poster`).
 */
export function CoverPicker() {
  const { t } = useTranslation();
  const d = useEventDraftStore((s) => s.draft);
  const patch = useEventDraftStore((s) => s.patch);
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('builder.cover.notImage'));
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(t('builder.cover.tooLarge'));
      return;
    }
    if (d.coverPreview) URL.revokeObjectURL(d.coverPreview);
    patch({ coverFile: file, coverPreview: URL.createObjectURL(file) });
  };

  const clear = () => {
    if (d.coverPreview) URL.revokeObjectURL(d.coverPreview);
    patch({ coverFile: null, coverPreview: null });
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex h-36 w-full items-center justify-center overflow-hidden rounded-[13px] border-[1.5px] border-dashed border-border-strong transition-colors hover:border-accent"
        style={
          d.coverPreview
            ? { background: `center / cover no-repeat url("${d.coverPreview}")` }
            : { background: coverGradient(d.coverSeed) }
        }
      >
        {!d.coverPreview && (
          <span className="flex flex-col items-center gap-2 text-white/90">
            <ImagePlus size={24} />
            <span className="text-[13px] font-medium">{t('builder.cover.upload')}</span>
            <span className="font-mono text-[11px] opacity-80">{t('builder.cover.hint')}</span>
          </span>
        )}
      </button>
      {d.coverPreview && (
        <button
          type="button"
          onClick={clear}
          aria-label={t('common.remove')}
          className="absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-md bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/75"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
