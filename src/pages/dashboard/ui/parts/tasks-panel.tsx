import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, ChevronRight, Eye, Palette, Send, UserPlus } from 'lucide-react';
import type { ComponentType } from 'react';

import { Card } from '@/shared/ui';
import { paths } from '@/shared/config/paths';
import type { DashTask, DashTaskType } from '../../api/dashboard.api';

interface TaskMeta {
  icon: ComponentType<{ size?: number | string }>;
  color: string;
  /** Tab the task deep-links into on the event. */
  tab: string;
}

const TASK_META: Record<DashTaskType, TaskMeta> = {
  review: { icon: Eye, color: 'var(--color-pending)', tab: 'media' },
  publish: { icon: Send, color: 'var(--color-accent-soft)', tab: 'delivery' },
  branding: { icon: Palette, color: 'var(--color-processing)', tab: 'branding' },
  invite: { icon: UserPlus, color: 'var(--color-approved)', tab: 'photographers' },
};

/** "Your tasks" panel — actionable work that deep-links into the right tab. */
export function TasksPanel({ tasks }: { tasks: DashTask[] }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card>
      <div className="mb-1.5 flex items-center gap-2.5">
        <h2 className="text-[15px] font-semibold">{t('dashboard.tasks.title')}</h2>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-[7px] bg-[rgba(224,163,62,0.16)] px-1.5 text-[11.5px] font-semibold text-pending">
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center border-t border-hairline px-0 pb-3 pt-6 text-center">
          <span className="mb-3 flex size-[42px] items-center justify-center rounded-xl bg-[rgba(61,214,140,0.14)] text-approved">
            <Check size={20} strokeWidth={2.4} />
          </span>
          <div className="text-[13.5px] font-semibold">{t('dashboard.tasks.emptyTitle')}</div>
          <div className="mt-0.5 text-[12px] text-text-muted">{t('dashboard.tasks.emptyDesc')}</div>
        </div>
      ) : (
        <div className="flex flex-col">
          {tasks.map((task) => {
            const meta = TASK_META[task.type];
            const Icon = meta.icon;
            return (
              <button
                key={task.id}
                onClick={() => navigate(`${paths.event(task.eventId)}?tab=${meta.tab}`)}
                className="flex items-center gap-3.5 border-t border-hairline py-3.5 text-left transition-opacity first:border-0 hover:opacity-80"
              >
                <span
                  className="flex size-9 flex-none items-center justify-center rounded-[9px] border border-border bg-sidebar"
                  style={{ color: meta.color }}
                >
                  <Icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium">
                    {t(`dashboard.tasks.types.${task.type}`, { count: task.count ?? 0 })}
                  </div>
                  <div className="mt-0.5 truncate text-[12px] text-text-muted">{task.eventName}</div>
                </div>
                <ChevronRight size={16} className="flex-none text-text-muted" />
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
