import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronsUpDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import { useViewer } from '@/entities/session';
import { cn } from '@/shared/lib/cn';
import { useShellStore } from '@/widgets/app-shell/model/shell-store';
import { NAV_ITEMS } from '../model/nav-config';

/** Collapsible sidebar (design spec §4.3). */
export function Sidebar() {
  const { t } = useTranslation();
  const viewer = useViewer();
  const { pathname } = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useShellStore();

  const items = NAV_ITEMS;
  const width = sidebarCollapsed ? 68 : 232;

  return (
    <nav
      className="flex flex-none flex-col gap-[3px] overflow-hidden border-r border-border bg-sidebar p-3 transition-[width] duration-200"
      style={{ width }}
    >
      {/* Workspace switcher */}
      <button
        title={t('nav.switchWorkspace')}
        className="mb-2.5 flex w-full items-center gap-2.5 rounded-[11px] border border-border bg-surface p-2 text-left transition-colors hover:border-border-strong"
      >
        <span className="flex size-[34px] flex-none items-center justify-center rounded-[9px] bg-[linear-gradient(140deg,#6D5EF6,#4AA8FF)] text-[13px] font-bold text-white">
          {viewer.workspace.mark}
        </span>
        {!sidebarCollapsed && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-semibold tracking-[-0.01em]">
                {viewer.workspace.name}
              </span>
              <span className="block whitespace-nowrap text-[11px] text-text-muted">
                {t('nav.eventOrganizer')}
              </span>
            </span>
            <ChevronsUpDown size={14} className="flex-none text-text-muted" />
          </>
        )}
      </button>

      {items.map((item) => {
        const active = item.match ? item.match(pathname) : pathname === item.to;
        const Icon = item.icon;
        return (
          <NavLink
            key={item.labelKey}
            to={item.to}
            title={t(item.labelKey)}
            className={cn(
              'relative flex h-10 items-center gap-3 rounded-[9px] px-[11px] text-[13.5px] transition-colors',
              active ? 'bg-surface-hover text-text' : 'text-text-secondary hover:bg-surface-hover',
            )}
          >
            {active && (
              <span className="absolute inset-y-[7px] left-0 w-[3px] rounded-r-[3px] bg-accent" />
            )}
            <Icon size={18} />
            {!sidebarCollapsed && <span className="truncate">{t(item.labelKey)}</span>}
          </NavLink>
        );
      })}

      <div className="flex-1" />

      <button
        onClick={toggleSidebar}
        className="flex h-10 items-center gap-3 rounded-[9px] px-[11px] text-[13px] text-text-muted transition-colors hover:bg-surface-hover"
      >
        {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        {!sidebarCollapsed && <span>{t('nav.collapse')}</span>}
      </button>
    </nav>
  );
}
