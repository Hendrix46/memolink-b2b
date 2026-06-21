import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';

import { cn } from '@/shared/lib/cn';
import { dateFnsLocale, formatLocalDate, parseISODate, toISODate } from '@/shared/lib/datetime';

export interface DatePickerProps {
  /** ISO date string 'yyyy-MM-dd'. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/** Calendar date picker (react-day-picker) themed to the Memolink dark UI. */
export function DatePicker({ value, onChange, placeholder, className }: DatePickerProps) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const selected = parseISODate(value);
  const label = formatLocalDate(value, i18n.language);

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-[38px] w-full items-center gap-2.5 rounded-[10px] border border-border bg-surface px-3.5 text-left text-[13.5px] transition-colors',
          'hover:border-border-strong focus:border-accent',
          label ? 'text-text' : 'text-text-muted',
        )}
      >
        <Calendar size={15} className="flex-none text-text-muted" />
        <span className="flex-1">{label ?? placeholder ?? t('datePicker.selectDate')}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="ml-rdp animate-in absolute left-0 top-[44px] z-50 rounded-[14px] border border-border bg-surface-raised p-2 shadow-[var(--shadow-pop)]">
            <DayPicker
              mode="single"
              selected={selected}
              defaultMonth={selected}
              locale={dateFnsLocale(i18n.language)}
              onSelect={(d) => {
                if (d) onChange(toISODate(d));
                setOpen(false);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
