import { useRef, useState } from 'react';
import { Loader2, Search } from 'lucide-react';

import { Avatar, Popover } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';
import { useDebouncedValue } from '@/shared/lib/use-debounced-value';
import { useUserSearch } from '../model/use-user-search';
import type { UserOption } from '../model/types';

export interface UserPickerProps {
  /** Called with the chosen directory user. The picker clears itself after. */
  onSelect: (user: UserOption) => void;
  placeholder: string;
  /** Shown while a search request is in flight. */
  searchingLabel: string;
  /** Shown when a non-empty query returns nobody. */
  emptyLabel: string;
  /** User ids to hide from results (already added). */
  excludeIds?: string[];
  autoFocus?: boolean;
  disabled?: boolean;
}

/**
 * Directory-backed user search combobox. Debounces the query, lists matching
 * users with avatars, and emits the selected `UserOption`. Reused for assigning
 * speakers to sessions and inviting co-hosts. The results dropdown renders in a
 * portal (Popover) so it is never clipped inside a dialog. Lives in the user
 * entity so any higher layer can pick a real `userId` without re-implementing search.
 */
export function UserPicker({
  onSelect,
  placeholder,
  searchingLabel,
  emptyLabel,
  excludeIds = [],
  autoFocus,
  disabled,
}: UserPickerProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const debounced = useDebouncedValue(query, 300);
  const anchorRef = useRef<HTMLDivElement>(null);

  const { data, isFetching } = useUserSearch(debounced, open && !disabled);
  const results = (data ?? []).filter((u) => !excludeIds.includes(u.userId));

  const choose = (user: UserOption) => {
    onSelect(user);
    setQuery('');
    setOpen(false);
  };

  const trimmed = debounced.trim();

  return (
    <>
      <div
        ref={anchorRef}
        className={cn(
          'flex h-[38px] items-center gap-2.5 rounded-[10px] border bg-surface px-3.5 transition-colors',
          'focus-within:border-accent',
          disabled ? 'border-border opacity-60' : 'border-border hover:border-border-strong',
        )}
      >
        <span className="flex-none text-text-muted">
          {isFetching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
        </span>
        <input
          value={query}
          disabled={disabled}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full bg-transparent text-[13.5px] text-text outline-none placeholder:text-text-muted disabled:cursor-not-allowed"
        />
      </div>

      <Popover
        anchorRef={anchorRef}
        open={open && !disabled}
        onClose={() => setOpen(false)}
        matchWidth
        className="max-h-[244px] overflow-auto rounded-[11px] border border-border bg-surface-raised p-1 shadow-[var(--shadow-pop)]"
      >
        {isFetching && results.length === 0 ? (
          <div className="flex items-center gap-2 px-3 py-2.5 text-[12.5px] text-text-muted">
            <Loader2 size={14} className="animate-spin" />
            {searchingLabel}
          </div>
        ) : results.length === 0 ? (
          <div className="px-3 py-2.5 text-[12.5px] text-text-muted">{trimmed ? emptyLabel : searchingLabel}</div>
        ) : (
          results.map((u) => (
            <button
              key={u.userId}
              type="button"
              onClick={() => choose(u)}
              className="flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left transition-colors hover:bg-[rgba(255,255,255,0.04)]"
            >
              <Avatar name={u.name} size={28} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium">{u.name}</span>
                <span className="block truncate font-mono text-[11px] text-text-muted">{u.userId}</span>
              </span>
            </button>
          ))
        )}
      </Popover>
    </>
  );
}
