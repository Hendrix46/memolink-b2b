import { useTranslation } from 'react-i18next';
import { Building2 } from 'lucide-react';

import { CreateOrgForm } from './create-org-form';

/**
 * First-run gate shown when the account has no organization yet. Creating one
 * (`POST /api/org`) auto-admits the caller as ADMIN and unlocks the dashboard.
 */
export function OrgOnboarding() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <div className="w-full max-w-[440px] rounded-[var(--radius-card)] border border-border bg-surface-raised p-8 shadow-[var(--shadow-pop)]">
        <span className="mb-5 flex size-12 items-center justify-center rounded-[12px] bg-[rgba(109,94,246,0.14)] text-accent-soft">
          <Building2 size={22} />
        </span>
        <h1 className="text-[19px] font-semibold tracking-[-0.01em]">{t('orgCreate.onboardingTitle')}</h1>
        <p className="mb-6 mt-1.5 text-[13.5px] leading-relaxed text-text-secondary">
          {t('orgCreate.onboardingSubtitle')}
        </p>
        <CreateOrgForm autoFocus />
      </div>
    </div>
  );
}
