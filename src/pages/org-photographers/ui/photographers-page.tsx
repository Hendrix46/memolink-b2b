import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, UserPlus } from 'lucide-react';

import { useActiveOrgId } from '@/entities/session';
import { useInviteMember, useOrgPhotographers, type OrgPhotographer } from '@/entities/org';
import { useUserName, useUserDirectorySeed } from '@/entities/user';
import { ApiError } from '@/shared/api';
import { avatarGradient } from '@/shared/lib/visual';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Modal,
  PageContainer,
  PageHeader,
  Skeleton,
  toast,
} from '@/shared/ui';

/** Org-admin Photographers directory — wired to `GET /api/org/{orgId}/photographers`. */
export function PhotographersPage() {
  const { t } = useTranslation();
  const orgId = useActiveOrgId() ?? '';
  useUserDirectorySeed();
  const { data, isLoading, isError, refetch } = useOrgPhotographers(orgId);
  const inviteMember = useInviteMember(orgId);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState('');

  const sendInvite = () => {
    const target = email.trim();
    if (!target) return;
    inviteMember.mutate(
      { targetEmail: target, role: 'PHOTOGRAPHER' },
      {
        onSuccess: () => {
          toast.success(t('photographers.invited', { email: target }));
          setEmail('');
          setInviteOpen(false);
        },
        onError: (e) =>
          toast.error(e instanceof ApiError ? e.message : t('photographers.inviteFailed')),
      },
    );
  };

  return (
    <PageContainer>
      <PageHeader
        title={t('photographers.title')}
        description={t('photographers.subtitle')}
        actions={
          <Button
            variant="primary"
            leadingIcon={<UserPlus size={16} />}
            onClick={() => setInviteOpen(true)}
          >
            {t('photographers.invite')}
          </Button>
        }
      />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <Card className="p-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-b border-hairline px-[18px] py-3.5 last:border-0">
              <Skeleton height={38} radius={10} />
            </div>
          ))}
        </Card>
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={<UserPlus size={24} />}
          title={t('photographers.emptyTitle')}
          description={t('photographers.emptyDesc')}
        />
      ) : (
        <Card className="p-0">
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr] gap-3 border-b border-border px-[18px] py-3 text-[11.5px] font-medium uppercase tracking-[0.05em] text-text-muted">
            <span>{t('photographers.colName')}</span>
            <span>{t('photographers.colGear')}</span>
            <span>{t('photographers.colVisibility')}</span>
            <span className="text-right">{t('photographers.colAvailability')}</span>
          </div>
          {data.map((p) => (
            <PhotographerRow key={p.userId} photographer={p} />
          ))}
        </Card>
      )}

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title={t('photographers.inviteTitle')}
        description={t('photographers.inviteDesc')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              leadingIcon={<UserPlus size={15} />}
              disabled={!email.trim() || inviteMember.isPending}
              onClick={sendInvite}
            >
              {t('photographers.send')}
            </Button>
          </>
        }
      >
        <Field label={t('photographers.emailLabel')}>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('photographers.emailPh')}
            onKeyDown={(e) => e.key === 'Enter' && sendInvite()}
          />
        </Field>
      </Modal>
    </PageContainer>
  );
}

function PhotographerRow({ photographer: p }: { photographer: OrgPhotographer }) {
  const { t } = useTranslation();
  const isPublic = p.profile?.public ?? false;
  const portfolioUrl = p.profile?.portfolioUrl;
  const name = useUserName(p.userId) ?? t('common.unknownUser');

  return (
    <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr] items-center gap-3 border-b border-hairline px-[18px] py-3.5 transition-colors last:border-0 hover:bg-surface-hover">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={name} size={38} background={avatarGradient(p.userId)} />
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium">{name}</div>
          {portfolioUrl && (
            <a
              href={portfolioUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 truncate text-[12px] text-accent hover:underline"
            >
              <ExternalLink size={11} />
              {t('photographers.portfolio')}
            </a>
          )}
        </div>
      </div>
      <span className="truncate text-[13px] text-text-secondary">{p.profile?.gear ?? '—'}</span>
      <span
        className="flex items-center gap-1.5 text-[12.5px] font-medium"
        style={{ color: isPublic ? 'var(--color-approved)' : 'var(--color-text-muted)' }}
      >
        <span
          className="size-1.5 rounded-full"
          style={{ background: isPublic ? 'var(--color-approved)' : 'var(--color-text-muted)' }}
        />
        {isPublic ? t('photographers.public') : t('photographers.private')}
      </span>
      <span className="text-right font-mono text-[13px] text-text-secondary">
        {t('photographers.windows', { count: p.availability.length })}
      </span>
    </div>
  );
}
