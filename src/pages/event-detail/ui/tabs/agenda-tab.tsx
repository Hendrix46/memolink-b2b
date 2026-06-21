import { useTranslation } from 'react-i18next';
import { Plus, User } from 'lucide-react';

import type { EventDetail } from '@/entities/event';
import { Button, Card } from '@/shared/ui';

export function AgendaTab({ event }: { event: EventDetail }) {
  const { t } = useTranslation();
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">{t('eventDetail.agenda.schedule')}</h2>
          <p className="mt-1 text-[13px] text-text-secondary">
            {event.date} · {event.location}
          </p>
        </div>
        <Button variant="primary" leadingIcon={<Plus size={15} strokeWidth={2.4} />}>
          {t('eventDetail.agenda.addSession')}
        </Button>
      </div>

      <Card className="p-0">
        {event.agenda.map((a) => (
          <div key={a.id} className="flex items-center gap-4 border-b border-hairline px-5 py-4 last:border-0">
            <span className="w-13 flex-none font-mono text-sm" style={{ width: 52 }}>
              {a.time}
            </span>
            <span className="w-1 flex-none self-stretch rounded-full" style={{ background: a.color }} />
            <div className="min-w-0 flex-1">
              <div className="text-[14.5px] font-medium">{a.title}</div>
              {a.speaker && (
                <div className="mt-1 flex items-center gap-1.5 text-[12.5px] text-text-secondary">
                  <User size={13} className="text-text-muted" />
                  {a.speaker}
                </div>
              )}
            </div>
            <span className="flex-none font-mono text-[12.5px] text-text-muted">{a.room}</span>
            {a.speaker && (
              <span
                className="flex-none rounded-md px-2.5 py-1 text-[11px] font-semibold"
                style={{ color: a.color, background: 'rgba(255,255,255,0.04)' }}
              >
                {a.track}
              </span>
            )}
          </div>
        ))}
      </Card>
    </>
  );
}
