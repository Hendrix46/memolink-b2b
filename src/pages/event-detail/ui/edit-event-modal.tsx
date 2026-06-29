import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';

import { useUpdateEvent, type EventDetail, type UpdateEventPayload } from '@/entities/event';
import type { AccessLevel } from '@/shared/config/status';
import { ApiError } from '@/shared/api';
import { Button, DatePicker, Field, Input, Modal, Select, Textarea, TimePicker, toast } from '@/shared/ui';

/** `YYYY-MM-DDTHH:mm` → `LocalDateTime` (`…:00`). */
const toLocalDateTime = (value: string) => (value.length === 16 ? `${value}:00` : value);
const toInput = (iso: string | null | undefined) => (iso ? iso.slice(0, 16) : '');
/** Split / recombine the editable value for the separate date + time pickers. */
const dateOf = (dt: string) => dt.slice(0, 10);
const timeOf = (dt: string) => dt.slice(11, 16);
const combine = (date: string, time: string) => (date ? `${date}T${time || '09:00'}` : '');

export function EditEventModal({
  open,
  event,
  onClose,
}: {
  open: boolean;
  event: EventDetail;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const updateEvent = useUpdateEvent(event.eventId);

  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description ?? '');
  const [locationName, setLocationName] = useState(event.locationName ?? '');
  const [address, setAddress] = useState(event.locationAddress ?? '');
  const [start, setStart] = useState(toInput(event.eventStartDate));
  const [end, setEnd] = useState(toInput(event.eventEndDate));
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(event.accessLevel);
  const [capacity, setCapacity] = useState(event.maxAttendees ? String(event.maxAttendees) : '');

  const submit = () => {
    if (!title.trim() || !start || !end) return;
    if (start >= end) {
      toast.error(t('eventDetail.editEvent.timeOrder'));
      return;
    }
    const cap = Number(capacity);
    const payload: UpdateEventPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      accessLevel,
      eventStartDate: toLocalDateTime(start),
      eventEndDate: toLocalDateTime(end),
      maxAttendees: capacity.trim() && Number.isFinite(cap) && cap > 0 ? cap : undefined,
    };
    // Only send location when a name exists (contract requires it); preserve the
    // saved coordinates so an address-only edit doesn't drop the map pin.
    if (locationName.trim()) {
      payload.location = {
        name: locationName.trim(),
        address: address.trim(),
        latitude: event.latitude ?? undefined,
        longitude: event.longitude ?? undefined,
      };
    }

    updateEvent.mutate(payload, {
      onSuccess: () => {
        toast.success(t('eventDetail.editEvent.saved'));
        onClose();
      },
      onError: (e) => toast.error(e instanceof ApiError ? e.message : t('eventDetail.editEvent.failed')),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('eventDetail.editEvent.title')}
      width={560}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" disabled={!title.trim() || !start || !end || updateEvent.isPending} onClick={submit}>
            {t('common.saveChanges')}
          </Button>
        </>
      }
    >
      <div className="space-y-3.5">
        <Field label={t('eventDetail.editEvent.name')}>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('eventDetail.editEvent.namePh')} />
        </Field>
        <Field label={t('eventDetail.editEvent.description')}>
          <Textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('eventDetail.editEvent.descriptionPh')}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label={t('eventDetail.editEvent.locationName')}>
            <Input
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder={t('eventDetail.editEvent.locationNamePh')}
              leadingIcon={<MapPin size={15} />}
            />
          </Field>
          <Field label={t('eventDetail.editEvent.address')}>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t('eventDetail.editEvent.addressPh')} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label={t('eventDetail.editEvent.startDate')}>
            <DatePicker value={dateOf(start)} onChange={(d) => setStart(combine(d, timeOf(start)))} />
          </Field>
          <Field label={t('eventDetail.editEvent.startTime')}>
            <TimePicker value={timeOf(start)} onChange={(tm) => setStart(combine(dateOf(start), tm))} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label={t('eventDetail.editEvent.endDate')}>
            <DatePicker value={dateOf(end)} onChange={(d) => setEnd(combine(d, timeOf(end)))} />
          </Field>
          <Field label={t('eventDetail.editEvent.endTime')}>
            <TimePicker value={timeOf(end)} onChange={(tm) => setEnd(combine(dateOf(end), tm))} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label={t('eventDetail.editEvent.accessLevel')}>
            <Select
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
              options={[
                { value: 'PRIVATE', label: t('eventDetail.editEvent.private') },
                { value: 'PUBLIC', label: t('eventDetail.editEvent.public') },
              ]}
            />
          </Field>
          <Field label={t('eventDetail.editEvent.capacity')}>
            <Input
              type="number"
              min={0}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder={t('eventDetail.editEvent.capacityPh')}
            />
          </Field>
        </div>
      </div>
    </Modal>
  );
}
