import { useTranslation } from 'react-i18next';
import { Check, ChevronLeft, Plus, Sparkles } from 'lucide-react';

/** Phase 1 — describe the event in a sentence (spec 04 §1 Phase 1). */
export function PhasePrompt({
  value,
  onChange,
  onGenerate,
  onBlank,
  onCancel,
}: {
  value: string;
  onChange: (v: string) => void;
  onGenerate: () => void;
  onBlank: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const examples = t('create.examples', { returnObjects: true }) as string[];
  const checks = ['agenda', 'cover', 'registration'] as const;

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex items-center justify-between px-[34px] py-[18px]">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-[13px] text-text-secondary transition-colors hover:text-text"
        >
          <ChevronLeft size={16} /> {t('create.back')}
        </button>
        <span className="font-mono text-[12px] text-text-muted">{t('create.newEvent')}</span>
      </div>

      <div className="mx-auto w-full max-w-[680px] px-6 pb-[70px] pt-2.5">
        <div className="animate-in flex flex-col items-center text-center">
          <span className="mb-[18px] flex size-[54px] items-center justify-center rounded-[16px] bg-[linear-gradient(140deg,#6D5EF6,#9d7bff)] shadow-[0_10px_30px_rgba(109,94,246,0.45)]">
            <Sparkles size={26} className="text-white" />
          </span>
          <h1 className="text-[30px] font-semibold tracking-[-0.025em]">{t('create.title')}</h1>
          <p className="mx-auto mt-2.5 max-w-[450px] text-[15px] leading-relaxed text-text-secondary">
            {t('create.subhead')}
          </p>
        </div>

        <div className="mt-7 rounded-[18px] border border-border bg-surface p-[7px] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t('create.promptPlaceholder')}
            className="h-[116px] w-full resize-none bg-transparent px-3.5 pt-3 text-[15.5px] leading-relaxed outline-none placeholder:text-text-muted"
          />
          <div className="flex items-center justify-end px-2.5 pb-2 pt-1">
            <button
              onClick={onGenerate}
              disabled={!value.trim()}
              className="flex h-[38px] items-center gap-2 rounded-[10px] bg-accent px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-55"
            >
              <Sparkles size={16} /> {t('create.generate')}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2.5">
          {examples.map((ex) => (
            <button
              key={ex}
              onClick={() => onChange(ex)}
              className="flex h-[34px] items-center gap-1.5 rounded-full border border-border bg-surface px-[13px] text-[12.5px] text-text-secondary transition-colors hover:border-accent hover:text-text"
            >
              <Plus size={12} className="text-accent-soft" /> {ex}
            </button>
          ))}
        </div>

        <div className="mt-[30px] flex flex-wrap items-center justify-center gap-5">
          {checks.map((c) => (
            <span key={c} className="flex items-center gap-1.5 text-[12.5px] text-text-muted">
              <Check size={14} className="text-approved" strokeWidth={3} />
              {t(`create.checks.${c}`)}
            </span>
          ))}
        </div>

        <div className="mt-7 text-center">
          <button
            onClick={onBlank}
            className="text-[13px] text-text-secondary transition-colors hover:text-accent-soft"
          >
            {t('create.startScratch')}
          </button>
        </div>
      </div>
    </div>
  );
}
