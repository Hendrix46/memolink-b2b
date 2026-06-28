import { useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Link2, Send, UserPlus, X } from 'lucide-react';

import type { HostRole } from '@/entities/event';
import { avatarGradient } from '@/shared/lib/visual';
import { Avatar, Button, Modal, StatusBadge, Textarea, toast } from '@/shared/ui';
import { useInviteCohost } from '../model/store';

/** Co-host roles offered in the modal (owner is excluded — it can't be granted). */
const ROLES: HostRole[] = ['manager', 'editor', 'viewer'];

/** Permission rows + which roles grant them — updates the "what they can do" grid. */
const PERMS: { key: string; roles: Record<HostRole, boolean> }[] = [
  { key: 'curate', roles: { owner: true, manager: true, editor: true, viewer: false } },
  { key: 'editDetails', roles: { owner: true, manager: true, editor: true, viewer: false } },
  { key: 'delivery', roles: { owner: true, manager: true, editor: false, viewer: false } },
  { key: 'invite', roles: { owner: true, manager: true, editor: false, viewer: false } },
  { key: 'analytics', roles: { owner: true, manager: true, editor: true, viewer: true } },
  { key: 'delete', roles: { owner: true, manager: false, editor: false, viewer: false } },
];

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

/** Invite co-host modal (spec 04 §4) — store-driven, two states (form / sent). */
export function InviteCohostModal() {
  const { t } = useTranslation();
  const { open, eventName, close } = useInviteCohost();

  const [emails, setEmails] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [role, setRole] = useState<HostRole>('manager');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const reset = () => {
    setEmails([]);
    setInput('');
    setRole('manager');
    setMessage('');
    setSent(false);
  };

  const handleClose = () => {
    close();
    // Defer reset so the closing animation doesn't flash empty state.
    setTimeout(reset, 200);
  };

  const addEmail = (value: string) => {
    const v = value.trim().replace(/,$/, '');
    if (v && isValidEmail(v) && !emails.includes(v)) setEmails((prev) => [...prev, v]);
    setInput('');
  };

  const onInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail(input);
    } else if (e.key === 'Backspace' && !input && emails.length) {
      setEmails((prev) => prev.slice(0, -1));
    }
  };

  const send = () => {
    if (!emails.length) return;
    setSent(true);
  };

  if (!open) return null;

  // ── State B: sent confirmation ──────────────────────────────────────────
  if (sent) {
    return (
      <Modal open={open} onClose={handleClose} width={600}>
        <div className="flex flex-col items-center px-2 pb-2 pt-3 text-center">
          <span className="flex size-[62px] items-center justify-center rounded-full bg-[rgba(61,214,140,0.14)] text-approved">
            <Check size={30} strokeWidth={2.5} />
          </span>
          <h2 className="mt-4 text-[20px] font-semibold">{t('inviteCohost.sentTitle')}</h2>
          <p className="mt-1.5 max-w-[420px] text-[13.5px] text-text-secondary">
            {t('inviteCohost.sentDesc', { name: eventName })}
          </p>

          <div className="mt-5 w-full space-y-2 text-left">
            {emails.map((email) => (
              <div key={email} className="flex items-center gap-3 rounded-[11px] border border-border bg-surface px-3.5 py-3">
                <Avatar name={email} size={34} background={avatarGradient(email)} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-medium">{email.split('@')[0]}</div>
                  <div className="truncate font-mono text-[12px] text-text-muted">{email}</div>
                </div>
                <span className="rounded-md border border-border px-2 py-0.5 text-[11.5px] font-medium text-text-secondary">
                  {t(`eventDetail.hosts.roles.${role}`)}
                </span>
                <StatusBadge color="var(--color-pending)" label={t('inviteCohost.pending')} />
              </div>
            ))}
          </div>

          <div className="mt-6 flex w-full justify-center gap-2.5">
            <Button variant="secondary" onClick={() => setSent(false)}>
              {t('inviteCohost.inviteMore')}
            </Button>
            <Button variant="primary" onClick={handleClose}>
              {t('inviteCohost.done')}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // ── State A: form ───────────────────────────────────────────────────────
  return (
    <Modal
      open={open}
      onClose={handleClose}
      width={600}
      title={
        <span className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-[11px] bg-[linear-gradient(140deg,#6D5EF6,#9d7bff)] text-white">
            <UserPlus size={18} />
          </span>
          <span>{t('inviteCohost.title')}</span>
        </span>
      }
      description={t('inviteCohost.subtitle', { name: eventName })}
      footer={
        <div className="flex w-full items-center justify-between gap-2.5">
          <Button
            variant="ghost"
            leadingIcon={<Link2 size={15} />}
            onClick={() => toast.success(t('inviteCohost.linkCopied'))}
          >
            {t('inviteCohost.copyLink')}
          </Button>
          <div className="flex gap-2.5">
            <Button variant="secondary" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" leadingIcon={<Send size={15} />} disabled={!emails.length} onClick={send}>
              {t('inviteCohost.send')}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Email chip input */}
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium text-text-secondary">
            {t('inviteCohost.emailLabel')}
          </label>
          <div className="flex min-h-[46px] flex-wrap items-center gap-1.5 rounded-[11px] border border-border bg-surface px-2.5 py-2 focus-within:border-accent">
            {emails.map((email) => (
              <span
                key={email}
                className="flex items-center gap-1.5 rounded-md bg-[rgba(109,94,246,0.16)] py-1 pl-2.5 pr-1.5 text-[12.5px] text-accent-soft"
              >
                {email}
                <button
                  aria-label={t('common.remove')}
                  onClick={() => setEmails((prev) => prev.filter((e) => e !== email))}
                  className="flex size-4 items-center justify-center rounded-full hover:bg-[rgba(109,94,246,0.3)]"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onInputKey}
              onBlur={() => addEmail(input)}
              placeholder={t('inviteCohost.emailPh')}
              className="h-7 min-w-[160px] flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-text-muted"
            />
          </div>
          <p className="mt-1.5 text-[11.5px] text-text-muted">{t('inviteCohost.emailHint')}</p>
        </div>

        <div className="h-px bg-border" />

        {/* Permission level */}
        <div>
          <label className="mb-2 block text-[12.5px] font-medium text-text-secondary">
            {t('inviteCohost.permissionLevel')}
          </label>
          <div className="space-y-2">
            {ROLES.map((r) => {
              const active = role === r;
              return (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex w-full items-center gap-3 rounded-[11px] border px-3.5 py-3 text-left transition-colors ${
                    active ? 'border-accent bg-[rgba(109,94,246,0.08)]' : 'border-border hover:border-border-strong'
                  }`}
                >
                  <span
                    className={`flex size-[18px] flex-none items-center justify-center rounded-full border ${
                      active ? 'border-accent' : 'border-border-strong'
                    }`}
                  >
                    {active && <span className="size-2.5 rounded-full bg-accent" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-semibold">{t(`eventDetail.hosts.roles.${r}`)}</span>
                    <span className="block text-[12px] text-text-muted">{t(`eventDetail.hosts.blurbs.${r}`)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* What they'll be able to do */}
        <div className="rounded-[11px] border border-border bg-surface p-3.5">
          <div className="mb-2.5 text-[12px] font-medium text-text-secondary">{t('inviteCohost.whatTheyCanDo')}</div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
            {PERMS.map((p) => {
              const allowed = p.roles[role];
              return (
                <div
                  key={p.key}
                  className="flex items-center gap-2 text-[12.5px]"
                  style={{ color: allowed ? 'var(--color-text)' : 'var(--color-text-muted)' }}
                >
                  {allowed ? (
                    <Check size={14} className="flex-none text-approved" strokeWidth={2.5} />
                  ) : (
                    <X size={14} className="flex-none text-border-strong" />
                  )}
                  {t(`inviteCohost.perms.${p.key}`)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Optional message */}
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium text-text-secondary">
            {t('inviteCohost.messageLabel')}
          </label>
          <Textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('inviteCohost.messagePh')}
          />
        </div>
      </div>
    </Modal>
  );
}
