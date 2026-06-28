import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarDays, Camera, Images, MapPin, UploadCloud, Users } from 'lucide-react';

import { useMyAssignments } from '@/entities/photographer';
import type { EventSummary } from '@/entities/event';
import { EventStatusChip } from '@/entities/event';
import { paths } from '@/shared/config/paths';
import { coverFrom } from '@/shared/lib/visual';
import { formatEventDate } from '@/shared/lib/format';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  PageContainer,
  PageHeader,
  Skeleton,
} from '@/shared/ui';

/**
 * Photographer: My Assignments. The backend has no dedicated "my assignments"
 * endpoint, so the list is derived best-effort from the active org's events
 * (`GET /api/org/events`, changelog §11/§13).
 */
export function AssignmentsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: events, isLoading, isError, refetch } = useMyAssignments();

  return (
    <PageContainer width="narrow">
      <PageHeader title={t('assignments.title')} description={t('assignments.subtitle')} />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading || !events ? (
        <div className="flex flex-col gap-3.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={128} radius={16} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={<Camera size={24} />}
          title={t('assignments.emptyTitle')}
          description={t('assignments.emptyDesc')}
        />
      ) : (
        <div className="flex flex-col gap-3.5">
          {events.map((e) => (
            <AssignmentCard
              key={e.eventId}
              event={e}
              onUpload={() => navigate(paths.upload(e.eventId))}
              onView={() => navigate(paths.myUploads)}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

interface AssignmentCardProps {
  event: EventSummary;
  onUpload: () => void;
  onView: () => void;
}

function AssignmentCard({ event, onUpload, onView }: AssignmentCardProps) {
  const { t } = useTranslation();

  return (
    <Card compact className="flex items-center gap-[18px]">
      <div
        className="h-24 w-[130px] flex-none rounded-[11px]"
        style={{ background: coverFrom(event.coverPhotoUrl, event.eventId) }}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <h2 className="truncate text-base font-semibold">{event.title}</h2>
          <EventStatusChip status={event.eventStatus} />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[12.5px] text-text-secondary">
          <CalendarDays size={13} className="text-text-muted" />
          <span>{formatEventDate(event.eventStartDate, event.eventEndDate)}</span>
          {event.locationName && (
            <>
              <span className="text-border-strong">·</span>
              <MapPin size={13} className="text-text-muted" />
              <span>{event.locationName}</span>
            </>
          )}
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-[12.5px] text-text-muted">
          <Users size={13} />
          <span>
            {t('assignments.attendees', { count: event.currentAttendeeCount })}
          </span>
        </div>
      </div>

      <div className="flex flex-none flex-col gap-2">
        <Button variant="primary" leadingIcon={<UploadCloud size={16} />} onClick={onUpload}>
          {t('assignments.upload')}
        </Button>
        <Button variant="secondary" size="sm" leadingIcon={<Images size={15} />} onClick={onView}>
          {t('assignments.myUploads')}
        </Button>
      </div>
    </Card>
  );
}
