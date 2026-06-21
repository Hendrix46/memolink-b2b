import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Image,
  Network,
  QrCode,
  Send,
  Ticket,
  Users,
  Video,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import { Switch } from '@/shared/ui';
import { MODULE_META, type ModuleKey } from '../model/types';
import { useEventDraftStore } from '../model/event-draft-store';

const ICONS: Record<string, LucideIcon> = {
  calendar: Calendar,
  users: Users,
  ticket: Ticket,
  image: Image,
  qr: QrCode,
  send: Send,
  network: Network,
  video: Video,
};

/**
 * Toggle grid of optional event capabilities. Enabling a module reveals its
 * dedicated configuration step later in the wizard — this is what makes the
 * flow dynamic and per-client customizable.
 */
export function ModuleGrid() {
  const { t } = useTranslation();
  const modules = useEventDraftStore((s) => s.draft.modules);
  const setModule = useEventDraftStore((s) => s.setModule);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {(Object.keys(MODULE_META) as ModuleKey[]).map((key) => {
        const meta = MODULE_META[key];
        const Icon = ICONS[meta.icon] ?? Calendar;
        const on = modules[key];
        return (
          <button
            key={key}
            type="button"
            onClick={() => setModule(key, !on)}
            className={cn(
              'flex items-center gap-3.5 rounded-[14px] border p-4 text-left transition-colors',
              on ? 'border-accent bg-[rgba(109,94,246,0.08)]' : 'border-border hover:border-border-strong',
            )}
          >
            <span
              className={cn(
                'flex size-10 flex-none items-center justify-center rounded-[10px] transition-colors',
                on ? 'bg-accent text-white' : 'bg-surface-raised text-text-secondary',
              )}
            >
              <Icon size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-semibold">{t(`builder.modules.${key}`)}</span>
              <span className="block text-xs text-text-muted">{t(`builder.modules.${key}Desc`)}</span>
            </span>
            <Switch checked={on} onChange={(v) => setModule(key, v)} aria-label={t(`builder.modules.${key}`)} />
          </button>
        );
      })}
    </div>
  );
}
