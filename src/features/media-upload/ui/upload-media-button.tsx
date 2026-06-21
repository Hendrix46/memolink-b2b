import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Music2, UploadCloud, Video, X } from 'lucide-react';

import { useViewer } from '@/entities/session';
import { useUploadMedia, type MediaType } from '@/entities/media';
import { Button, Modal, toast } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';

const TYPE_ICON: Record<MediaType, typeof Image> = { image: Image, video: Video, audio: Music2 };
const TYPES: MediaType[] = ['image', 'video', 'audio'];

interface Pending {
  id: number;
  type: MediaType;
  name: string;
}

let seq = 0;

/**
 * Organizer self-upload (image / video / audio). The enterprise team uploads
 * media to the event directly — there is no separate photographer role.
 */
export function UploadMediaButton({ eventId }: { eventId: string }) {
  const { t } = useTranslation();
  const viewer = useViewer();
  const upload = useUploadMedia(eventId);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Pending[]>([]);

  const addOne = (type: MediaType) => {
    seq += 1;
    const ext = type === 'image' ? 'jpg' : type === 'video' ? 'mp4' : 'wav';
    setPending((p) => [...p, { id: seq, type, name: `${type}_${4000 + seq}.${ext}` }]);
  };

  const addMix = () => {
    addOne('image');
    addOne('image');
    addOne('video');
    addOne('audio');
  };

  const remove = (id: number) => setPending((p) => p.filter((x) => x.id !== id));

  const reset = () => {
    setPending([]);
    setOpen(false);
  };

  const submit = () => {
    upload.mutate(
      pending.map((p) => ({ type: p.type, uploadedBy: viewer.name })),
      {
        onSuccess: (created) => {
          toast.success(t('mediaUpload.uploaded', { count: created.length }));
          reset();
        },
        onError: () => toast.error(t('mediaUpload.failed')),
      },
    );
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
            <Button variant="primary" loading={upload.isPending} disabled={pending.length === 0} onClick={submit}>
              {t('mediaUpload.uploadCount', { count: pending.length })}
            </Button>
          </>
        }
      >
        <button
          type="button"
          onClick={addMix}
          className={cn(
            'flex w-full flex-col items-center gap-2.5 rounded-[14px] border-[1.5px] border-dashed border-border-strong px-5 py-8 text-center transition-colors',
            'bg-[linear-gradient(180deg,rgba(109,94,246,0.05),transparent)] hover:border-accent',
          )}
        >
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[rgba(109,94,246,0.14)] text-accent-soft">
            <UploadCloud size={22} />
          </span>
          <span className="text-[13.5px] font-semibold">{t('mediaUpload.drop')}</span>
          <span className="text-xs text-text-muted">{t('mediaUpload.formats')}</span>
        </button>

        {/* Add a single asset of a specific type */}
        <div className="mt-3 flex gap-2">
          {TYPES.map((type) => {
            const Icon = TYPE_ICON[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => addOne(type)}
                className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-border bg-surface py-2.5 text-[12.5px] font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text"
              >
                <Icon size={15} />
                {t(`media.type.${type}`)}
              </button>
            );
          })}
        </div>

        {pending.length > 0 && (
          <div className="mt-4 max-h-[200px] space-y-2 overflow-y-auto">
            {pending.map((p) => {
              const Icon = TYPE_ICON[p.type];
              return (
                <div key={p.id} className="flex items-center gap-3 rounded-[10px] border border-border bg-surface px-3 py-2">
                  <span className="flex size-8 flex-none items-center justify-center rounded-lg bg-surface-raised text-text-secondary">
                    <Icon size={15} />
                  </span>
                  <span className="flex-1 truncate text-[13px] font-medium">{p.name}</span>
                  <button
                    aria-label={t('common.remove')}
                    onClick={() => remove(p.id)}
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
