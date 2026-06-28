import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  GraduationCap,
  Images,
  PartyPopper,
  Presentation,
  Rocket,
  Sparkles,
  Ticket,
  UserPlus,
  Users,
  Video,
} from 'lucide-react';
import type { ComponentType } from 'react';

import { useViewer } from '@/entities/session';
import { paths } from '@/shared/config/paths';

interface Template {
  key: string;
  icon: ComponentType<{ size?: number | string }>;
  accent: string;
}

const TEMPLATES: Template[] = [
  { key: 'conference', icon: Presentation, accent: 'var(--color-accent)' },
  { key: 'meetup', icon: Users, accent: 'var(--color-processing)' },
  { key: 'workshop', icon: GraduationCap, accent: 'var(--color-approved)' },
  { key: 'party', icon: PartyPopper, accent: 'var(--color-pending)' },
  { key: 'launch', icon: Rocket, accent: 'var(--color-rejected)' },
  { key: 'webinar', icon: Video, accent: 'var(--color-accent-soft)' },
];

interface Feature {
  key: string;
  icon: ComponentType<{ size?: number | string }>;
  color: string;
  tint: string;
}

const FEATURES: Feature[] = [
  { key: 'invite', icon: UserPlus, color: 'var(--color-processing)', tint: 'rgba(74,168,255,0.14)' },
  { key: 'tickets', icon: Ticket, color: 'var(--color-approved)', tint: 'rgba(61,214,140,0.14)' },
  { key: 'galleries', icon: Images, color: 'var(--color-accent-soft)', tint: 'rgba(157,123,255,0.14)' },
];

/** First-run onboarding for an empty workspace (activation). */
export function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const viewer = useViewer();
  const create = () => navigate(paths.eventNew);

  return (
    <div className="animate-in mx-auto max-w-[940px] px-[34px] pb-20 pt-[54px]">
      <div className="mb-10 flex flex-col items-center text-center">
        <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,#6D5EF6,#9d7bff)] shadow-[0_12px_34px_rgba(109,94,246,0.45)]">
          <Camera size={27} className="text-white" strokeWidth={1.8} />
        </span>
        <h1 className="text-[30px] font-semibold tracking-[-0.025em]">
          {t('onboarding.welcome', { name: viewer.name.split(' ')[0] })}
        </h1>
        <p className="mx-auto mb-6 mt-2.5 max-w-[480px] text-[15px] leading-relaxed text-text-secondary">
          {t('onboarding.heroSubtitle')}
        </p>
        <button
          onClick={create}
          className="flex h-[46px] items-center gap-2.5 rounded-[12px] bg-accent px-[22px] text-[14.5px] font-semibold text-white shadow-[0_8px_24px_rgba(109,94,246,0.4)] transition-colors hover:bg-accent-hover"
        >
          <Sparkles size={18} />
          {t('onboarding.createWithAi')}
        </button>
      </div>

      <div className="mb-3.5 text-[13px] font-medium text-text-muted">{t('onboarding.orTemplate')}</div>
      <div className="mb-9 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((tpl) => {
          const Icon = tpl.icon;
          return (
            <button
              key={tpl.key}
              onClick={create}
              className="rounded-[14px] border border-border bg-surface p-4 text-left transition-colors hover:border-border-strong"
            >
              <span
                className="mb-3 flex size-9 items-center justify-center rounded-[10px]"
                style={{ background: `color-mix(in srgb, ${tpl.accent} 14%, transparent)`, color: tpl.accent }}
              >
                <Icon size={19} />
              </span>
              <div className="mb-0.5 text-[14.5px] font-semibold">{t(`onboarding.templates.${tpl.key}.label`)}</div>
              <div className="text-[12.5px] text-text-muted">{t(`onboarding.templates.${tpl.key}.desc`)}</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.key}
              className="flex items-start gap-3 rounded-[14px] border border-hairline bg-sidebar px-[18px] py-4"
            >
              <span
                className="flex size-8 flex-none items-center justify-center rounded-[9px]"
                style={{ background: f.tint, color: f.color }}
              >
                <Icon size={16} />
              </span>
              <div>
                <div className="mb-0.5 text-[13.5px] font-semibold">{t(`onboarding.features.${f.key}.title`)}</div>
                <div className="text-[12px] leading-relaxed text-text-muted">
                  {t(`onboarding.features.${f.key}.desc`)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
