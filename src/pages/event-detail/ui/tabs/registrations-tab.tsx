import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';

import type { Attendee, EventDetail } from '@/entities/event';
import { Avatar, Card, ProgressBar } from '@/shared/ui';
import { formatPercent } from '@/shared/lib/format';

const TICKET_COLOR: Record<Attendee['ticket'], string> = {
  VIP: 'var(--color-featured)',
  Speaker: 'var(--color-processing)',
  Standard: 'var(--color-text-secondary)',
  Staff: 'var(--color-pending)',
};

export function RegistrationsTab({ event }: { event: EventDetail }) {
  const { t } = useTranslation();
  const { registration: reg, attendees } = event;
  const fill = reg.total / reg.capacity;

  const kpis = [
    { label: t('eventDetail.registrations.registered'), value: reg.total.toLocaleString() },
    { label: t('eventDetail.registrations.capacity'), value: reg.capacity.toLocaleString() },
    { label: t('eventDetail.registrations.checkedIn'), value: reg.checkedIn.toLocaleString() },
    { label: t('eventDetail.registrations.noShows'), value: reg.noShow.toLocaleString() },
  ];

  return (
    <div className="space-y-[18px]">
      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} compact>
            <div className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-text-muted">{k.label}</div>
            <div className="mt-2.5 font-mono text-[24px] font-semibold tracking-[-0.02em]">{k.value}</div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="mb-2.5 flex justify-between text-[13px]">
          <span className="font-semibold">{t('eventDetail.registrations.capacityFilled')}</span>
          <span className="font-mono text-text-secondary">{formatPercent(fill)}</span>
        </div>
        <ProgressBar value={fill} height={9} />
      </Card>

      <Card className="p-0">
        <div className="grid grid-cols-[2fr_1.4fr_1fr_0.8fr] gap-3 border-b border-border px-5 py-3 text-[11.5px] font-medium uppercase tracking-[0.05em] text-text-muted">
          <span>{t('eventDetail.registrations.colAttendee')}</span>
          <span>{t('eventDetail.registrations.colCompany')}</span>
          <span>{t('eventDetail.registrations.colTicket')}</span>
          <span className="text-right">{t('eventDetail.registrations.colCheckedIn')}</span>
        </div>
        {attendees.map((a) => (
          <div key={a.id} className="grid grid-cols-[2fr_1.4fr_1fr_0.8fr] items-center gap-3 border-b border-hairline px-5 py-3.5 last:border-0">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={a.name} size={34} />
              <div className="min-w-0">
                <div className="text-[13.5px] font-medium">{a.name}</div>
                <div className="truncate font-mono text-[11.5px] text-text-muted">{a.email}</div>
              </div>
            </div>
            <span className="text-[13px] text-text-secondary">{a.company}</span>
            <span
              className="justify-self-start rounded-md px-2.5 py-1 text-[11.5px] font-semibold"
              style={{ color: TICKET_COLOR[a.ticket], background: 'rgba(255,255,255,0.04)' }}
            >
              {t(`ticket.${a.ticket}`)}
            </span>
            <span className="justify-self-end">
              {a.checkedIn && <Check size={18} className="text-approved" strokeWidth={2.5} />}
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}
