import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Music2, UploadCloud, Video, X } from 'lucide-react';

import { useUploadMedia, type MediaType } from '@/entities/media';
import { Button, Modal, toast } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';

const TYPE_ICON: Record<MediaType, typeof Image> = { image: Image, video: Video, audio: Music2 };

/** Derive the gallery media type from a picked file's MIME type. */
function typeOf(file: File): MediaType {
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'image';
}

/**
 * Organizer self-upload (image / video / audio). The enterprise team uploads
 * media to the event directly — there is no separate photographer role.
 */
export function UploadMediaButton({ eventId }: { eventId: string }) {
  const { t } = useTranslation();
  const upload = useUploadMedia(eventId);
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (picked: FileList | null) => {
    if (!picked) return;
    setFiles((prev) => [...prev, ...Array.from(picked)]);
  };

  const removeAt = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const reset = () => {
    setFiles([]);
    setOpen(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const submit = () => {
    const count = files.length;
    upload.mutate(files, {
      onSuccess: () => {
        toast.success(t('mediaUpload.uploaded', { count }));
        reset();
      },
      onError: () => toast.error(t('mediaUpload.failed')),
    });
  };

  return (
    <>
      <Button variant="primary" leadingIcon={<UploadCloud size={15} />} onClick={() => setOpen(true)}>
        {t('mediaUpload.upload')}
      </Button>

      <Modal
        open={open}
        onClose={reset}
        title={t('mediaUpload.title')}
        description={t('mediaUpload.subtitle')}
        width={520}
        footer={
          <>
            <Button variant="secondary" onClick={reset}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" loading={upload.isPending} disabled={files.length === 0} onClick={submit}>
              {t('mediaUpload.uploadCount', { count: files.length })}
            </Button>
          </>
        }
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex w-full flex-col items-center gap-2.5 rounded-[14px] border-[1.5px] border-dashed border-border-strong px-5 py-8 text-center transition-colors',
            'bg-[linear-gradient(180deg,rgba(102,112,255,0.05),transparent)] hover:border-accent',
          )}
        >
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[rgba(102,112,255,0.14)] text-accent-soft">
            <UploadCloud size={22} />
          </span>
          <span className="text-[13.5px] font-semibold">{t('mediaUpload.drop')}</span>
          <span className="text-xs text-text-muted">{t('mediaUpload.formats')}</span>
        </button>

        {files.length > 0 && (
          <div className="mt-4 max-h-[200px] space-y-2 overflow-y-auto">
            {files.map((file, i) => {
              const Icon = TYPE_ICON[typeOf(file)];
              return (
                <div
                  key={`${file.name}-${i}`}
                  className="flex items-center gap-3 rounded-[10px] border border-border bg-surface px-3 py-2"
                >
                  <span className="flex size-8 flex-none items-center justify-center rounded-lg bg-surface-raised text-text-secondary">
                    <Icon size={15} />
                  </span>
                  <span className="flex-1 truncate text-[13px] font-medium">{file.name}</span>
                  <button
                    aria-label={t('common.remove')}
                    onClick={() => removeAt(i)}
                    className="flex size-7 flex-none items-center justify-center rounded-md text-text-muted hover:bg-surface-hover hover:text-text"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </>
  );
}
