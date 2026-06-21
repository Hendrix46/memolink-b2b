import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

import { useCommandPalette } from '../model/store';

/** The top-bar search button that opens the command palette. */
export function SearchTrigger() {
  const { t } = useTranslation();
  const setOpen = useCommandPalette((s) => s.setOpen);
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex h-[38px] w-[340px] items-center gap-2.5 rounded-[10px] border border-border bg-surface px-3.5 text-left text-[13.5px] text-text-muted transition-colors hover:border-border-strong hover:bg-surface-raised"
    >
      <Search size={16} />
      <span className="flex-1">{t('topbar.searchPlaceholder')}</span>
      <span className="rounded-[5px] border border-border px-1.5 py-0.5 font-mono text-[11px] text-text-secondary">
        ⌘K
      </span>
    </button>
  );
}
