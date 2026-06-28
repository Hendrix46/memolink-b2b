import { useEffect, useState } from 'react';

import { useEventDraftStore } from '@/features/event-builder';
import { CreateAiFlow } from './create-ai/create-ai-flow';
import { EventWizard } from './event-wizard';

/**
 * Event creation entry point. The AI flow is the default path (spec 04 §1);
 * "start from blank" drops into the manual, fully-customizable wizard. Both
 * share the one event draft, which is reset when leaving the page.
 */
export function EventNewPage() {
  const [mode, setMode] = useState<'ai' | 'wizard'>('ai');
  const reset = useEventDraftStore((s) => s.reset);

  useEffect(() => reset, [reset]);

  if (mode === 'wizard') {
    return <EventWizard onBackToAi={() => setMode('ai')} />;
  }
  return <CreateAiFlow onBlank={() => setMode('wizard')} />;
}
