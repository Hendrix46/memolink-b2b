import { useTranslation } from 'react-i18next';
import { Plus, Ticket, Trash2 } from 'lucide-react';

import { Button, Input } from '@/shared/ui';
import { useEventDraftStore } from '../model/event-draft-store';

/** Dynamic ticket-tier builder — add/remove priced tiers. */
export function TicketEditor() {
  const { t } = useTranslation();
  const tiers = useEventDraftStore((s) => s.draft.ticketTiers);
  const addTier = useEventDraftStore((s) => s.addTier);
  const updateTier = useEventDraftStore((s) => s.updateTier);
  const removeTier = useEventDraftStore((s) => s.removeTier);

  return (
    <div className="space-y-3">
      {tiers.length === 0 && (
        <div className="flex flex-col items-center rounded-[12px] border border-dashed border-border px-6 py-10 text-center">
          <Ticket size={22} className="mb-2 text-text-muted" />
          <p className="text-[13.5px] text-text-secondary">{t('builder.ticketsStep.noTiers')}</p>
        </div>
      )}

      {tiers.map((tier, i) => (
        <div key={tier.id} className="rounded-[12px] border border-border bg-surface p-3.5">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[12px] text-text-muted">{t('builder.ticketsStep.tier', { num: i + 1 })}</span>
            <button
              type="button"
              aria-label={t('common.remove')}
              onClick={() => removeTier(tier.id)}
              className="flex size-7 items-center justify-center rounded-md text-text-muted hover:bg-surface-hover hover:text-rejected"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-[2fr_1fr_1fr]">
            <Input
              placeholder={t('builder.ticketsStep.namePh')}
              value={tier.name}
              onChange={(e) => updateTier(tier.id, { name: e.target.value })}
            />
            <Input
              type="number"
              min={0}
              placeholder={t('builder.ticketsStep.pricePh')}
              value={tier.price || ''}
              onChange={(e) => updateTier(tier.id, { price: Number(e.target.value) })}
            />
            <Input
              type="number"
              min={0}
              placeholder={t('builder.ticketsStep.qtyPh')}
              value={tier.quantity || ''}
              onChange={(e) => updateTier(tier.id, { quantity: Number(e.target.value) })}
            />
          </div>
          <Input
            className="mt-2.5"
            placeholder={t('builder.ticketsStep.perksPh')}
            value={tier.perks}
            onChange={(e) => updateTier(tier.id, { perks: e.target.value })}
          />
        </div>
      ))}

      <Button variant="secondary" leadingIcon={<Plus size={15} />} onClick={addTier}>
        {t('builder.ticketsStep.addTier')}
      </Button>
    </div>
  );
}
