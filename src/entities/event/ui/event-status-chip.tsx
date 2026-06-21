import { useTranslation } from 'react-i18next';

import type { EventStatus } from '@/shared/config/status';
import { eventStatusMeta } from '@/shared/config/status';
import { StatusBadge } from '@/shared/ui';

interface EventStatusChipProps {
  status: EventStatus;
  surface?: boolean;
}

export function EventStatusChip({ status, surface }: EventStatusChipProps) {
  const { t } = useTranslation();
  const meta = eventStatusMeta(status);
  return <StatusBadge color={meta.color} label={t(`eventStatus.${status}`)} surface={surface} />;
}
