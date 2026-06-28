import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';

import { useSessionStore, useViewer, useWorkspaces } from '@/entities/session';
import { CreateOrgModal } from '@/features/org-create';

/** Workspace switcher (spec §2a) — multi-workspace account model in the sidebar. */
export function WorkspaceSwitcher({ collapsed }: { collapsed: boolean }) {
  const { t } = useTranslation();
  const viewer = useViewer();
  const workspaces = useWorkspaces();
  const setWorkspace = useSessionStore((s) => s.setWorkspace);
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const active = viewer.workspace;

  // The shell renders the sidebar (and this switcher) only once an org exists.
  if (!active) return null;

  const pick = (id: string) => {
    setOpen(false);
    setWorkspace(id);
  };

  return (
    <div className="relative mb-2.5">
      <button
        title={t('nav.switchWorkspace')}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-[11px] border border-border bg-surface p-2 text-left transition-colors hover:border-border-strong"
      >
        <span
          className="flex size-[34px] flex-none items-center justify-center rounded-[9px] text-[13px] font-bold text-white"
          style={{ background: active.gradient }}
        >
          {active.mark}
        </span>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-semibold tracking-[-0.01em]">
                {active.name}
              </span>
              <span className="block whitespace-nowrap text-[11px] text-text-muted">{active.kind}</span>
            </span>
            <ChevronsUpDown size={14} className="flex-none text-text-muted" />
          </>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="animate-in absolute left-0 right-0 top-[54px] z-50 rounded-[12px] border border-border bg-surface-raised p-1.5 shadow-[var(--shadow-pop)]"
          >
            <div className="px-2.5 pb-1.5 pt-2 text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
              {t('workspace.workspaces')}
            </div>
            {workspaces.map((w) => (
              <button
                key={w.id}
                role="menuitemradio"
                aria-checked={w.id === active.id}
                onClick={() => pick(w.id)}
                className="flex w-full items-center gap-2.5 rounded-[9px] p-2 text-left transition-colors hover:bg-border"
              >
                <span
                  className="flex size-[30px] flex-none items-center justify-center rounded-lg text-[11.5px] font-bold text-white"
                  style={{ background: w.gradient }}
                >
                  {w.mark}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{w.name}</span>
                  <span className="block text-[11px] text-text-muted">{w.kind}</span>
                </span>
                {w.id === active.id && <Check size={15} className="flex-none text-accent" />}
              </button>
            ))}
            <div className="mx-1 my-1.5 h-px bg-border" />
            <button
              onClick={() => {
                setOpen(false);
                setCreateOpen(true);
              }}
              className="flex w-full items-center gap-2.5 rounded-[9px] p-2 text-left text-accent-soft transition-colors hover:bg-border"
            >
              <span className="flex size-[30px] flex-none items-center justify-center rounded-lg border border-dashed border-border-strong">
                <Plus size={14} />
              </span>
              <span className="text-[13px] font-medium">{t('workspace.create')}</span>
            </button>
          </div>
        </>
      )}

      <CreateOrgModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
