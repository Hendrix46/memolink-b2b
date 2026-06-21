import { cn } from '@/shared/lib/cn';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  'aria-label'?: string;
  disabled?: boolean;
}

/** Accessible on/off toggle. */
export function Switch({ checked, onChange, disabled, ...rest }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 flex-none rounded-full transition-colors disabled:opacity-50',
        checked ? 'bg-accent' : 'bg-border',
      )}
      {...rest}
    >
      <span
        className={cn(
          'absolute top-0.5 size-5 rounded-full bg-white transition-all',
          checked ? 'left-[22px]' : 'left-0.5',
        )}
      />
    </button>
  );
}
