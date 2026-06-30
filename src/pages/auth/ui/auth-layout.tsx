import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Images, LineChart, Send, Sparkles } from 'lucide-react';

import { coverGradient } from '@/shared/lib/visual';
import { cn } from '@/shared/lib/cn';
import { Logo } from '@/shared/ui';

interface AuthLayoutProps {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  /** Footer line under the form (e.g. "Don't have an account? Sign up"). */
  footer?: ReactNode;
}

/** Demo "memory capsules" shown in the brand panel — echoes the memolink.io MEM·001 motif. */
type CapsuleStatus = 'delivered' | 'live' | 'curating';
const CAPSULES: { id: string; seed: string; title: string; date: string; photos: string; status: CapsuleStatus }[] = [
  { id: '001', seed: 'aurora-summit', title: 'Aurora Tech Summit', date: 'Jun 18', photos: '2,481', status: 'delivered' },
  { id: '002', seed: 'nova-launch', title: 'Nova Product Launch', date: 'Jul 02', photos: '1,067', status: 'live' },
  { id: '003', seed: 'halcyon-wed', title: 'Halcyon Wedding', date: 'Aug 24', photos: '894', status: 'curating' },
];

const STATUS_STYLE: Record<CapsuleStatus, string> = {
  delivered: 'text-[#b3fc6a] bg-[rgba(179,252,106,0.12)] border-[rgba(179,252,106,0.28)]',
  live: 'text-accent-soft bg-[rgba(102,112,255,0.16)] border-[rgba(102,112,255,0.32)]',
  curating: 'text-pending bg-[rgba(224,163,62,0.14)] border-[rgba(224,163,62,0.3)]',
};

/* Float geometry per card — staggered rotation/offset for a parallax stack. */
const CARD_LAYOUT = [
  { top: 6, left: 4, rotate: -7, z: 10, floatDelay: '0s', floatDur: '6.5s', riseDelay: '0.15s' },
  { top: 96, left: 70, rotate: 4, z: 30, floatDelay: '0.8s', floatDur: '7.2s', riseDelay: '0.28s' },
  { top: 196, left: 24, rotate: 9, z: 20, floatDelay: '1.6s', floatDur: '6.8s', riseDelay: '0.41s' },
];

/**
 * Split-screen auth shell: form on the left, an atmospheric brand panel on the
 * right (hidden on small screens). The panel showcases the product as a softly
 * floating stack of "memory capsules" over an aurora of the brand indigo + neon.
 * Reused by login / register / reset.
 */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const { t } = useTranslation();
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-base">
      {/* Form side */}
      <div className="flex w-full flex-col px-6 sm:px-10 lg:w-[46%] lg:px-16">
        <div className="pt-8">
          <Logo size={28} />
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <div className="mx-auto w-full max-w-[380px] animate-in">
            <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-text">{title}</h1>
            <p className="mt-2 text-[14px] text-text-secondary">{subtitle}</p>
            <div className="mt-7">{children}</div>
            {footer && <div className="mt-6 text-center text-[13.5px] text-text-secondary">{footer}</div>}
          </div>
        </div>

        <p className="pb-6 text-center text-[11.5px] text-text-muted lg:text-left">{t('auth.copyright')}</p>
      </div>

      {/* Brand panel */}
      <aside className="relative hidden flex-1 overflow-hidden border-l border-border bg-base lg:block">
        <BrandBackdrop />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-14">
          {/* Kicker */}
          <div className="auth-rise flex items-center gap-2.5" style={{ animationDelay: '0s' }}>
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#b3fc6a] opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-[#b3fc6a]" />
            </span>
            <span className="text-[12.5px] font-medium uppercase tracking-[0.14em] text-text-secondary">
              {t('auth.panel.kicker')}
            </span>
          </div>

          {/* Headline + floating capsule stack */}
          <div className="flex flex-col gap-10">
            <h2 className="auth-rise max-w-[440px] text-[clamp(34px,3.6vw,46px)] font-bold leading-[1.04] tracking-[-0.03em] text-text" style={{ animationDelay: '0.08s' }}>
              {t('auth.panel.headlineTop')}{' '}
              <span className="bg-[linear-gradient(100deg,#8387ff,#b3fc6a)] bg-clip-text text-transparent">
                {t('auth.panel.headlineAccent')}
              </span>
            </h2>

            <div className="relative mx-auto h-[320px] w-[300px]">
              {CAPSULES.map((c, i) => {
                const L = CARD_LAYOUT[i];
                return (
                  // Three layers so transforms don't collide: entrance (auth-rise),
                  // a static rotation, then the continuous float.
                  <div
                    key={c.id}
                    className="auth-rise absolute w-[244px]"
                    style={{ top: L.top, left: L.left, zIndex: L.z, animationDelay: L.riseDelay }}
                  >
                    <div style={{ transform: `rotate(${L.rotate}deg)` }}>
                      <div className="auth-float" style={{ animationDelay: L.floatDelay, animationDuration: L.floatDur }}>
                        <CapsuleCard capsule={c} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feature pills */}
          <div className="auth-rise flex flex-wrap items-center gap-2.5" style={{ animationDelay: '0.55s' }}>
            <Pill icon={<Sparkles size={13} />}>{t('auth.panel.pillCurate')}</Pill>
            <Pill icon={<Send size={13} />}>{t('auth.panel.pillDeliver')}</Pill>
            <Pill icon={<LineChart size={13} />}>{t('auth.panel.pillMeasure')}</Pill>
          </div>
        </div>
      </aside>
    </div>
  );
}

/** Layered aurora + dot-grid + grain — depth without any binary assets. */
function BrandBackdrop() {
  return (
    <>
      <div
        className="auth-aurora absolute -right-1/4 -top-1/4 size-[70%] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(102,112,255,0.34), transparent 70%)' }}
      />
      <div
        className="auth-aurora absolute -bottom-1/4 -left-1/4 size-[60%] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(179,252,106,0.12), transparent 70%)', animationDelay: '4s' }}
      />
      {/* Dot grid, faded toward the edges */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, #000 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, #000 30%, transparent 75%)',
        }}
      />
      {/* Subtle film grain */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </>
  );
}

function CapsuleCard({ capsule: c }: { capsule: (typeof CAPSULES)[number] }) {
  const { t } = useTranslation();
  return (
    <div className="overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.045] p-2.5 shadow-[0_28px_60px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl">
      <div className="relative h-[74px] overflow-hidden rounded-[12px]" style={{ background: coverGradient(c.seed) }}>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.35))]" />
        <span className="absolute left-2.5 top-2.5 rounded-md bg-black/30 px-1.5 py-0.5 font-mono text-[9.5px] font-medium tracking-wider text-white/90 backdrop-blur-sm">
          MEM · {c.id}
        </span>
        <span
          className={cn(
            'absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9.5px] font-semibold',
            STATUS_STYLE[c.status],
          )}
        >
          {c.status === 'live' && <span className="size-1.5 animate-pulse rounded-full bg-current" />}
          {t(`auth.panel.status.${c.status}`)}
        </span>
      </div>
      <div className="px-1 pb-0.5 pt-2.5">
        <div className="truncate text-[13.5px] font-semibold text-text">{c.title}</div>
        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-text-muted">
          <span className="flex items-center gap-1">
            <Calendar size={11} /> {c.date}
          </span>
          <span className="flex items-center gap-1">
            <Images size={11} /> {c.photos}
          </span>
        </div>
      </div>
    </div>
  );
}

function Pill({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12.5px] font-medium text-text-secondary backdrop-blur-sm">
      <span className="text-accent-soft">{icon}</span>
      {children}
    </span>
  );
}
