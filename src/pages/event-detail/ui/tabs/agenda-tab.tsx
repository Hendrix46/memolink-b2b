import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarClock, Plus, Trash2, User } from 'lucide-react';

import type { EventDetail } from '@/entities/event';
import {
  useAgenda,
  useCreateSession,
  useCreateTrack,
  useDeleteSession,
  type Session,
} from '@/entities/conference';
import { ApiError } from '@/shared/api';
import { formatEventDate } from '@/shared/lib/format';
import {
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

const TRACK_COLORS = ['#6D5EF6', '#4AA8FF', '#3DD68C', '#E0A33E', '#F0556E'];

export function AgendaTab({ event }: { event: EventDetail }) {
  const { t, i18n } = useTranslation();
  const eventId = event.eventId;
  const agendaQuery = useAgenda(eventId);
  const createSession = useCreateSession(eventId);
  const createTrack = useCreateTrack(eventId);
  const deleteSession = useDeleteSession(eventId);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [trackId, setTrackId] = useState('');

  const [trackOpen, setTrackOpen] = useState(false);
  const [trackName, setTrackName] = useState('');

  const tracks = agendaQuery.data?.tracks ?? [];
  const sessions = useMemo(
    () =>
      [...(agendaQuery.data?.sessions ?? [])].sort(
        (a, b) => a.startTime.localeCompare(b.startTime) || a.sortOrder - b.sortOrder,
      ),
    [agendaQuery.data],
  );

  const trackById = new Map(tracks.map((tr) => [tr.trackId, tr]));

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' });

  const submitSession = () => {
    if (!title.trim() || !start || !end) return;
    if (start >= end) {
      toast.error(t('eventDetail.agenda.timeOrder'));
      return;
    }
    createSession.mutate(
      { title: title.trim(), startTime: start, endTime: end, trackId: trackId || undefined },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle('');
          setStart('');
          setEnd('');
          setTrackId('');
        },
        onError: (e) =>
          toast.error(e instanceof ApiError ? e.message : t('eventDetail.agenda.sessionFailed')),
      },
    );
  };

  const submitTrack = () => {
    if (!trackName.trim()) return;
    createTrack.mutate(
      {
        name: trackName.trim(),
        color: TRACK_COLORS[tracks.length % TRACK_COLORS.length],
        sortOrder: tracks.length,
      },
      {
        onSuccess: () => {
          setTrackOpen(false);
          setTrackName('');
        },
        onError: (e) =>
          toast.error(e instanceof ApiError ? e.message : t('eventDetail.agenda.trackFailed')),
      },
    );
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{t('eventDetail.agenda.schedule')}</h2>
          <p className="mt-1 text-[13px] text-text-secondary">
            {formatEventDate(event.eventStartDate, event.eventEndDate)}
            {event.locationName ? ` · ${event.locationName}` : ''}
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="secondary" leadingIcon={<Plus size={15} />} onClick={() => setTrackOpen(true)}>
            {t('eventDetail.agenda.addTrack')}
          </Button>
          <Button variant="primary" leadingIcon={<Plus size={15} strokeWidth={2.4} />} onClick={() => setOpen(true)}>
            {t('eventDetail.agenda.addSession')}
          </Button>
        </div>
      </div>

      {agendaQuery.isError ? (
        <ErrorState onRetry={() => agendaQuery.refetch()} />
      ) : agendaQuery.isLoading ? (
        <Card className="p-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border-b border-hairline px-5 py-4 last:border-0">
              <Skeleton height={28} radius={8} />
            </div>
          ))}
        </Card>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={<CalendarClock size={24} />}
          title={t('eventDetail.agenda.emptyTitle')}
          description={t('eventDetail.agenda.emptyDesc')}
        />
      ) : (
        <Card className="p-0">
          {sessions.map((s) => (
            <SessionRow
              key={s.sessionId}
              session={s}
              trackName={s.trackId ? trackById.get(s.trackId)?.name : undefined}
              trackColor={
                (s.trackId ? trackById.get(s.trackId)?.color : undefined) ?? 'var(--color-border-strong)'
              }
              time={fmtTime(s.startTime)}
              onDelete={() =>
                deleteSession.mutate(s.sessionId, {
                  onError: () => toast.error(t('eventDetail.agenda.deleteFailed')),
                })
              }
            />
          ))}
        </Card>
      )}

      {/* Add session */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('eventDetail.agenda.addSession')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              disabled={!title.trim() || !start || !end || createSession.isPending}
              onClick={submitSession}
            >
              {t('common.create')}
            </Button>
          </>
        }
      >
        <div className="space-y-3.5">
          <Field label={t('eventDetail.agenda.sessionTitle')}>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('eventDetail.agenda.titlePh')} />
          </Field>
          <div className="grid grid-cols-2 gap-3.5">
            <Field label={t('eventDetail.agenda.startTime')}>
              <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
            </Field>
            <Field label={t('eventDetail.agenda.endTime')}>
              <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
            </Field>
          </div>
          {tracks.length > 0 && (
            <Field label={t('eventDetail.agenda.track')}>
              <Select
                value={trackId}
                options={[
                  { value: '', label: t('eventDetail.agenda.noTrack') },
                  ...tracks.map((tr) => ({ value: tr.trackId, label: tr.name })),
                ]}
                onChange={(e) => setTrackId(e.target.value)}
              />
            </Field>
          )}
        </div>
      </Modal>

      {/* Add track */}
      <Modal
        open={trackOpen}
        onClose={() => setTrackOpen(false)}
        title={t('eventDetail.agenda.addTrack')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setTrackOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" disabled={!trackName.trim() || createTrack.isPending} onClick={submitTrack}>
              {t('common.create')}
            </Button>
          </>
        }
      >
        <Field label={t('eventDetail.agenda.trackName')}>
          <Input value={trackName} onChange={(e) => setTrackName(e.target.value)} placeholder={t('eventDetail.agenda.trackNamePh')} />
        </Field>
      </Modal>
    </>
  );
}

function SessionRow({
  session,
  trackName,
  trackColor,
  time,
  onDelete,
}: {
  session: Session;
  trackName?: string;
  trackColor: string;
  time: string;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const speaker = session.speakers[0];

  return (
    <div className="flex items-center gap-4 border-b border-hairline px-5 py-4 last:border-0">
      <span className="flex-none font-mono text-sm" style={{ width: 52 }}>
        {time}
      </span>
      <span className="w-1 flex-none self-stretch rounded-full" style={{ background: trackColor }} />
      <div className="min-w-0 flex-1">
        <div className="text-[14.5px] font-medium">{session.title}</div>
        {speaker && (
          <div className="mt-1 flex items-center gap-1.5 text-[12.5px] text-text-secondary">
            <User size={13} className="text-text-muted" />
            {speaker.headline ?? speaker.userId}
          </div>
        )}
      </div>
      {trackName && (
        <span
          className="flex-none rounded-md px-2.5 py-1 text-[11px] font-semibold"
          style={{ color: trackColor, background: 'rgba(255,255,255,0.04)' }}
        >
          {trackName}
        </span>
      )}
      <IconButton aria-label={t('common.delete')} size="sm" onClick={onDelete}>
        <Trash2 size={15} />
      </IconButton>
    </div>
  );
}
