import { Link } from 'react-router-dom';

import { AccountMenu } from '@/features/auth';
import { SearchTrigger } from '@/features/command-palette';
import { LanguageSwitcher } from '@/features/locale-switch';
import { NotificationBell } from '@/features/notifications';
import { paths } from '@/shared/config/paths';

/** Global top bar: logo, ⌘K search, lens switcher, notifications, account (§4.3). */
export function Topbar() {
  return (
    <header className="z-30 flex h-[60px] flex-none items-center gap-5 border-b border-border bg-base px-5">
      <Link to={paths.dashboard} className="flex w-[210px] flex-none items-center gap-2.5">
        <span className="flex size-[30px] items-center justify-center rounded-[9px] bg-[linear-gradient(140deg,#6D5EF6,#9d7bff)] text-base font-bold text-white shadow-[0_4px_14px_rgba(109,94,246,0.4)]">
          M
        </span>
        <span className="text-base font-semibold tracking-[-0.02em]">Memolink</span>
      </Link>

      <SearchTrigger />

      <div className="flex-1" />

      <LanguageSwitcher />
      <NotificationBell />
      <AccountMenu />
    </header>
  );
}
