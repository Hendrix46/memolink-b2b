import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { coverGradient } from '@/shared/lib/visual';

interface AuthLayoutProps {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  /** Footer line under the form (e.g. "Don't have an account? Sign up"). */
  footer?: ReactNode;
}

/**
 * Split-screen auth shell: form on the left, a media-first brand panel on the
 * right (hidden on small screens). Reused by login / register / reset.
 */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const { t } = useTranslation();
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-base">
      {/* Form side */}
      <div className="flex w-full flex-col px-6 sm:px-10 lg:w-[46%] lg:px-16">
        <div className="flex items-center gap-2.5 pt-8">
          <span className="flex size-[30px] items-center justify-center rounded-[9px] bg-[linear-gradient(140deg,#6D5EF6,#9d7bff)] text-base font-bold text-white shadow-[0_4px_14px_rgba(109,94,246,0.4)]">
            M
          </span>
          <span className="text-base font-semibold tracking-[-0.02em]">Memolink</span>
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <div className="mx-auto w-full max-w-[380px] animate-in">
            <h1 className="text-[26px] font-semibold tracking-[-0.02em]">{title}</h1>
            <p className="mt-2 text-[14px] text-text-secondary">{subtitle}</p>
            <div className="mt-7">{children}</div>
            {footer && <div className="mt-6 text-center text-[13.5px] text-text-secondary">{footer}</div>}
          </div>
        </div>

        <p className="pb-6 text-center text-[11.5px] text-text-muted lg:text-left">
          {t('auth.copyright')}
        </p>
      </div>

      {/* Brand / media side */}
      <aside className="relative hidden flex-1 overflow-hidden border-l border-border lg:block">
        <div className="absolute inset-0 grid grid-cols-3 gap-2 p-2 opacity-90">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="rounded-2xl" style={{ background: coverGradient(`auth-${i}`) }} />
          ))}
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(11,11,15,0.86),rgba(11,11,15,0.55)_60%,rgba(11,11,15,0.78))]" />
        <div className="absolute inset-x-0 bottom-0 p-14">
          <blockquote className="max-w-md text-[22px] font-semibold leading-snug tracking-[-0.01em]">
            {t('auth.quote')}
          </blockquote>
          <div className="mt-4 flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-[linear-gradient(140deg,#E0A33E,#F0556E)] text-[12px] font-semibold text-white">
              DW
            </span>
            <div className="text-[13px]">
              <div className="font-medium">Dana Whitfield</div>
              <div className="text-text-muted">{t('auth.quoteRole')}</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
