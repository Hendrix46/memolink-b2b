import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import { useLens } from '@/entities/session';
import { WorkspaceSwitcher } from '@/features/workspace-switch';
import { cn } from '@/shared/lib/cn';
import { useShellStore } from '@/widgets/app-shell/model/shell-store';
import { navForLens } from '../model/nav-config';

/** Collapsible, lens-gated sidebar (design spec §2, §4.3). */
export function Sidebar() {
  const { t } = useTranslation();
  const lens = useLens();
  const { pathname } = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useShellStore();

  const items = navForLens(lens);
  const width = sidebarCollapsed ? 68 : 232;

  return (
    <nav
      className="flex flex-none flex-col gap-[3px] overflow-hidden border-r border-border bg-sidebar p-3 transition-[width] duration-200"
      style={{ width }}
    >
      <WorkspaceSwitcher collapsed={sidebarCollapsed} />

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
