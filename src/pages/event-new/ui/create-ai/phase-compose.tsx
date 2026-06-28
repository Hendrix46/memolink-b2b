import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ImageIcon,
  Minus,
  Pencil,
  Plus,
  Send,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';

import {
  ACCENT_PRESETS,
  CoverPicker,
  EventPreview,
  LocationPicker,
  TIMEZONES,
  useEventDraftStore,
  type AgendaDraftItem,
} from '@/features/event-builder';
import { DatePicker } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';

const TRACK_COLOR: Record<AgendaDraftItem['track'], string> = {
  Keynote: 'var(--color-accent)',
  Talk: 'var(--color-approved)',
  Workshop: 'var(--color-processing)',
  Social: 'var(--color-pending)',
};

const TRACKS = Object.keys(TRACK_COLOR) as AgendaDraftItem['track'][];

/** Add days to a `YYYY-MM-DD` string. Formats from LOCAL parts — never via
 *  `toISOString()`, which shifts the date back a day in positive-offset zones
 *  (e.g. Asia/Tashkent UTC+5). */
function addDaysISO(iso: string, n: number): string {
  if (!iso) return iso;
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  const p = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Inclusive day count between two `YYYY-MM-DD` strings (≥ 1). */
function daysBetween(start: string, end: string): number {
  if (!start || !end) return 1;
  const a = new Date(`${start}T00:00:00`).getTime();
  const b = new Date(`${end}T00:00:00`).getTime();
  const diff = Math.round((b - a) / 86_400_000);
  return diff >= 0 ? diff + 1 : 1;
}

/** Phase 3 — review & refine the AI draft, with a live attendee preview (spec 04 §1 Phase 3). */
export function PhaseCompose({
  onBack,
  onCancel,
  onCreate,
  creating = false,
}: {
  onBack: () => void;
  onCancel: () => void;
  onCreate: () => void;
  creating?: boolean;
}) {
  const { t } = useTranslation();
  const draft = useEventDraftStore((s) => s.draft);
  const patch = useEventDraftStore((s) => s.patch);
  const addSession = useEventDraftStore((s) => s.addSession);
  const updateSession = useEventDraftStore((s) => s.updateSession);
  const removeSession = useEventDraftStore((s) => s.removeSession);

  // Initialize from the draft's range so a multi-day AI draft isn't reset to 1.
  const [days, setDays] = useState(() => daysBetween(draft.startDate, draft.endDate));
  const [refine, setRefine] = useState('');
  const [flash, setFlash] = useState(false);

  // Keep endDate in lockstep with the start date + day count.
  useEffect(() => {
    patch({ endDate: addDaysISO(draft.startDate, Math.max(0, days - 1)) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, draft.startDate]);

  const multiDay = days > 1;

  const sendRefine = () => {
    if (!refine.trim()) return;
    setRefine('');
    setFlash(true);
    setTimeout(() => setFlash(false), 1600);
  };

  return (
    <div className="flex min-h-full flex-col">
      {/* Sticky header */}
      <div className="sticky top-0 z-[12] border-b border-border bg-[rgba(11,11,15,0.86)] backdrop-blur-[10px]">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-[34px] py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={onBack}
              className="flex size-9 flex-none items-center justify-center rounded-[9px] border border-border bg-surface transition-colors hover:border-border-strong"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="max-w-[360px] truncate text-[18px] font-semibold">
                  {draft.name || t('builder.preview.untitled')}
                </h1>
                <span className="flex items-center gap-1 rounded-[7px] bg-[rgba(109,94,246,0.16)] px-2.5 py-[3px] text-[11px] font-semibold text-accent-soft">
                  <Sparkles size={11} /> {t('create.aiDraft')}
                </span>
              </div>
              <p className="text-[12px] text-text-muted">{t('create.reviewRefine')}</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-[13px] text-text-secondary transition-colors hover:text-text">
            {t('common.cancel')}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 items-start gap-[26px] px-[34px] py-6 lg:grid-cols-[1fr_404px]">
        {/* LEFT — editable cards */}
        <div className="flex flex-col gap-4">
          {/* Basics */}
          <ComposeCard icon={<Pencil size={16} />} tint="rgba(109,94,246,0.14)" color="var(--color-accent)" title={t('create.basics.title')}>
            <Label text={t('create.basics.name')} />
            <TextField value={draft.name} onChange={(v) => patch({ name: v })} placeholder={t('create.basics.namePh')} />
            <Label text={t('create.basics.description')} className="mt-3.5" />
            <textarea
              value={draft.description}
              onChange={(e) => patch({ description: e.target.value })}
              className="h-[78px] w-full resize-none rounded-[10px] border border-border bg-sidebar px-3.5 py-2.5 text-[14px] outline-none transition-colors focus:border-accent"
            />
            <div className="mt-3.5 grid grid-cols-[1.5fr_1fr] gap-3">
              <div>
                <Label text={t('create.basics.startDate')} />
                <DatePicker value={draft.startDate} onChange={(v) => patch({ startDate: v })} placeholder="Jul 18, 2026" />
              </div>
              <div>
                <Label text={t('create.basics.days')} />
                <div className="flex h-11 items-center justify-between rounded-[10px] border border-border bg-sidebar">
                  <Stepper icon={<Minus size={15} />} onClick={() => setDays((d) => Math.max(1, d - 1))} />
                  <span className="font-mono text-[14px] font-semibold">{days}</span>
                  <Stepper icon={<Plus size={15} />} onClick={() => setDays((d) => d + 1)} />
                </div>
              </div>
            </div>
            {multiDay && draft.endDate && (
              <p className="mt-2 text-[12px] text-accent-soft">
                {t('create.basics.runs', { range: `${draft.startDate} → ${draft.endDate}` })}
              </p>
            )}
            <div className="mt-3.5 grid grid-cols-[1fr_1.4fr] gap-3">
              <div>
                <Label text={t('create.basics.startTime')} />
                <TextField value={draft.startTime} onChange={(v) => patch({ startTime: v })} placeholder="09:00" mono />
              </div>
              <div>
                <Label text={t('create.basics.timezone')} />
                <select
                  value={draft.timezone}
                  onChange={(e) => patch({ timezone: e.target.value })}
                  className="h-11 w-full rounded-[10px] border border-border bg-sidebar px-3 text-[14px] outline-none transition-colors focus:border-accent"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3.5">
              <LocationPicker />
            </div>
          </ComposeCard>

          {/* Cover & theme */}
          <ComposeCard icon={<ImageIcon size={16} />} tint="rgba(74,168,255,0.14)" color="var(--color-processing)" title={t('create.cover.title')}>
            <CoverPicker />
            <Label text={t('create.cover.accent')} className="mt-4" />
            <div className="flex gap-2.5">
              {ACCENT_PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => patch({ accent: c })}
                  aria-label={c}
                  className={cn(
                    'size-8 rounded-lg transition-transform hover:scale-110',
                    draft.accent === c && 'ring-2 ring-white ring-offset-2 ring-offset-surface',
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          </ComposeCard>

          {/* Agenda */}
          <ComposeCard
            icon={<CalendarDays size={16} />}
            tint="rgba(61,214,140,0.14)"
            color="var(--color-approved)"
            title={t('create.agenda.title')}
            action={
              <button
                onClick={addSession}
                className="flex items-center gap-1.5 rounded-[9px] border border-border bg-surface-raised px-2.5 py-1.5 text-[12.5px] font-semibold text-accent-soft transition-colors hover:border-accent"
              >
                <Plus size={14} /> {t('create.agenda.add')}
              </button>
            }
          >
            <div className="flex flex-col gap-2">
              {draft.agenda.map((s) => (
                <div key={s.id} className="flex items-center gap-2.5 rounded-[11px] border border-border bg-sidebar p-2.5">
                  <span className="h-[34px] w-1 flex-none rounded-full" style={{ background: TRACK_COLOR[s.track] }} />
                  <input
                    value={s.time}
                    onChange={(e) => updateSession(s.id, { time: e.target.value })}
                    placeholder="10:00"
                    className="w-16 flex-none rounded-md border border-border bg-surface px-2 py-1.5 font-mono text-[13px] outline-none focus:border-accent"
                  />
                  <input
                    value={s.title}
                    onChange={(e) => updateSession(s.id, { title: e.target.value })}
                    placeholder={t('create.agenda.titlePh')}
                    className="min-w-0 flex-1 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[13px] outline-none focus:border-accent"
                  />
                  <select
                    value={s.track}
                    onChange={(e) => updateSession(s.id, { track: e.target.value as AgendaDraftItem['track'] })}
                    aria-label={t('create.agenda.track')}
                    className="hidden flex-none rounded-md border border-border bg-surface px-2 py-1.5 text-[12.5px] text-text-secondary outline-none transition-colors focus:border-accent sm:block"
                  >
                    {TRACKS.map((tr) => (
                      <option key={tr} value={tr}>
                        {t(`builder.agendaStep.tracks.${tr}`)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeSession(s.id)}
                    aria-label={t('common.remove')}
                    className="flex size-8 flex-none items-center justify-center rounded-md text-text-muted transition-colors hover:bg-[rgba(240,85,110,0.14)] hover:text-rejected"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </ComposeCard>

          {/* Registration & access */}
          <ComposeCard icon={<Users size={16} />} tint="rgba(224,163,62,0.14)" color="var(--color-pending)" title={t('create.access.title')}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label text={t('create.access.capacity')} />
                <TextField
                  value={String(draft.capacity)}
                  onChange={(v) => patch({ capacity: Number(v.replace(/\D/g, '')) || 0 })}
                  placeholder="500"
                  mono
                />
              </div>
              <div>
                <Label text={t('create.access.registration')} />
                <button
                  onClick={() => patch({ requireApproval: !draft.requireApproval })}
                  className="flex h-11 w-full items-center justify-between rounded-[10px] border border-border bg-sidebar px-3.5 text-[13.5px]"
                >
                  {t('create.access.openToPublic')}
                  <span className={cn('relative h-[22px] w-[38px] rounded-full transition-colors', !draft.requireApproval ? 'bg-accent' : 'bg-border-strong')}>
                    <span className={cn('absolute top-0.5 size-[18px] rounded-full bg-white transition-all', !draft.requireApproval ? 'left-[18px]' : 'left-0.5')} />
                  </span>
                </button>
              </div>
            </div>

            <Label text={t('create.access.galleryVisibility')} className="mt-4" />
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <AccessRadio
                active={draft.visibility !== 'invite'}
                onClick={() => patch({ visibility: 'public' })}
                title={t('create.access.publicLink')}
                desc={t('create.access.publicLinkDesc')}
              />
              <AccessRadio
                active={draft.visibility === 'invite'}
                onClick={() => patch({ visibility: 'invite' })}
                title={t('create.access.inviteOnly')}
                desc={t('create.access.inviteOnlyDesc')}
              />
            </div>
          </ComposeCard>
        </div>

        {/* RIGHT — live preview */}
        <aside className="lg:sticky lg:top-[92px]">
          <div className="mb-3 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-approved" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-muted">
              {t('create.preview.live')}
            </span>
          </div>
          <EventPreview />
          <p className="mt-3 px-1 text-[11.5px] leading-relaxed text-text-muted">{t('create.preview.caption')}</p>
        </aside>
      </div>

      {/* Sticky bottom bar */}
      <div className="sticky bottom-0 z-[14] mt-auto border-t border-border bg-[rgba(11,11,15,0.9)] backdrop-blur-[12px]">
        <div className="mx-auto flex max-w-[1280px] items-center gap-3.5 px-[34px] py-3.5">
          <div className="flex flex-1 items-center gap-2 rounded-[11px] border border-border bg-surface px-3.5">
            <Sparkles size={17} className="flex-none text-accent-soft" />
            <input
              value={refine}
              onChange={(e) => setRefine(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendRefine()}
              placeholder={t('create.refine.placeholder')}
              className="h-11 min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-text-muted"
            />
            {flash && (
              <span className="flex flex-none items-center gap-1 text-[12px] font-semibold text-approved">
                <Check size={14} strokeWidth={3} /> {t('create.refine.updated')}
              </span>
            )}
            <button
              onClick={sendRefine}
              aria-label={t('create.refine.send')}
              className="flex size-[34px] flex-none items-center justify-center rounded-[9px] bg-accent text-white transition-colors hover:bg-accent-hover"
            >
              <Send size={15} />
            </button>
          </div>
          <button
            onClick={onCreate}
            disabled={creating}
            className="flex h-[46px] flex-none items-center gap-2 rounded-[13px] bg-approved px-6 text-[14px] font-semibold text-base shadow-[0_6px_20px_rgba(61,214,140,0.3)] transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Check size={17} strokeWidth={2.6} /> {creating ? t('create.creating') : t('create.createEvent')}
          </button>
        </div>
      </div>
    </div>
  );
}

function ComposeCard({
  icon,
  tint,
  color,
  title,
  badge,
  action,
  children,
}: {
  icon: ReactNode;
  tint: string;
  color: string;
  title: string;
  badge?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[16px] border border-border bg-surface px-6 py-[22px]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex size-[30px] items-center justify-center rounded-[9px]" style={{ background: tint, color }}>
            {icon}
          </span>
          <h3 className="text-[15px] font-semibold">{title}</h3>
          {badge && (
            <span className="rounded-[6px] bg-[rgba(109,94,246,0.16)] px-2 py-0.5 text-[10.5px] font-semibold text-accent-soft">
              {badge}
            </span>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Label({ text, className }: { text: string; className?: string }) {
  return <div className={cn('mb-[7px] text-[12px] font-medium text-text-secondary', className)}>{text}</div>;
}

function TextField({
  value,
  onChange,
  placeholder,
  mono,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'h-11 w-full rounded-[10px] border border-border bg-sidebar px-3.5 text-[14px] outline-none transition-colors focus:border-accent',
        mono && 'font-mono',
      )}
    />
  );
}

function Stepper({ icon, onClick }: { icon: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex size-10 items-center justify-center text-text-secondary transition-colors hover:bg-surface-raised"
    >
      {icon}
    </button>
  );
}

function AccessRadio({
  active,
  onClick,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-[11px] border bg-sidebar p-3 text-left transition-colors',
        active ? 'border-accent' : 'border-border hover:border-border-strong',
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn('flex size-4 items-center justify-center rounded-full border', active ? 'border-accent' : 'border-border-strong')}>
          {active && <span className="size-2 rounded-full bg-accent" />}
        </span>
        <span className="text-[13.5px] font-semibold">{title}</span>
      </div>
      <p className="mt-1 pl-6 text-[12px] text-text-muted">{desc}</p>
    </button>
  );
}
