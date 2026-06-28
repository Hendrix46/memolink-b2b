import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

import { EventPreview, useEventDraftStore, type EventDraft } from '@/features/event-builder';
import { useCreateEvent } from '@/features/event-create-ai';
import { useActiveOrgId } from '@/entities/session';
import { ApiError } from '@/shared/api';
import { cn } from '@/shared/lib/cn';
import { Button, Card, toast } from '@/shared/ui';
import { paths } from '@/shared/config/paths';
import { BasicsStep } from './steps/basics-step';
import { ModulesStep } from './steps/modules-step';
import { BrandingStep } from './steps/branding-step';
import { RegistrationStep } from './steps/registration-step';
import { AgendaStep } from './steps/agenda-step';
import { AccessStep } from './steps/access-step';
import { ReviewStep } from './steps/review-step';

interface StepDef {
  id: string;
  labelKey: string;
  render: ReactNode;
  /** Shown only when this predicate passes — makes the wizard dynamic. */
  when?: (d: EventDraft) => boolean;
}

const STEPS: StepDef[] = [
  { id: 'basics', labelKey: 'builder.steps.basics', render: <BasicsStep /> },
  { id: 'modules', labelKey: 'builder.steps.capabilities', render: <ModulesStep /> },
  { id: 'branding', labelKey: 'builder.steps.branding', render: <BrandingStep /> },
  { id: 'registration', labelKey: 'builder.steps.registration', render: <RegistrationStep />, when: (d) => d.modules.registrations },
  { id: 'agenda', labelKey: 'builder.steps.agenda', render: <AgendaStep />, when: (d) => d.modules.agenda },
  { id: 'access', labelKey: 'builder.steps.access', render: <AccessStep /> },
  { id: 'review', labelKey: 'builder.steps.review', render: <ReviewStep /> },
];

/** The manual, fully-customizable event wizard — reached via "start from blank". */
export function EventWizard({ onBackToAi }: { onBackToAi?: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const draft = useEventDraftStore((s) => s.draft);
  const reset = useEventDraftStore((s) => s.reset);
  const orgId = useActiveOrgId() ?? '';
  const createEvent = useCreateEvent();

  const [currentId, setCurrentId] = useState('basics');

  const activeSteps = useMemo(() => STEPS.filter((s) => !s.when || s.when(draft)), [draft]);

  const index = Math.max(0, activeSteps.findIndex((s) => s.id === currentId));
  const current = activeSteps[index] ?? activeSteps[0];
  useEffect(() => {
    if (current && current.id !== currentId) setCurrentId(current.id);
  }, [current, currentId]);

  const isFirst = index === 0;
  const isLast = index === activeSteps.length - 1;
  const canContinue = current.id !== 'basics' || draft.name.trim().length > 0;

  const goTo = (i: number) => setCurrentId(activeSteps[i].id);

  const create = () => {
    if (createEvent.isPending) return;
    createEvent.mutate(
      { draft, orgId },
      {
        onSuccess: (eventId) => {
          toast.success(t('builder.createdToast', { name: draft.name || t('builder.preview.untitled') }));
          reset();
          navigate(paths.event(eventId));
        },
        onError: (err) => {
          if (err instanceof ApiError && (err.isConflict || err.isValidation)) {
            toast.error(err.errors?.[0] ?? err.message);
            return;
          }
          toast.error(err instanceof ApiError ? err.message : t('create.createFailed'));
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-[1340px] px-[34px] pb-16 pt-7">
      <button
        onClick={onBackToAi ?? (() => navigate(paths.events))}
        className="mb-4 flex items-center gap-1.5 text-[12.5px] text-text-secondary transition-colors hover:text-text"
      >
        {onBackToAi ? <Sparkles size={14} /> : <ChevronLeft size={14} />}
        {onBackToAi ? t('create.backToAi') : t('nav.events')}
      </button>
      <h1 className="text-[26px] font-semibold tracking-[-0.02em]">{t('builder.createEvent')}</h1>
      <p className="mt-1.5 text-sm text-text-secondary">{t('builder.subtitle')}</p>

      <div className="mt-7 grid grid-cols-1 gap-7 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-6 flex items-center gap-1 overflow-x-auto pb-1">
            {activeSteps.map((step, i) => {
              const done = i < index;
              const active = i === index;
              return (
                <div key={step.id} className="flex flex-none items-center">
                  <button onClick={() => goTo(i)} className="flex items-center gap-2">
                    <span
                      className={cn(
                        'flex size-7 flex-none items-center justify-center rounded-full text-[12px] font-semibold transition-colors',
                        done && 'bg-accent text-white',
                        active && 'border-2 border-accent text-accent',
                        !done && !active && 'border border-border text-text-muted',
                      )}
                    >
                      {done ? <Check size={14} strokeWidth={3} /> : i + 1}
                    </span>
                    <span className={cn('whitespace-nowrap text-[13px] font-medium', active ? 'text-text' : 'text-text-muted')}>
                      {t(step.labelKey)}
                    </span>
                  </button>
                  {i < activeSteps.length - 1 && <span className={cn('mx-2.5 h-px w-6 flex-none', done ? 'bg-accent' : 'bg-border')} />}
                </div>
              );
            })}
          </div>

          <Card className="animate-in">{current.render}</Card>

          <div className="mt-5 flex justify-between">
            <Button variant="ghost" disabled={isFirst} onClick={() => goTo(index - 1)}>
              {t('common.back')}
            </Button>
            {isLast ? (
              <Button variant="primary" onClick={create} disabled={!draft.name.trim() || createEvent.isPending}>
                {createEvent.isPending ? t('create.creating') : t('builder.review.createEvent')}
              </Button>
            ) : (
              <Button variant="primary" trailingIcon={<ChevronRight size={16} />} disabled={!canContinue} onClick={() => goTo(index + 1)}>
                {t('common.continue')}
              </Button>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <EventPreview />
          <p className="mt-3 px-1 text-center text-[11.5px] text-text-muted">{t('builder.updatesLive')}</p>
        </aside>
      </div>
    </div>
  );
}
