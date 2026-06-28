import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, Settings } from 'lucide-react';

import { useViewer } from '@/entities/session';
import { initials } from '@/shared/lib/format';
import { paths } from '@/shared/config/paths';
import { useSignOut } from '../model/use-auth';

/** Account avatar + dropdown (profile, settings, sign out) for the top bar. */
export function AccountMenu() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const viewer = useViewer();
  const navigate = useNavigate();
  const signOut = useSignOut();

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex size-[34px] items-center justify-center rounded-full text-[13px] font-semibold text-white"
        style={{ background: 'linear-gradient(140deg,#E0A33E,#F0556E)' }}
        title={viewer.name}
        aria-label={`Account: ${viewer.name}`}
      >
        {initials(viewer.name)}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="animate-in absolute right-0 top-[46px] z-40 w-[248px] overflow-hidden rounded-[12px] border border-border bg-surface-raised p-1.5 shadow-[var(--shadow-pop)]"
          >
            <div className="flex items-center gap-3 px-2.5 py-2.5">
              <span
                className="flex size-9 flex-none items-center justify-center rounded-full text-[13px] font-semibold text-white"
                style={{ background: 'linear-gradient(140deg,#E0A33E,#F0556E)' }}
              >
                {initials(viewer.name)}
              </span>
              <div className="min-w-0">
                <div className="truncate text-[13.5px] font-medium">{viewer.name}</div>
                <div className="truncate font-mono text-[11.5px] text-text-muted">{viewer.email || viewer.phoneNumber}</div>
              </div>
            </div>

            <div className="my-1 h-px bg-border" />

            <MenuItem icon={<Settings size={16} />} label={t('account.settings')} onClick={() => go(paths.settings)} />

            <div className="my-1 h-px bg-border" />

            <MenuItem icon={<LogOut size={16} />} label={t('account.signOut')} danger onClick={signOut} />
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[13.5px] transition-colors hover:bg-border ${
        danger ? 'text-rejected' : 'text-text'
      }`}
    >
      <span className={danger ? 'text-rejected' : 'text-text-secondary'}>{icon}</span>
      {label}
    </button>
  );
}
