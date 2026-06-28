import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Loader2, Sparkles } from 'lucide-react';

import { cn } from '@/shared/lib/cn';

const STEPS = ['understand', 'agenda', 'cover', 'registration'] as const;
const STEP_MS = 700;

/**
 * Phase 2 — the AI "builds" the event with a streaming step list (spec 04 §1
 * Phase 2). Purely visual: the parent leaves this phase when the real
 * `POST /api/event/ai/draft` call resolves, so the last step keeps spinning
 * until then rather than auto-advancing.
 */
export function PhaseGenerating({ prompt }: { prompt: string }) {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (active >= STEPS.length - 1) return;
    const tick = setTimeout(() => setActive((i) => i + 1), STEP_MS);
    return () => clearTimeout(tick);
  }, [active]);

  return (
    <div className="mx-auto flex max-w-[500px] flex-col items-center px-6 py-10 text-center">
      <span className="animate-pulse-dot mb-5 flex size-[60px] items-center justify-center rounded-[18px] bg-[linear-gradient(140deg,#6D5EF6,#9d7bff)] shadow-[0_12px_36px_rgba(109,94,246,0.5)]">
        <Sparkles size={28} className="text-white" />
      </span>
      <h2 className="text-[21px] font-semibold">{t('create.generating.title')}</h2>
      {prompt && (
        <p className="mx-auto mt-2 max-w-[400px] text-[13.5px] italic text-text-muted">“{prompt}”</p>
      )}

      <div className="mt-6 w-full rounded-[14px] border border-border bg-surface p-2 text-left">
        {STEPS.map((step, i) => {
          const done = i < active;
          const isActive = i === active;
          return (
            <div key={step} className="flex items-center gap-3.5 px-3.5 py-3">
              <span className="flex size-[18px] flex-none items-center justify-center">
                {done ? (
                  <Check size={14} className="text-approved" strokeWidth={3} />
                ) : isActive ? (
                  <Loader2 size={15} className="animate-[ml-spin_0.8s_linear_infinite] text-accent-soft" />
                ) : (
                  <span className="size-1.5 rounded-full bg-border-strong" />
                )}
              </span>
              <span
                className={cn(
                  'text-[13.5px]',
                  done ? 'text-text-secondary' : isActive ? 'font-medium text-text' : 'text-text-muted',
                )}
              >
                {t(`create.generating.steps.${step}`)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
