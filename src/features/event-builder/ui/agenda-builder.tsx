import { useTranslation } from 'react-i18next';
import { CalendarPlus, Plus, Trash2 } from 'lucide-react';

import { Button, Input, Select, TimePicker } from '@/shared/ui';
import type { AgendaDraftItem } from '../model/types';
import { useEventDraftStore } from '../model/event-draft-store';

/** Dynamic agenda builder — add/remove sessions with time, speaker, track. */
export function AgendaBuilder() {
  const { t } = useTranslation();
  const agenda = useEventDraftStore((s) => s.draft.agenda);
  const addSession = useEventDraftStore((s) => s.addSession);
  const updateSession = useEventDraftStore((s) => s.updateSession);
  const removeSession = useEventDraftStore((s) => s.removeSession);

  const trackOptions = (['Keynote', 'Talk', 'Workshop', 'Social'] as const).map((tr) => ({
    value: tr,
    label: t(`builder.agendaStep.tracks.${tr}`),
  }));

  return (
    <div className="space-y-3">
      {agenda.length === 0 && (
        <div className="flex flex-col items-center rounded-[12px] border border-dashed border-border px-6 py-10 text-center">
          <CalendarPlus size={22} className="mb-2 text-text-muted" />
          <p className="text-[13.5px] text-text-secondary">{t('builder.agendaStep.noSessions')}</p>
        </div>
      )}

      {agenda.map((session) => (
        <div key={session.id} className="rounded-[12px] border border-border bg-surface p-3.5">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[120px_1fr]">
            <TimePicker value={session.time} onChange={(v) => updateSession(session.id, { time: v })} />
            <Input
              placeholder={t('builder.agendaStep.titlePh')}
              value={session.title}
              onChange={(e) => updateSession(session.id, { title: e.target.value })}
            />
          </div>
          <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-[1.4fr_1fr_1fr]">
            <Input
              placeholder={t('builder.agendaStep.speakerPh')}
              value={session.speaker}
              onChange={(e) => updateSession(session.id, { speaker: e.target.value })}
            />
            <Input
              placeholder={t('builder.agendaStep.roomPh')}
              value={session.room}
              onChange={(e) => updateSession(session.id, { room: e.target.value })}
            />
            <Select
              options={trackOptions}
              value={session.track}
              onChange={(e) => updateSession(session.id, { track: e.target.value as AgendaDraftItem['track'] })}
            />
          </div>
          <div className="mt-2.5 flex justify-end">
            <button
              type="button"
              aria-label={t('builder.agendaStep.remove')}
              onClick={() => removeSession(session.id)}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-text-muted hover:text-rejected"
            >
              <Trash2 size={13} /> {t('builder.agendaStep.remove')}
            </button>
          </div>
        </div>
      ))}

      <Button variant="secondary" leadingIcon={<Plus size={15} />} onClick={addSession}>
        {t('builder.agendaStep.addSession')}
      </Button>
    </div>
  );
}
