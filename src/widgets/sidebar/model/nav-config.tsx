import {
  BarChart3,
  CalendarDays,
  Camera,
  CreditCard,
  Images,
  LayoutDashboard,
  Palette,
  Send,
  Settings,
  UploadCloud,
  UserCircle,
  Users,
} from 'lucide-react';
import type { ComponentType } from 'react';

import type { Lens } from '@/entities/session';
import { paths } from '@/shared/config/paths';

export interface NavItem {
  /** i18n key under `nav.*`. */
  labelKey: string;
  to: string;
  icon: ComponentType<{ size?: number | string }>;
  /** Match nested routes (e.g. Events stays active inside an event detail). */
  match?: (pathname: string) => boolean;
}

/** Organizer navigation (design spec §4.1). */
export const ORGANIZER_NAV: NavItem[] = [
  { labelKey: 'nav.dashboard', to: paths.dashboard, icon: LayoutDashboard, match: (p) => p === '/' },
  { labelKey: 'nav.events', to: paths.events, icon: CalendarDays, match: (p) => p.startsWith('/events') },
  { labelKey: 'nav.photographers', to: paths.photographers, icon: Camera },
  { labelKey: 'nav.branding', to: paths.branding, icon: Palette },
  { labelKey: 'nav.delivery', to: paths.delivery, icon: Send },
  { labelKey: 'nav.analytics', to: paths.analytics, icon: BarChart3 },
  { labelKey: 'nav.teamRoles', to: paths.team, icon: Users },
  { labelKey: 'nav.billing', to: paths.billing, icon: CreditCard },
  { labelKey: 'nav.settings', to: paths.settings, icon: Settings },
];

/** Photographer navigation (design spec §4.2). Upload is contextual (launched
 *  from an assignment), so it isn't a top-level nav item. */
export const PHOTOGRAPHER_NAV: NavItem[] = [
  { labelKey: 'nav.assignments', to: paths.assignments, icon: UploadCloud, match: (p) => p.startsWith('/assignments') },
  { labelKey: 'nav.myUploads', to: paths.myUploads, icon: Images },
  { labelKey: 'nav.profile', to: paths.profile, icon: UserCircle },
];

/** The sidebar items for the active lens (spec §2 — one shell, two lenses). */
export function navForLens(lens: Lens): NavItem[] {
  return lens === 'photographer' ? PHOTOGRAPHER_NAV : ORGANIZER_NAV;
}
