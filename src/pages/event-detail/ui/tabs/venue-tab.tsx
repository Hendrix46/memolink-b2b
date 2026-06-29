import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, DoorOpen, MapPin, Pencil, Plus, Trash2, Users } from 'lucide-react';

import type { EventDetail } from '@/entities/event';
import {
  useCreateRoom,
  useCreateVenue,
  useDeleteRoom,
  useDeleteVenue,
  useUpdateRoom,
  useUpdateVenue,
  useVenues,
  type Room,
  type RoomInput,
  type Venue,
  type VenueInput,
} from '@/entities/venue';
import { ApiError } from '@/shared/api';
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  IconButton,
  Input,
  Modal,
  Select,
  Skeleton,
  Textarea,
  toast,
} from '@/shared/ui';

/** Editing context for the room modal — which venue it belongs to + the row (or null = create). */
interface RoomEditing {
  venueId: string;
  room: Room | null;
}

export function VenueTab({ event }: { event: EventDetail }) {
  const { t } = useTranslation();
  const eventId = event.eventId;
  const venuesQuery = useVenues(eventId);

  const createVenue = useCreateVenue(eventId);
  const updateVenue = useUpdateVenue(eventId);
  const deleteVenue = useDeleteVenue(eventId);

  const [venueModal, setVenueModal] = useState<{ open: boolean; venue: Venue | null }>({
    open: false,
    venue: null,
  });
  const [roomModal, setRoomModal] = useState<RoomEditing | null>(null);
  const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null);

  const venues = venuesQuery.data ?? [];

  const saveVenue = (body: VenueInput) => {
    const onError = (e: unknown) =>
      toast.error(e instanceof ApiError ? e.message : t('eventDetail.venue.venueFailed'));
    if (venueModal.venue) {
      updateVenue.mutate(
        { venueId: venueModal.venue.venueId, body },
        { onSuccess: () => setVenueModal({ open: false, venue: null }), onError },
      );
    } else {
      createVenue.mutate(body, {
        onSuccess: () => setVenueModal({ open: false, venue: null }),
        onError,
      });
    }
  };

  const confirmDeleteVenue = () => {
    if (!venueToDelete) return;
    deleteVenue.mutate(venueToDelete.venueId, {
      onSuccess: () => setVenueToDelete(null),
      onError: () => toast.error(t('eventDetail.venue.deleteFailed')),
    });
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{t('eventDetail.venue.title')}</h2>
          <p className="mt-1 text-[13px] text-text-secondary">{t('eventDetail.venue.subtitle')}</p>
        </div>
        <Button
          variant="primary"
          leadingIcon={<Plus size={15} strokeWidth={2.4} />}
          onClick={() => setVenueModal({ open: true, venue: null })}
        >
          {t('eventDetail.venue.addVenue')}
        </Button>
      </div>

      {venuesQuery.isError ? (
        <ErrorState onRetry={() => venuesQuery.refetch()} />
      ) : venuesQuery.isLoading ? (
        <div className="space-y-3.5">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} height={132} radius={14} />
          ))}
        </div>
      ) : venues.length === 0 ? (
        <EmptyState
          icon={<Building2 size={24} />}
          title={t('eventDetail.venue.emptyTitle')}
          description={t('eventDetail.venue.emptyDesc')}
        />
      ) : (
        <div className="space-y-3.5">
          {venues.map((venue) => (
            <VenueCard
              key={venue.venueId}
              venue={venue}
              eventId={eventId}
              onEdit={() => setVenueModal({ open: true, venue })}
              onDelete={() => setVenueToDelete(venue)}
              onAddRoom={() => setRoomModal({ venueId: venue.venueId, room: null })}
              onEditRoom={(room) => setRoomModal({ venueId: venue.venueId, room })}
            />
          ))}
        </div>
      )}

      <VenueFormModal
        key={venueModal.venue?.venueId ?? 'new-venue'}
        open={venueModal.open}
        venue={venueModal.venue}
        saving={createVenue.isPending || updateVenue.isPending}
        onClose={() => setVenueModal({ open: false, venue: null })}
        onSave={saveVenue}
      />

      {roomModal && (
        <RoomFormModal
          eventId={eventId}
          venue={venues.find((v) => v.venueId === roomModal.venueId)}
          editing={roomModal.room}
          onClose={() => setRoomModal(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(venueToDelete)}
        onClose={() => setVenueToDelete(null)}
        onConfirm={confirmDeleteVenue}
        title={t('eventDetail.venue.deleteVenue')}
        description={t('eventDetail.venue.deleteVenueConfirm')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        destructive
        loading={deleteVenue.isPending}
      />
    </>
  );
}

/* ─────────────────────────── Venue card ─────────────────────────── */

function VenueCard({
  venue,
  eventId,
  onEdit,
  onDelete,
  onAddRoom,
  onEditRoom,
}: {
  venue: Venue;
  eventId: string;
  onEdit: () => void;
  onDelete: () => void;
  onAddRoom: () => void;
  onEditRoom: (room: Room) => void;
}) {
  const { t } = useTranslation();
  const deleteRoom = useDeleteRoom(eventId);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  // Group rooms into a parent → children tree (single level of nesting).
  const { topLevel, childrenOf } = useMemo(() => {
    const rooms = [...venue.rooms].sort((a, b) => a.sortOrder - b.sortOrder);
    const byParent = new Map<string, Room[]>();
    const roots: Room[] = [];
    for (const r of rooms) {
      if (r.parentRoomId && rooms.some((x) => x.roomId === r.parentRoomId)) {
        const list = byParent.get(r.parentRoomId) ?? [];
        list.push(r);
        byParent.set(r.parentRoomId, list);
      } else {
        roots.push(r);
      }
    }
    return { topLevel: roots, childrenOf: byParent };
  }, [venue.rooms]);

  const confirmDeleteRoom = () => {
    if (!roomToDelete) return;
    deleteRoom.mutate(
      { venueId: venue.venueId, roomId: roomToDelete.roomId },
      {
        onSuccess: () => setRoomToDelete(null),
        onError: () => toast.error(t('eventDetail.venue.deleteFailed')),
      },
    );
  };

  return (
    <Card className="p-0">
      <div className="flex items-start justify-between gap-4 border-b border-hairline p-4">
        <div className="flex min-w-0 gap-3">
          <span className="flex size-9 flex-none items-center justify-center rounded-[10px] bg-[rgba(109,94,246,0.14)] text-accent">
            <Building2 size={17} />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[14.5px] font-semibold">{venue.name}</div>
            {venue.address && (
              <div className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-text-secondary">
                <MapPin size={12} className="flex-none text-text-muted" />
                <span className="truncate">{venue.address}</span>
              </div>
            )}
            {venue.notes && <p className="mt-1 text-[12px] text-text-muted">{venue.notes}</p>}
          </div>
        </div>
        <div className="flex flex-none gap-1">
          <IconButton aria-label={t('common.edit')} size="sm" onClick={onEdit}>
            <Pencil size={14} />
          </IconButton>
          <IconButton aria-label={t('common.delete')} size="sm" onClick={onDelete}>
            <Trash2 size={14} />
          </IconButton>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[12px] font-medium uppercase tracking-wide text-text-muted">
            {t('eventDetail.venue.rooms')}
          </span>
          <Button variant="ghost" size="sm" leadingIcon={<Plus size={14} />} onClick={onAddRoom}>
            {t('eventDetail.venue.addRoom')}
          </Button>
        </div>

        {topLevel.length === 0 ? (
          <p className="text-[12.5px] text-text-muted">{t('eventDetail.venue.noRooms')}</p>
        ) : (
          <div className="space-y-1.5">
            {topLevel.map((room) => (
              <div key={room.roomId}>
                <RoomRow room={room} onEdit={() => onEditRoom(room)} onDelete={() => setRoomToDelete(room)} />
                {(childrenOf.get(room.roomId) ?? []).map((child) => (
                  <div key={child.roomId} className="ml-5 mt-1.5 border-l border-hairline pl-3">
                    <RoomRow
                      room={child}
                      onEdit={() => onEditRoom(child)}
                      onDelete={() => setRoomToDelete(child)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(roomToDelete)}
        onClose={() => setRoomToDelete(null)}
        onConfirm={confirmDeleteRoom}
        title={t('eventDetail.venue.deleteRoom')}
        description={t('eventDetail.venue.deleteRoomConfirm')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        destructive
        loading={deleteRoom.isPending}
      />
    </Card>
  );
}

function RoomRow({ room, onEdit, onDelete }: { room: Room; onEdit: () => void; onDelete: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2.5 rounded-[9px] border border-border bg-surface px-3 py-2">
      <DoorOpen size={15} className="flex-none text-text-muted" />
      <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{room.name}</span>
      {typeof room.capacity === 'number' && room.capacity > 0 && (
        <span className="flex flex-none items-center gap-1 text-[12px] text-text-secondary">
          <Users size={12} className="text-text-muted" />
          {t('eventDetail.venue.seats', { count: room.capacity })}
        </span>
      )}
      <IconButton aria-label={t('common.edit')} size="sm" onClick={onEdit}>
        <Pencil size={13} />
      </IconButton>
      <IconButton aria-label={t('common.delete')} size="sm" onClick={onDelete}>
        <Trash2 size={13} />
      </IconButton>
    </div>
  );
}

/* ─────────────────────────── Venue form ─────────────────────────── */

function VenueFormModal({
  open,
  venue,
  saving,
  onClose,
  onSave,
}: {
  open: boolean;
  venue: Venue | null;
  saving: boolean;
  onClose: () => void;
  onSave: (body: VenueInput) => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(venue?.name ?? '');
  const [address, setAddress] = useState(venue?.address ?? '');
  const [notes, setNotes] = useState(venue?.notes ?? '');

  const submit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
      latitude: venue?.latitude ?? undefined,
      longitude: venue?.longitude ?? undefined,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={venue ? t('eventDetail.venue.editVenue') : t('eventDetail.venue.addVenue')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" disabled={!name.trim() || saving} onClick={submit}>
            {venue ? t('common.save') : t('common.create')}
          </Button>
        </>
      }
    >
      <div className="space-y-3.5">
        <Field label={t('eventDetail.venue.name')}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('eventDetail.venue.namePh')} />
        </Field>
        <Field label={t('eventDetail.venue.address')}>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t('eventDetail.venue.addressPh')}
            leadingIcon={<MapPin size={15} />}
          />
        </Field>
        <Field label={t('eventDetail.venue.notes')}>
          <Textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('eventDetail.venue.notesPh')}
          />
        </Field>
      </div>
    </Modal>
  );
}

/* ─────────────────────────── Room form ─────────────────────────── */

function RoomFormModal({
  eventId,
  venue,
  editing,
  onClose,
}: {
  eventId: string;
  venue: Venue | undefined;
  editing: Room | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const createRoom = useCreateRoom(eventId);
  const updateRoom = useUpdateRoom(eventId);

  const [name, setName] = useState(editing?.name ?? '');
  const [capacity, setCapacity] = useState(editing?.capacity ? String(editing.capacity) : '');
  const [parentRoomId, setParentRoomId] = useState(editing?.parentRoomId ?? '');

  if (!venue) return null;
  const saving = createRoom.isPending || updateRoom.isPending;

  // A room can't be nested under itself or under another nested room (one level deep).
  const parentOptions = venue.rooms.filter(
    (r) => r.roomId !== editing?.roomId && !r.parentRoomId,
  );

  const submit = () => {
    if (!name.trim()) return;
    const cap = Number(capacity);
    const body: RoomInput = {
      name: name.trim(),
      capacity: capacity.trim() && Number.isFinite(cap) && cap > 0 ? cap : undefined,
      parentRoomId: parentRoomId || undefined,
      sortOrder: editing?.sortOrder ?? venue.rooms.length,
    };
    const onError = () => toast.error(t('eventDetail.venue.roomFailed'));
    if (editing) {
      updateRoom.mutate({ venueId: venue.venueId, roomId: editing.roomId, body }, { onSuccess: onClose, onError });
    } else {
      createRoom.mutate({ venueId: venue.venueId, body }, { onSuccess: onClose, onError });
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? t('eventDetail.venue.editRoom') : t('eventDetail.venue.addRoom')}
      description={venue.name}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" disabled={!name.trim() || saving} onClick={submit}>
            {editing ? t('common.save') : t('common.create')}
          </Button>
        </>
      }
    >
      <div className="space-y-3.5">
        <Field label={t('eventDetail.venue.roomName')}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('eventDetail.venue.roomNamePh')} />
        </Field>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label={t('eventDetail.venue.capacity')}>
            <Input
              type="number"
              min={0}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder={t('eventDetail.venue.capacityPh')}
            />
          </Field>
          {parentOptions.length > 0 && (
            <Field label={t('eventDetail.venue.parentRoom')}>
              <Select
                value={parentRoomId}
                onChange={(e) => setParentRoomId(e.target.value)}
                options={[
                  { value: '', label: t('eventDetail.venue.noParent') },
                  ...parentOptions.map((r) => ({ value: r.roomId, label: r.name })),
                ]}
              />
            </Field>
          )}
        </div>
      </div>
    </Modal>
  );
}
