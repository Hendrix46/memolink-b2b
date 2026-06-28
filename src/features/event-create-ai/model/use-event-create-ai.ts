import { useMutation, useQueryClient } from '@tanstack/react-query';

import { eventApi } from '@/entities/event';
import { brandingApi } from '@/entities/branding';
import type { EventDraft } from '@/features/event-builder';
import { queryKeys } from '@/shared/config/query-keys';
import { aiDraftApi, type DraftLocation, type EventDraftResponse } from '../api/ai-draft.api';
import { buildApplyBody, buildCreatePayload, normalizeAccent } from '../lib/draft-mapping';

/** Generate a non-persisted AI draft from a prompt. */
export function useGenerateDraft() {
  return useMutation<EventDraftResponse, unknown, { prompt: string; locale?: string }>({
    mutationFn: ({ prompt, locale }) => aiDraftApi.generate(prompt, locale),
  });
}

interface CreateArgs {
  draft: EventDraft;
  orgId: string | undefined;
  aiLocation?: DraftLocation;
}

/** Upload the selected cover as the event poster — best-effort after create. */
async function uploadCover(eventId: string, draft: EventDraft): Promise<void> {
  if (!draft.coverFile) return;
  try {
    await eventApi.uploadPoster(eventId, draft.coverFile);
  } catch {
    // The event is created; a failed cover upload shouldn't block the flow.
  }
}

/** Persist the chosen accent (theme) to event branding — best-effort. */
async function applyAccent(eventId: string, draft: EventDraft): Promise<void> {
  const accentColor = normalizeAccent(draft.accent);
  if (!accentColor) return;
  try {
    await brandingApi.updateEvent(eventId, { accentColor });
  } catch {
    // Branding is non-critical; the event is already created.
  }
}

/**
 * Create an event from the draft, then apply the structured agenda + accent
 * (AI path). Resolves to the new `eventId`. Apply failures are swallowed after
 * a successful create so the user still lands on a real event.
 */
export function useCreateAndApply() {
  const qc = useQueryClient();
  return useMutation<string, unknown, CreateArgs>({
    mutationFn: async ({ draft, orgId, aiLocation }) => {
      const created = await eventApi.create(buildCreatePayload(draft, orgId, aiLocation));
      await uploadCover(created.eventId, draft);
      const apply = buildApplyBody(draft);
      if (apply) {
        try {
          await aiDraftApi.apply(created.eventId, apply);
        } catch {
          // Agenda/accent apply is best-effort; the event itself was created.
        }
      }
      return created.eventId;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events.all }),
  });
}

/** Create an event from the draft (manual wizard, no apply step). */
export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation<string, unknown, CreateArgs>({
    mutationFn: async ({ draft, orgId, aiLocation }) => {
      const created = await eventApi.create(buildCreatePayload(draft, orgId, aiLocation));
      await uploadCover(created.eventId, draft);
      await applyAccent(created.eventId, draft);
      return created.eventId;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.events.all }),
  });
}
