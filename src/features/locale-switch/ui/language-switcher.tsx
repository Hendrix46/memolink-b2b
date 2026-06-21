import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Globe } from 'lucide-react';

import {
  LANGUAGE_LABELS,
  LANGUAGE_SHORT,
  SUPPORTED_LANGUAGES,
  type AppLanguage,
} from '@/shared/config/languages';
import { cn } from '@/shared/lib/cn';

/** Compact language switcher for the top bar. */
export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = (i18n.language.split('-')[0] as AppLanguage) || 'en';

  const pick = (lang: AppLanguage) => {
    void i18n.changeLanguage(lang);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Language"
        className="flex h-[38px] items-center gap-1.5 rounded-[10px] border border-border bg-surface px-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text"
      >
        <Globe size={15} />
        {LANGUAGE_SHORT[current] ?? 'EN'}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div role="menu" className="animate-in absolute right-0 top-[46px] z-40 w-[180px] rounded-[12px] border border-border bg-surface-raised p-1.5 shadow-[var(--shadow-pop)]">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const active = lang === current;
              return (
                <button
                  key={lang}
                  role="menuitem"
                  onClick={() => pick(lang)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[13.5px] transition-colors hover:bg-border',
                    active ? 'text-text' : 'text-text-secondary',
                  )}
                >
                  <span className="w-7 font-mono text-[11px] text-text-muted">{LANGUAGE_SHORT[lang]}</span>
                  <span className="flex-1">{LANGUAGE_LABELS[lang]}</span>
                  {active && <Check size={15} className="text-accent" strokeWidth={2.4} />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
