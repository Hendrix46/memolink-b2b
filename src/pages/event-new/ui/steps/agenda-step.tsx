import { useTranslation } from 'react-i18next';

import { AgendaBuilder } from '@/features/event-builder';

export function AgendaStep() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <p className="text-[13.5px] text-text-secondary">{t('builder.agendaStep.intro')}</p>
      <AgendaBuilder />
    </div>
  );
}
