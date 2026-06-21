import { useTranslation } from 'react-i18next';

import { TicketEditor } from '@/features/event-builder';

export function TicketsStep() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <p className="text-[13.5px] text-text-secondary">{t('builder.ticketsStep.intro')}</p>
      <TicketEditor />
    </div>
  );
}
