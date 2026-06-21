import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/shared/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, className, ...rest },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'h-[38px] w-full appearance-none rounded-[10px] border border-border bg-surface pl-3.5 pr-9 text-[13.5px] text-text outline-none transition-colors',
          'hover:border-border-strong focus:border-accent',
          className,
        )}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface-raised">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
      />
    </div>
  );
});
