import { Link } from 'react-router-dom';

import { AccountMenu } from '@/features/auth';
import { SearchTrigger } from '@/features/command-palette';
import { LensSwitcher } from '@/features/lens-switch';
import { LanguageSwitcher } from '@/features/locale-switch';
import { NotificationBell } from '@/features/notifications';
import { Logo } from '@/shared/ui';
import { paths } from '@/shared/config/paths';

/** Global top bar: logo, ⌘K search, lens switcher, notifications, account (§4.3). */
export function Topbar() {
  return (
    <header className="z-30 flex h-[60px] flex-none items-center gap-5 border-b border-border bg-base px-5">
      <Link to={paths.dashboard} className="flex w-[210px] flex-none items-center">
        <Logo size={26} />
      </Link>

      <SearchTrigger />

      <div className="flex-1" />

      <LensSwitcher />
      <LanguageSwitcher />
      <NotificationBell />
      <AccountMenu />
    </header>
  );
}
