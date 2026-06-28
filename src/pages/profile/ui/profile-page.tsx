import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';

import { useViewer } from '@/entities/session';
import {
  useAddAvailability,
  useDeleteAvailability,
  usePhotographerAvailability,
  usePhotographerProfile,
  useUpdatePhotographerProfile,
  useUploadPhotographerPhoto,
} from '@/entities/photographer';
import { ApiError } from '@/shared/api';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  IconButton,
  Input,
  PageContainer,
  PageHeader,
  SectionHeader,
  Skeleton,
  Switch,
  Textarea,
  toast,
} from '@/shared/ui';

/** Photographer: Profile & Availability (changelog §11). */
export function ProfilePage() {
  const { t } = useTranslation();
  const viewer = useViewer();

  const profileQuery = usePhotographerProfile();
  const updateProfile = useUpdatePhotographerProfile();
  const uploadPhoto = useUploadPhotographerPhoto();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [bio, setBio] = useState('');
  const [gear, setGear] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // Seed the form from the loaded profile once.
  useEffect(() => {
    const p = profileQuery.data;
    if (!p) return;
    setBio(p.bio ?? '');
    setGear(p.gear ?? '');
    setPortfolioUrl(p.portfolioUrl ?? '');
    setIsPublic(p.public);
  }, [profileQuery.data]);

  const save = () => {
    updateProfile.mutate(
      { bio, gear, portfolioUrl, public: isPublic },
      {
        onSuccess: () => toast.success(t('profile.saved')),
        onError: () => toast.error(t('profile.saveFailed')),
      },
    );
  };

  const onPickPhoto = (file: File | undefined) => {
    if (!file) return;
    uploadPhoto.mutate(file, {
      onSuccess: () => toast.success(t('profile.photoUploaded')),
      onError: () => toast.error(t('profile.photoFailed')),
    });
  };

  return (
    <PageContainer width="narrow">
      <PageHeader title={t('profile.title')} description={t('profile.subtitle')} />

      {profileQuery.isError ? (
        <ErrorState onRetry={() => profileQuery.refetch()} />
      ) : profileQuery.isLoading ? (
        <div className="flex flex-col gap-[18px]">
          <Skeleton height={96} radius={16} />
          <Skeleton height={220} radius={16} />
        </div>
      ) : (
        <>
          {/* Identity */}
          <Card className="mb-[18px] flex items-center gap-[18px]">
            {profileQuery.data?.photoUrl ? (
              <img
                src={profileQuery.data.photoUrl}
                alt={viewer.name}
                className="size-16 flex-none rounded-full object-cover"
              />
            ) : (
              <Avatar name={viewer.name} size={64} />
            )}
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-semibold">{viewer.name}</h2>
              <p className="mt-0.5 text-[13px] text-text-secondary">{t('profile.identitySub')}</p>
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onPickPhoto(e.target.files?.[0])}
            />
            <Button
              variant="secondary"
              size="sm"
              disabled={uploadPhoto.isPending}
              onClick={() => photoInputRef.current?.click()}
            >
              {t('profile.changePhoto')}
            </Button>
          </Card>

          {/* Details */}
          <Card className="mb-[18px]">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <Field label={t('profile.gear')}>
                <Input value={gear} onChange={(e) => setGear(e.target.value)} />
              </Field>
              <Field label={t('profile.portfolioUrl')}>
                <Input
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder={t('profile.portfolioPh')}
                />
              </Field>
            </div>
            <div className="mt-3.5">
              <Field label={t('profile.bio')}>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
              </Field>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2.5 text-[13.5px] text-text-secondary">
                <Switch checked={isPublic} onChange={setIsPublic} aria-label={t('profile.public')} />
                {t('profile.public')}
              </label>
              <Button variant="primary" disabled={updateProfile.isPending} onClick={save}>
                {t('common.saveChanges')}
              </Button>
            </div>
          </Card>

          {/* Availability windows */}
          <AvailabilityCard />
        </>
      )}
    </PageContainer>
  );
}

function AvailabilityCard() {
  const { t, i18n } = useTranslation();
  const windowsQuery = usePhotographerAvailability();
  const addWindow = useAddAvailability();
  const deleteWindow = useDeleteAvailability();

  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [note, setNote] = useState('');

  const add = () => {
    if (!start || !end) return;
    if (start >= end) {
      toast.error(t('profile.availabilityOrder'));
      return;
    }
    addWindow.mutate(
      { startTime: start, endTime: end, note: note || undefined },
      {
        onSuccess: () => {
          setStart('');
          setEnd('');
          setNote('');
        },
        onError: (e) =>
          toast.error(e instanceof ApiError ? e.message : t('profile.availabilityFailed')),
      },
    );
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const windows = windowsQuery.data ?? [];

  return (
    <Card>
      <SectionHeader title={t('profile.availabilityTitle')} />

      {/* Add window */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_1fr_1.2fr_auto]">
        <Field label={t('profile.from')}>
          <Input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </Field>
        <Field label={t('profile.to')}>
          <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        </Field>
        <Field label={t('profile.note')}>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('profile.notePh')}
          />
        </Field>
        <div className="flex items-end">
          <Button
            variant="secondary"
            leadingIcon={<Plus size={15} />}
            disabled={!start || !end || addWindow.isPending}
            onClick={add}
          >
            {t('profile.addWindow')}
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="mt-4">
        {windowsQuery.isLoading ? (
          <Skeleton height={56} radius={12} />
        ) : windows.length === 0 ? (
          <EmptyState title={t('profile.noWindows')} description={t('profile.noWindowsDesc')} />
        ) : (
          <div className="flex flex-col gap-2">
            {windows.map((w) => (
              <div
                key={w.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium">
                    {fmt(w.startTime)} – {fmt(w.endTime)}
                  </div>
                  {w.note && (
                    <div className="truncate text-[12.5px] text-text-muted">{w.note}</div>
                  )}
                </div>
                <IconButton
                  aria-label={t('common.delete')}
                  size="sm"
                  onClick={() => deleteWindow.mutate(w.id)}
                >
                  <Trash2 size={15} />
                </IconButton>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
