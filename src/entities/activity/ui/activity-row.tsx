import { Trans } from 'react-i18next';

import { Avatar } from '@/shared/ui';
import type { ActivityItem } from '../model/types';

export function ActivityRow({ item }: { item: ActivityItem }) {
  return (
    <div className="flex items-center gap-3.5 border-t border-hairline py-3 first:border-0">
      <Avatar name={item.actorName} size={36} />
      <p className="min-w-0 flex-1 text-[13.5px] leading-snug">
        <Trans
          i18nKey="dashboard.activity"
          values={{ name: item.actorName, count: item.count, event: item.eventName }}
          components={[
            <span className="font-semibold" />,
            <span className="font-semibold text-accent" />,
            <span className="font-medium" />,
          ]}
        />
      </p>
      <span className="flex-none font-mono text-xs text-text-muted">{item.time}</span>
    </div>
  );
}
