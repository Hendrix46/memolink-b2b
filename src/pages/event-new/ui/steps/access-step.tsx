import { useTranslation } from 'react-i18next';
import { Globe, Lock, Mail } from 'lucide-react';

import { useEventDraftStore, type Visibility } from '@/features/event-builder';
import { cn } from '@/shared/lib/cn';

const OPTIONS: { key: Visibility; i18n: string; icon: typeof Globe }[] = [
  { key: 'public', i18n: 'public', icon: Globe },
  { key: 'private', i18n: 'private', icon: Lock },
  { key: 'invite', i18n: 'invite', icon: Mail },
];

export function AccessStep() {
  const { t } = useTranslation();
  const visibility = useEventDraftStore((s) => s.draft.visibility);
  const patch = useEventDraftStore((s) => s.patch);

  return (
    <div className="space-y-3">
      <p className="text-[13.5px] text-text-secondary">{t('builder.accessStep.intro')}</p>
      {OPTIONS.map((o) => {
        const Icon = o.icon;
        const on = visibility === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => patch({ visibility: o.key })}
            className={cn(
              'flex w-full items-center gap-3.5 rounded-[14px] border p-4 text-left transition-colors',
              on ? 'border-accent bg-[rgba(102,112,255,0.08)]' : 'border-border hover:border-border-strong',
            )}
          >
            <span
              className={cn(
                'flex size-10 flex-none items-center justify-center rounded-[10px]',
                on ? 'bg-accent text-white' : 'bg-surface-raised text-text-secondary',
              )}
            >
              <Icon size={18} />
            </span>
            <span className="flex-1">
              <span className="block text-[13.5px] font-semibold">{t(`builder.accessStep.${o.i18n}`)}</span>
              <span className="block text-xs text-text-muted">{t(`builder.accessStep.${o.i18n}Desc`)}</span>
            </span>
            <span className={cn('size-4 rounded-full border-2', on ? 'border-accent bg-accent' : 'border-border')} />
          </button>
        );
      })}
    </div>
  );
}
