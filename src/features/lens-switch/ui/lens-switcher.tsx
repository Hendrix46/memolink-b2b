import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Camera, Check, ChevronDown, LayoutDashboard } from 'lucide-react';
import type { ComponentType } from 'react';

import { useLens, useSessionStore, type Lens } from '@/entities/session';
import { paths } from '@/shared/config/paths';
import { cn } from '@/shared/lib/cn';

interface LensMeta {
  icon: ComponentType<{ size?: number | string }>;
  /** Dot + icon tint color (CSS var). */
  color: string;
  /** Background for the dropdown icon tile. */
  tint: string;
  labelKey: string;
  descKey: string;
  /** Where switching to this lens lands the user. */
  home: string;
}

const LENS_META: Record<Lens, LensMeta> = {
  organizer: {
    icon: LayoutDashboard,
    color: 'var(--color-accent)',
    tint: 'rgba(102,112,255,0.16)',
    labelKey: 'lens.organizer',
    descKey: 'lens.organizerDesc',
    home: paths.dashboard,
  },
  photographer: {
    icon: Camera,
    color: 'var(--color-approved)',
    tint: 'rgba(61,214,140,0.16)',
    labelKey: 'lens.photographer',
    descKey: 'lens.photographerDesc',
    home: paths.assignments,
  },
};

const LENSES = Object.keys(LENS_META) as Lens[];

/** Lens switcher (spec §1c) — swaps the active perspective and re-gates nav. */
export function LensSwitcher() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const lens = useLens();
  const setLens = useSessionStore((s) => s.setLens);
  const [open, setOpen] = useState(false);

  const active = LENS_META[lens];

  const pick = (next: Lens) => {
    setOpen(false);
    if (next !== lens) {
      setLens(next);
      navigate(LENS_META[next].home);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-[38px] items-center gap-2.5 rounded-[10px] border border-border bg-surface px-3 text-[13px] font-medium transition-colors hover:border-accent"
      >
        <span className="size-[7px] rounded-full" style={{ background: active.color }} />
        <span>{t(active.labelKey)}</span>
        <ChevronDown size={14} className="text-text-secondary" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="animate-in absolute right-0 top-[46px] z-40 w-[268px] rounded-[12px] border border-border bg-surface-raised p-1.5 shadow-[var(--shadow-pop)]"
          >
            <div className="px-2.5 pb-1.5 pt-2 text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
              {t('lens.switch')}
            </div>
            {LENSES.map((key) => {
              const meta = LENS_META[key];
              const Icon = meta.icon;
              const isActive = key === lens;
              return (
                <button
                  key={key}
                  role="menuitemradio"
                  aria-checked={isActive}
                  onClick={() => pick(key)}
                  className="flex w-full items-center gap-3 rounded-[9px] p-2 text-left transition-colors hover:bg-border"
                >
                  <span
                    className="flex size-[34px] flex-none items-center justify-center rounded-[9px]"
                    style={{ background: meta.tint, color: meta.color }}
                  >
                    <Icon size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-medium">{t(meta.labelKey)}</span>
                    <span className="block text-[12px] text-text-muted">{t(meta.descKey)}</span>
                  </span>
                  <Check
                    size={16}
                    className={cn('flex-none text-accent', !isActive && 'invisible')}
                  />
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
