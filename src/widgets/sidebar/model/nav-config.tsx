import {
  BarChart3,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  Palette,
  Send,
  Settings,
  Users,
} from 'lucide-react';
// (Users icon retained for Team & Roles)
import type { ComponentType } from 'react';

import { paths } from '@/shared/config/paths';

export interface NavItem {
  /** i18n key under `nav.*`. */
  labelKey: string;
  to: string;
  icon: ComponentType<{ size?: number | string }>;
  /** Match nested routes (e.g. Events stays active inside an event detail). */
  match?: (pathname: string) => boolean;
}

/** Organizer navigation (design spec §4.1). The photographer's own workspace
 *  is a separate product surface and intentionally not part of this dashboard. */
export const NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.dashboard', to: paths.dashboard, icon: LayoutDashboard, match: (p) => p === '/' },
  { labelKey: 'nav.events', to: paths.events, icon: CalendarDays, match: (p) => p.startsWith('/events') },
  { labelKey: 'nav.branding', to: paths.branding, icon: Palette },
  { labelKey: 'nav.delivery', to: paths.delivery, icon: Send },
  { labelKey: 'nav.analytics', to: paths.analytics, icon: BarChart3 },
  { labelKey: 'nav.teamRoles', to: paths.team, icon: Users },
  { labelKey: 'nav.billing', to: paths.billing, icon: CreditCard },
  { labelKey: 'nav.settings', to: paths.settings, icon: Settings },
];
