import { useTranslation } from 'react-i18next';

import { ModuleGrid } from '@/features/event-builder';

export function ModulesStep() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <p className="text-[13.5px] text-text-secondary">{t('builder.modules.intro')}</p>
      <ModuleGrid />
    </div>
  );
}
