import { useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

import { useEventDraftStore } from '../model/event-draft-store';

/** Free-form tag editor — type and press Enter to add, click × to remove. */
export function TagInput() {
  const { t } = useTranslation();
  const tags = useEventDraftStore((s) => s.draft.tags);
  const addTag = useEventDraftStore((s) => s.addTag);
  const removeTag = useEventDraftStore((s) => s.removeTag);
  const [value, setValue] = useState('');

  const commit = () => {
    addTag(value);
    setValue('');
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && !value && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[10px] border border-border bg-surface px-3 py-2 focus-within:border-accent">
      {tags.map((tag) => (
        <span key={tag} className="flex items-center gap-1.5 rounded-md bg-surface-raised px-2 py-1 text-[12.5px] font-medium">
          {tag}
          <button type="button" aria-label={tag} onClick={() => removeTag(tag)} className="text-text-muted hover:text-text">
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKey}
        onBlur={commit}
        placeholder={tags.length ? '' : t('builder.basics.tagsPh')}
        className="min-w-[120px] flex-1 bg-transparent py-0.5 text-[13.5px] outline-none placeholder:text-text-muted"
      />
    </div>
  );
}
