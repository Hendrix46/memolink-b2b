import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { CountChip } from './badge';

export interface TabItem {
  value: string;
  label: string;
  badge?: number | string;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/** Underline tab bar (persistent within Event detail — §5.4). */
export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div role="tablist" className={cn('flex gap-1 overflow-x-auto', className)}>
      {items.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative flex items-center gap-2 whitespace-nowrap px-3.5 py-3.5 text-[13.5px] font-medium transition-colors',
              active ? 'text-text' : 'text-text-muted hover:text-text',
            )}
          >
            {tab.label}
            {tab.badge !== undefined && <CountChip>{tab.badge}</CountChip>}
            {active && (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent" />
            )}
          </button>
        );
      })}
    </div>
  );
}

interface TabPanelProps {
  when: boolean;
  children: ReactNode;
}

/** Mount-guarded tab panel for declarative readability. */
export function TabPanel({ when, children }: TabPanelProps) {
  if (!when) return null;
  return <div className="animate-in">{children}</div>;
}
