import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarClock, MapPin, Pencil, Plus, Trash2, Users2 } from 'lucide-react';

import type { EventDetail } from '@/entities/event';
import {
  useAgenda,
  useAssignSpeaker,
  useCreateSession,
  useCreateTrack,
  useDeleteSession,
  useDeleteTrack,
  useUnassignSpeaker,
  useUpdateSession,
  useUpdateTrack,
  type Session,
  type SessionInput,
  type Track,
  type TrackInput,
} from '@/entities/conference';
import { useVenues } from '@/entities/venue';
import { UserPicker, useUserDirectoryMap, useUserDirectorySeed } from '@/entities/user';
import { ApiError } from '@/shared/api';
import { formatEventDate } from '@/shared/lib/format';
import {
  Button,
  Card,
  ConfirmDialog,
  DatePicker,
  EmptyState,
  ErrorState,
  Field,
  IconButton,
  Input,
  Modal,
  Select,
  Skeleton,
  Textarea,
  TimePicker,
  toast,
} from '@/shared/ui';

const TRACK_COLORS = ['#6670FF', '#4AA8FF', '#3DD68C', '#E0A33E', '#F0556E', '#8387ff', '#42c2b8'];

type Directory = Record<string, { name: string } | undefined>;

/** Best display name for an assigned speaker: directory name → headline → generic label. */
const speakerLabel = (dir: Directory, userId: string, headline: string | null | undefined, fallback: string) =>
  dir[userId]?.name ?? headline ?? fallback;

interface SessionModalState {
  open: boolean;
  session: Session | null;
}

export function AgendaTab({ event }: { event: EventDetail }) {
  const { t, i18n } = useTranslation();
  const eventId = event.eventId;
  const agendaQuery = useAgenda(eventId);
  const venuesQuery = useVenues(eventId);

  const deleteSession = useDeleteSession(eventId);
  const deleteTrack = useDeleteTrack(eventId);

  // Resolve assigned-speaker ids → names (the agenda contract returns id + headline only).
  useUserDirectorySeed();
  const directory = useUserDirectoryMap();

  const [sessionModal, setSessionModal] = useState<SessionModalState>({ open: false, session: null });
  const [trackModal, setTrackModal] = useState<{ open: boolean; track: Track | null }>({
    open: false,
    track: null,
  });
  const [speakerSession, setSpeakerSession] = useState<Session | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  const [trackToDelete, setTrackToDelete] = useState<Track | null>(null);

  const tracks = agendaQuery.data?.tracks ?? [];
  const trackById = useMemo(() => new Map(tracks.map((tr) => [tr.trackId, tr])), [tracks]);

  // Flat list of "Venue · Room" options for the session room picker.
  const roomOptions = useMemo(
    () =>
      (venuesQuery.data ?? []).flatMap((v) =>
        v.rooms.map((r) => ({ value: r.roomId, label: `${v.name} · ${r.name}` })),
      ),
    [venuesQuery.data],
  );
  const roomLabelById = useMemo(
    () => new Map(roomOptions.map((o) => [o.value, o.label])),
    [roomOptions],
  );

  // Sessions sorted by time, then grouped into day buckets.
  const dayGroups = useMemo(() => {
    const sessions = [...(agendaQuery.data?.sessions ?? [])].sort(
      (a, b) => a.startTime.localeCompare(b.startTime) || a.sortOrder - b.sortOrder,
    );
    const groups = new Map<string, Session[]>();
    for (const s of sessions) {
      const key = s.startTime.slice(0, 10); // YYYY-MM-DD
      const list = groups.get(key) ?? [];
      list.push(s);
      groups.set(key, list);
    }
    return [...groups.entries()];
  }, [agendaQuery.data]);

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' });
  const fmtDay = (key: string) =>
    new Date(`${key}T00:00:00`).toLocaleDateString(i18n.language, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

  const confirmDeleteSession = () => {
    if (!sessionToDelete) return;
    deleteSession.mutate(sessionToDelete.sessionId, {
      onSuccess: () => setSessionToDelete(null),
      onError: () => toast.error(t('eventDetail.agenda.deleteFailed')),
    });
  };

  const confirmDeleteTrack = () => {
    if (!trackToDelete) return;
    deleteTrack.mutate(trackToDelete.trackId, {
      onSuccess: () => setTrackToDelete(null),
      onError: () => toast.error(t('eventDetail.agenda.trackFailed')),
    });
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
          <Button variant="secondary" leadingIcon={<Plus size={15} />} onClick={() => setTrackModal({ open: true, track: null })}>
            {t('eventDetail.agenda.addTrack')}
          </Button>
          <Button
            variant="primary"
            leadingIcon={<Plus size={15} strokeWidth={2.4} />}
            onClick={() => setSessionModal({ open: true, session: null })}
          >
            {t('eventDetail.agenda.addSession')}
          </Button>
        </div>
      </div>

      {/* Tracks legend — click to edit, delete inline. */}
      {tracks.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-[12px] font-medium text-text-muted">{t('eventDetail.agenda.tracks')}:</span>
          {tracks.map((tr) => (
            <span
              key={tr.trackId}
              className="group flex items-center gap-1.5 rounded-full border border-border bg-surface py-1 pl-2.5 pr-1.5 text-[12px]"
            >
              <span className="size-2.5 rounded-full" style={{ background: tr.color ?? 'var(--color-border-strong)' }} />
              <button className="font-medium hover:text-accent" onClick={() => setTrackModal({ open: true, track: tr })}>
                {tr.name}
              </button>
              <button
                aria-label={t('eventDetail.agenda.deleteTrack')}
                onClick={() => setTrackToDelete(tr)}
                className="flex size-4 items-center justify-center rounded-full text-text-muted opacity-0 transition-opacity hover:bg-[rgba(255,255,255,0.06)] hover:text-rejected group-hover:opacity-100"
              >
                <Trash2 size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

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
      ) : dayGroups.length === 0 ? (
        <EmptyState
          icon={<CalendarClock size={24} />}
          title={t('eventDetail.agenda.emptyTitle')}
          description={t('eventDetail.agenda.emptyDesc')}
        />
      ) : (
        <div className="space-y-5">
          {dayGroups.map(([dayKey, daySessions]) => (
            <div key={dayKey}>
              <h3 className="mb-2 px-1 text-[13px] font-semibold text-text-secondary">{fmtDay(dayKey)}</h3>
              <Card className="p-0">
                {daySessions.map((s) => (
                  <SessionRow
                    key={s.sessionId}
                    session={s}
                    track={s.trackId ? trackById.get(s.trackId) : undefined}
                    roomLabel={s.roomId ? roomLabelById.get(s.roomId) : undefined}
                    time={`${fmtTime(s.startTime)} – ${fmtTime(s.endTime)}`}
                    directory={directory}
                    onEdit={() => setSessionModal({ open: true, session: s })}
                    onManageSpeakers={() => setSpeakerSession(s)}
                    onDelete={() => setSessionToDelete(s)}
                  />
                ))}
              </Card>
            </div>
          ))}
        </div>
      )}

      <SessionFormModal
        key={sessionModal.session?.sessionId ?? 'new-session'}
        eventId={eventId}
        open={sessionModal.open}
        session={sessionModal.session}
        tracks={tracks}
        roomOptions={roomOptions}
        defaultDate={event.eventStartDate.slice(0, 10)}
        onClose={() => setSessionModal({ open: false, session: null })}
      />

      <TrackFormModal
        key={trackModal.track?.trackId ?? 'new-track'}
        eventId={eventId}
        open={trackModal.open}
        track={trackModal.track}
        trackCount={tracks.length}
        onClose={() => setTrackModal({ open: false, track: null })}
      />

      {speakerSession && (
        <SpeakerModal
          eventId={eventId}
          session={
            // Keep the modal bound to the freshest copy after invalidation.
            agendaQuery.data?.sessions.find((s) => s.sessionId === speakerSession.sessionId) ?? speakerSession
          }
          directory={directory}
          onClose={() => setSpeakerSession(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(sessionToDelete)}
        onClose={() => setSessionToDelete(null)}
        onConfirm={confirmDeleteSession}
        title={t('eventDetail.agenda.deleteSession')}
        description={t('eventDetail.agenda.deleteSessionConfirm')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        destructive
        loading={deleteSession.isPending}
      />

      <ConfirmDialog
        open={Boolean(trackToDelete)}
        onClose={() => setTrackToDelete(null)}
        onConfirm={confirmDeleteTrack}
        title={t('eventDetail.agenda.deleteTrack')}
        description={t('eventDetail.agenda.deleteTrackConfirm')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        destructive
        loading={deleteTrack.isPending}
      />
    </>
  );
}

/* ─────────────────────────── Session row ─────────────────────────── */

function SessionRow({
  session,
  track,
  roomLabel,
  time,
  directory,
  onEdit,
  onManageSpeakers,
  onDelete,
}: {
  session: Session;
  track?: Track;
  roomLabel?: string;
  time: string;
  directory: Directory;
  onEdit: () => void;
  onManageSpeakers: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const trackColor = track?.color ?? 'var(--color-border-strong)';

  return (
    <div className="flex items-start gap-4 border-b border-hairline px-5 py-4 last:border-0">
      <span className="flex-none whitespace-nowrap pt-0.5 font-mono text-[12.5px] text-text-secondary" style={{ width: 104 }}>
        {time}
      </span>
      <span className="mt-0.5 w-1 flex-none self-stretch rounded-full" style={{ background: trackColor }} />
      <div className="min-w-0 flex-1">
        <div className="text-[14.5px] font-medium">{session.title}</div>
        {session.description && (
          <p className="mt-0.5 line-clamp-2 text-[12.5px] text-text-secondary">{session.description}</p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {roomLabel && (
            <span className="flex items-center gap-1 text-[12px] text-text-secondary">
              <MapPin size={12} className="text-text-muted" />
              {roomLabel}
            </span>
          )}
          {session.speakers.length > 0 ? (
            <span className="flex flex-wrap items-center gap-1.5">
              {session.speakers.map((sp) => (
                <span
                  key={sp.userId}
                  className="rounded-md bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-[11.5px] text-text-secondary"
                >
                  {speakerLabel(directory, sp.userId, sp.headline, t('eventDetail.agenda.speaker'))}
                </span>
              ))}
            </span>
          ) : null}
        </div>
      </div>
      {track && (
        <span
          className="mt-0.5 hidden flex-none rounded-md px-2.5 py-1 text-[11px] font-semibold sm:inline"
          style={{ color: trackColor, background: 'rgba(255,255,255,0.04)' }}
        >
          {track.name}
        </span>
      )}
      <div className="flex flex-none items-center gap-0.5">
        <IconButton aria-label={t('eventDetail.agenda.manageSpeakers')} size="sm" onClick={onManageSpeakers}>
          <Users2 size={15} />
        </IconButton>
        <IconButton aria-label={t('common.edit')} size="sm" onClick={onEdit}>
          <Pencil size={14} />
        </IconButton>
        <IconButton aria-label={t('common.delete')} size="sm" onClick={onDelete}>
          <Trash2 size={15} />
        </IconButton>
      </div>
    </div>
  );
}

/* ─────────────────────────── Session form ─────────────────────────── */

/** `LocalDateTime` (no zone) → editable `YYYY-MM-DDTHH:mm` (drops any seconds/zone). */
const toLocalInput = (iso?: string | null) => (iso ? iso.slice(0, 16) : '');
/** `YYYY-MM-DDTHH:mm` → `LocalDateTime` (`…:00`), matching the event-edit form. */
const toLocalDateTime = (value: string) => (value.length === 16 ? `${value}:00` : value);
/** Split / recombine the editable value for the separate date + time pickers. */
const dateOf = (dt: string) => dt.slice(0, 10);
const timeOf = (dt: string) => dt.slice(11, 16);
const combine = (date: string, time: string) => (date ? `${date}T${time || '09:00'}` : '');

function SessionFormModal({
  eventId,
  open,
  session,
  tracks,
  roomOptions,
  defaultDate,
  onClose,
}: {
  eventId: string;
  open: boolean;
  session: Session | null;
  tracks: Track[];
  roomOptions: { value: string; label: string }[];
  /** `YYYY-MM-DD` the new-session pickers default to (the event's start day). */
  defaultDate: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const createSession = useCreateSession(eventId);
  const updateSession = useUpdateSession(eventId);

  const [title, setTitle] = useState(session?.title ?? '');
  const [description, setDescription] = useState(session?.description ?? '');
  const [start, setStart] = useState(
    session ? toLocalInput(session.startTime) : defaultDate ? `${defaultDate}T09:00` : '',
  );
  const [end, setEnd] = useState(
    session ? toLocalInput(session.endTime) : defaultDate ? `${defaultDate}T10:00` : '',
  );
  const [trackId, setTrackId] = useState(session?.trackId ?? '');
  const [roomId, setRoomId] = useState(session?.roomId ?? '');

  const saving = createSession.isPending || updateSession.isPending;

  const submit = () => {
    if (!title.trim() || !start || !end) return;
    if (start >= end) {
      toast.error(t('eventDetail.agenda.timeOrder'));
      return;
    }
    const body: SessionInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      startTime: toLocalDateTime(start),
      endTime: toLocalDateTime(end),
      trackId: trackId || undefined,
      roomId: roomId || undefined,
      sortOrder: session?.sortOrder ?? 0,
    };
    const onError = (e: unknown) =>
      toast.error(e instanceof ApiError ? e.message : t('eventDetail.agenda.sessionFailed'));
    if (session) {
      updateSession.mutate({ sessionId: session.sessionId, body }, { onSuccess: onClose, onError });
    } else {
      createSession.mutate(body, { onSuccess: onClose, onError });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={session ? t('eventDetail.agenda.editSession') : t('eventDetail.agenda.addSession')}
      width={520}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" disabled={!title.trim() || !start || !end || saving} onClick={submit}>
            {session ? t('common.save') : t('common.create')}
          </Button>
        </>
      }
    >
      <div className="space-y-3.5">
        <Field label={t('eventDetail.agenda.sessionTitle')}>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('eventDetail.agenda.titlePh')} />
        </Field>
        <Field label={t('eventDetail.agenda.description')}>
          <Textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('eventDetail.agenda.descriptionPh')}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label={t('eventDetail.agenda.startDate')}>
            <DatePicker value={dateOf(start)} onChange={(d) => setStart(combine(d, timeOf(start)))} />
          </Field>
          <Field label={t('eventDetail.agenda.startTime')}>
            <TimePicker value={timeOf(start)} onChange={(tm) => setStart(combine(dateOf(start) || defaultDate, tm))} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label={t('eventDetail.agenda.endDate')}>
            <DatePicker value={dateOf(end)} onChange={(d) => setEnd(combine(d, timeOf(end)))} />
          </Field>
          <Field label={t('eventDetail.agenda.endTime')}>
            <TimePicker value={timeOf(end)} onChange={(tm) => setEnd(combine(dateOf(end) || defaultDate, tm))} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
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
          {roomOptions.length > 0 && (
            <Field label={t('eventDetail.agenda.room')}>
              <Select
                value={roomId}
                options={[{ value: '', label: t('eventDetail.agenda.noRoom') }, ...roomOptions]}
                onChange={(e) => setRoomId(e.target.value)}
              />
            </Field>
          )}
        </div>
        {roomOptions.length === 0 && (
          <p className="text-[11.5px] text-text-muted">{t('eventDetail.agenda.noRoomsHint')}</p>
        )}
      </div>
    </Modal>
  );
}

/* ─────────────────────────── Track form ─────────────────────────── */

function TrackFormModal({
  eventId,
  open,
  track,
  trackCount,
  onClose,
}: {
  eventId: string;
  open: boolean;
  track: Track | null;
  trackCount: number;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const createTrack = useCreateTrack(eventId);
  const updateTrack = useUpdateTrack(eventId);

  const [name, setName] = useState(track?.name ?? '');
  const [color, setColor] = useState(track?.color ?? TRACK_COLORS[trackCount % TRACK_COLORS.length]);

  const saving = createTrack.isPending || updateTrack.isPending;

  const submit = () => {
    if (!name.trim()) return;
    const body: TrackInput = { name: name.trim(), color, sortOrder: track?.sortOrder ?? trackCount };
    const onError = () => toast.error(t('eventDetail.agenda.trackFailed'));
    if (track) {
      updateTrack.mutate({ trackId: track.trackId, body }, { onSuccess: onClose, onError });
    } else {
      createTrack.mutate(body, { onSuccess: onClose, onError });
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={track ? t('eventDetail.agenda.editTrack') : t('eventDetail.agenda.addTrack')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" disabled={!name.trim() || saving} onClick={submit}>
            {track ? t('common.save') : t('common.create')}
          </Button>
        </>
      }
    >
      <div className="space-y-3.5">
        <Field label={t('eventDetail.agenda.trackName')}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('eventDetail.agenda.trackNamePh')} />
        </Field>
        <Field label={t('eventDetail.agenda.trackColor')}>
          <div className="flex flex-wrap gap-2">
            {TRACK_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                onClick={() => setColor(c)}
                className="size-7 rounded-full transition-transform hover:scale-110"
                style={{
                  background: c,
                  outline: color === c ? '2px solid var(--color-text)' : '2px solid transparent',
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  );
}

/* ─────────────────────────── Speaker manager ─────────────────────────── */

function SpeakerModal({
  eventId,
  session,
  directory,
  onClose,
}: {
  eventId: string;
  session: Session;
  directory: Directory;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const assign = useAssignSpeaker(eventId);
  const unassign = useUnassignSpeaker(eventId);

  const speakerIds = session.speakers.map((s) => s.userId);

  return (
    <Modal open onClose={onClose} title={t('eventDetail.agenda.manageSpeakers')} description={session.title} width={460}>
      <div className="space-y-4">
        <UserPicker
          placeholder={t('eventDetail.agenda.assignSpeakerPh')}
          searchingLabel={t('eventDetail.agenda.searchingPeople')}
          emptyLabel={t('eventDetail.agenda.noPeople')}
          excludeIds={speakerIds}
          onSelect={(user) =>
            assign.mutate(
              { sessionId: session.sessionId, userId: user.userId },
              { onError: () => toast.error(t('eventDetail.agenda.assignFailed')) },
            )
          }
        />

        {session.speakers.length === 0 ? (
          <p className="text-[12.5px] text-text-muted">{t('eventDetail.agenda.noSpeakers')}</p>
        ) : (
          <div className="space-y-2">
            {session.speakers.map((sp) => {
              const resolvedName = directory[sp.userId]?.name;
              const primary = resolvedName ?? sp.headline ?? t('eventDetail.agenda.speaker');
              const secondary = resolvedName ? sp.headline : undefined;
              return (
              <div
                key={sp.userId}
                className="flex items-center gap-3 rounded-[10px] border border-border bg-surface px-3 py-2"
              >
                <span className="flex size-8 flex-none items-center justify-center rounded-full bg-[rgba(102,112,255,0.14)] text-accent">
                  <Users2 size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium">{primary}</div>
                  {secondary && <div className="truncate text-[11px] text-text-muted">{secondary}</div>}
                </div>
                <IconButton
                  aria-label={t('common.remove')}
                  size="sm"
                  onClick={() =>
                    unassign.mutate(
                      { sessionId: session.sessionId, userId: sp.userId },
                      { onError: () => toast.error(t('eventDetail.agenda.unassignFailed')) },
                    )
                  }
                >
                  <Trash2 size={14} />
                </IconButton>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
