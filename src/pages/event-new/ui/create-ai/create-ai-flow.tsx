import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  draftResponseToStore,
  useCreateAndApply,
  useGenerateDraft,
  type DraftLocation,
} from '@/features/event-create-ai';
import { useEventDraftStore } from '@/features/event-builder';
import { useActiveOrgId } from '@/entities/session';
import { ApiError } from '@/shared/api';
import { toast } from '@/shared/ui';
import { paths } from '@/shared/config/paths';
import { PhasePrompt } from './phase-prompt';
import { PhaseGenerating } from './phase-generating';
import { PhaseCompose } from './phase-compose';

type Phase = 'prompt' | 'generating' | 'compose';

const SUPPORTED_LOCALES = ['uz', 'ru', 'en'];

/**
 * Create-event-with-AI flow (spec 04 §1, changelog §4). Three phases —
 * prompt → generating → compose — wired to the live AI draft endpoints. The
 * compose phase edits the shared event draft, so the live preview and the
 * existing wizard reuse the same source of truth.
 */
export function CreateAiFlow({ onBlank }: { onBlank: () => void }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const patch = useEventDraftStore((s) => s.patch);
  const reset = useEventDraftStore((s) => s.reset);
  const draft = useEventDraftStore((s) => s.draft);
  const orgId = useActiveOrgId() ?? '';

  const generate = useGenerateDraft();
  const createAndApply = useCreateAndApply();

  const [phase, setPhase] = useState<Phase>('prompt');
  const [prompt, setPrompt] = useState('');
  /** Precise lat/long from the AI draft, reused on create. */
  const aiLocation = useRef<DraftLocation | undefined>(undefined);

  const locale = SUPPORTED_LOCALES.includes(i18n.language) ? i18n.language : undefined;

  const cancel = () => {
    reset();
    navigate(paths.events);
  };

  const startBlank = () => {
    reset();
    onBlank();
  };

  const runGenerate = () => {
    if (!prompt.trim() || generate.isPending) return;
    setPhase('generating');
    generate.mutate(
      { prompt: prompt.trim(), locale },
      {
        onSuccess: (res) => {
          patch(draftResponseToStore(res));
          aiLocation.current = res.location;
          setPhase('compose');
        },
        onError: (err) => {
          if (err instanceof ApiError && err.isRateLimited) {
            toast.error(t('create.aiRateLimited', { seconds: err.retryAfter ?? 60 }));
            setPhase('prompt');
            return;
          }
          if (err instanceof ApiError && err.status === 503) {
            toast.info(t('create.aiDisabled'));
            startBlank();
            return;
          }
          toast.error(err instanceof ApiError ? err.message : t('create.generateFailed'));
          setPhase('prompt');
        },
      },
    );
  };

  const create = () => {
    if (createAndApply.isPending) return;
    createAndApply.mutate(
      { draft, orgId, aiLocation: aiLocation.current },
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

  if (phase === 'generating') {
    return <PhaseGenerating prompt={prompt} />;
  }

  if (phase === 'compose') {
    return (
      <PhaseCompose
        onBack={() => setPhase('prompt')}
        onCancel={cancel}
        onCreate={create}
        creating={createAndApply.isPending}
      />
    );
  }

  return (
    <PhasePrompt
      value={prompt}
      onChange={setPrompt}
      onGenerate={runGenerate}
      onBlank={startBlank}
      onCancel={cancel}
    />
  );
}
