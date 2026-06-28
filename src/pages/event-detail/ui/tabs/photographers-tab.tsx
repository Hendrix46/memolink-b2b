import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, UserPlus } from 'lucide-react';

import type { EventDetail } from '@/entities/event';
import { useActiveOrgId } from '@/entities/session';
import {
  useAssignPhotographer,
  useEventPhotographers,
  useUnassignPhotographer,
  type PhotographerAssignment,
} from '@/entities/photographer';
import { useOrgPhotographers } from '@/entities/org';
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
  Modal,
  Select,
  Skeleton,
  toast,
} from '@/shared/ui';

const STATUS_COLOR: Record<PhotographerAssignment['status'], string> = {
  ACTIVE: 'var(--color-approved)',
  REMOVED: 'var(--color-text-muted)',
};

const GRID = 'grid grid-cols-[2fr_1fr_1.2fr_40px] items-center gap-3';

export function PhotographersTab({ event }: { event: EventDetail }) {
  const { t } = useTranslation();
  const orgId = useActiveOrgId() ?? '';
  const eventId = event.eventId;

  const assignmentsQuery = useEventPhotographers(eventId);
  const orgPhotographers = useOrgPhotographers(orgId);
  const assign = useAssignPhotographer(eventId);
  const unassign = useUnassignPhotographer(eventId);

  const [open, setOpen] = useState(false);
  const [photographerId, setPhotographerId] = useState('');
  const [shootQuota, setShootQuota] = useState('');

  const candidates = orgPhotographers.data ?? [];

  const submit = () => {
    const id = photographerId || candidates[0]?.userId;
    if (!id) return;
    const quota = shootQuota ? Number(shootQuota) : undefined;
    assign.mutate(
      { photographerId: id, shootQuota: quota },
      {
        onSuccess: () => {
          toast.success(t('eventDetail.photographers.assigned'));
          setOpen(false);
          setPhotographerId('');
          setShootQuota('');
        },
        onError: (e) =>
          toast.error(e instanceof ApiError ? e.message : t('eventDetail.photographers.assignFailed')),
      },
    );
  };

  const assignments = assignmentsQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{t('eventDetail.photographers.title')}</h2>
        <Button variant="primary" leadingIcon={<UserPlus size={15} />} onClick={() => setOpen(true)}>
          {t('eventDetail.photographers.invite')}
        </Button>
      </div>

      {assignmentsQuery.isError ? (
        <ErrorState onRetry={() => assignmentsQuery.refetch()} />
      ) : assignmentsQuery.isLoading ? (
        <Card className="p-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border-b border-hairline px-[18px] py-3.5 last:border-0">
              <Skeleton height={38} radius={10} />
            </div>
          ))}
        </Card>
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={<UserPlus size={24} />}
          title={t('eventDetail.photographers.emptyTitle')}
          description={t('eventDetail.photographers.emptyDesc')}
        />
      ) : (
        <Card className="p-0">
          <div
            className={`${GRID} border-b border-border px-[18px] py-3 text-[11.5px] font-medium uppercase tracking-[0.05em] text-text-muted`}
          >
            <span>{t('eventDetail.photographers.colPhotographer')}</span>
            <span>{t('eventDetail.photographers.colStatus')}</span>
            <span>{t('eventDetail.photographers.colQuota')}</span>
            <span />
          </div>
          {assignments.map((p) => (
            <div key={p.photographerId} className={`${GRID} border-b border-hairline px-[18px] py-3.5 last:border-0`}>
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={p.photographerId} size={38} />
                <div className="truncate font-mono text-[12.5px] font-medium">{p.photographerId}</div>
              </div>
              <span
                className="flex items-center gap-1.5 text-[12.5px] font-medium"
                style={{ color: STATUS_COLOR[p.status] }}
              >
                <span className="size-1.5 rounded-full" style={{ background: STATUS_COLOR[p.status] }} />
                {t(`eventDetail.photographers.assignStatus.${p.status}`)}
              </span>
              <span className="font-mono text-[12.5px] text-text-secondary">
                {p.shootQuota != null ? t('eventDetail.photographers.quotaValue', { count: p.shootQuota }) : '—'}
              </span>
              <IconButton
                aria-label={t('common.remove')}
                size="sm"
                onClick={() =>
                  unassign.mutate(p.photographerId, {
                    onError: () => toast.error(t('eventDetail.photographers.unassignFailed')),
                  })
                }
              >
                <Trash2 size={16} />
              </IconButton>
            </div>
          ))}
        </Card>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('eventDetail.photographers.assignTitle')}
        description={t('eventDetail.photographers.assignDesc')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              leadingIcon={<UserPlus size={15} />}
              disabled={candidates.length === 0 || assign.isPending}
              onClick={submit}
            >
              {t('eventDetail.photographers.assign')}
            </Button>
          </>
        }
      >
        <div className="space-y-3.5">
          {candidates.length === 0 ? (
            <p className="text-[13px] text-text-muted">{t('eventDetail.photographers.noCandidates')}</p>
          ) : (
            <Field label={t('eventDetail.photographers.photographerLabel')}>
              <Select
                value={photographerId || candidates[0]?.userId}
                options={candidates.map((c) => ({ value: c.userId, label: c.userId }))}
                onChange={(e) => setPhotographerId(e.target.value)}
              />
            </Field>
          )}
          <Field label={t('eventDetail.photographers.quotaLabel')}>
            <Input
              type="number"
              min={1}
              value={shootQuota}
              onChange={(e) => setShootQuota(e.target.value)}
              placeholder={t('eventDetail.photographers.quotaPh')}
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
