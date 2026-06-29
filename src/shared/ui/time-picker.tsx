import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import { Popover } from './popover';

export interface TimePickerProps {
  /** 'HH:mm'. */
  value: string;
  onChange: (value: string) => void;
  /** Minute granularity for the option list. */
  step?: number;
  className?: string;
}

/** Time picker with a scrollable list of options, themed to the dark UI. */
export function TimePicker({ value, onChange, step = 15, className }: TimePickerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const options = useMemo(() => {
    const out: string[] = [];
    for (let m = 0; m < 24 * 60; m += step) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      out.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
    }
    return out;
  }, [step]);

  return (
    <div className={cn('relative', className)}>
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-[38px] w-full items-center gap-2.5 rounded-[10px] border border-border bg-surface px-3.5 text-left text-[13.5px] transition-colors',
          'hover:border-border-strong focus:border-accent',
          value ? 'text-text' : 'text-text-muted',
        )}
      >
        <Clock size={15} className="flex-none text-text-muted" />
        <span className="flex-1 font-mono">{value || t('datePicker.selectTime')}</span>
      </button>

      <Popover
        anchorRef={anchorRef}
        open={open}
        onClose={() => setOpen(false)}
        matchWidth
        className="animate-in max-h-[240px] min-w-[120px] overflow-y-auto rounded-[12px] border border-border bg-surface-raised p-1.5 shadow-[var(--shadow-pop)]"
      >
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => {
              onChange(opt);
              setOpen(false);
            }}
            className={cn(
              'block w-full rounded-md px-3 py-1.5 text-left font-mono text-[13px] transition-colors hover:bg-border',
              opt === value ? 'bg-[rgba(109,94,246,0.16)] text-accent-soft' : 'text-text-secondary',
            )}
          >
            {opt}
          </button>
        ))}
      </Popover>
    </div>
  );
}
