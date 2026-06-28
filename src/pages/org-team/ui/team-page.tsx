import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Trash2, UserPlus } from 'lucide-react';

import { useActiveOrgId } from '@/entities/session';
import {
  useChangeMemberRole,
  useInviteMember,
  useOrgInvites,
  useOrgMembers,
  useRemoveMember,
  type OrgMemberRole,
} from '@/entities/org';
import { ApiError } from '@/shared/api';
import {
  Avatar,
  Button,
  Card,
  ErrorState,
  Field,
  IconButton,
  Input,
  Modal,
  PageContainer,
  PageHeader,
  SectionHeader,
  Select,
  Skeleton,
  toast,
} from '@/shared/ui';

const ROLES: OrgMemberRole[] = ['ADMIN', 'COORDINATOR', 'PHOTOGRAPHER', 'STAFF'];

const PERMISSIONS = [
  { key: 'createEvents', roles: { ADMIN: true, COORDINATOR: true, PHOTOGRAPHER: false, STAFF: false } },
  { key: 'curate', roles: { ADMIN: true, COORDINATOR: true, PHOTOGRAPHER: false, STAFF: false } },
  { key: 'manageTeam', roles: { ADMIN: true, COORDINATOR: false, PHOTOGRAPHER: false, STAFF: false } },
  { key: 'upload', roles: { ADMIN: true, COORDINATOR: true, PHOTOGRAPHER: true, STAFF: false } },
] as const;

export function TeamPage() {
  const { t } = useTranslation();
  const orgId = useActiveOrgId() ?? '';

  const membersQuery = useOrgMembers(orgId);
  const invitesQuery = useOrgInvites(orgId);
  const changeRole = useChangeMemberRole(orgId);
  const removeMember = useRemoveMember(orgId);
  const inviteMember = useInviteMember(orgId);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<OrgMemberRole>('PHOTOGRAPHER');

  const roleOptions = ROLES.map((r) => ({ value: r, label: t(`team.roles.${r}`) }));

  const sendInvite = () => {
    const target = email.trim();
    if (!target) return;
    inviteMember.mutate(
      { targetEmail: target, role },
      {
        onSuccess: () => {
          toast.success(t('team.invited', { email: target }));
          setEmail('');
          setInviteOpen(false);
        },
        onError: (e) => toast.error(e instanceof ApiError ? e.message : t('team.inviteFailed')),
      },
    );
  };

  const pendingInvites = (invitesQuery.data ?? []).filter((i) => i.status === 'PENDING');

  return (
    <PageContainer>
      <PageHeader
        title={t('team.title')}
        description={t('team.subtitle')}
        actions={
          <Button
            variant="primary"
            leadingIcon={<UserPlus size={16} />}
            onClick={() => setInviteOpen(true)}
          >
            {t('team.inviteMember')}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-[18px]">
          <Card className="p-0">
            <div className="border-b border-border px-5 py-3 text-[11.5px] font-medium uppercase tracking-[0.05em] text-text-muted">
              {t('team.members')}
            </div>
            {membersQuery.isError ? (
              <div className="p-5">
                <ErrorState onRetry={() => membersQuery.refetch()} />
              </div>
            ) : membersQuery.isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border-b border-hairline px-5 py-3.5 last:border-0">
                  <Skeleton height={36} radius={10} />
                </div>
              ))
            ) : (membersQuery.data ?? []).length === 0 ? (
              <div className="px-5 py-8 text-center text-[13px] text-text-muted">
                {t('team.noMembers')}
              </div>
            ) : (
              (membersQuery.data ?? []).map((m) => (
                <div
                  key={m.userId}
                  className="flex items-center gap-3 border-b border-hairline px-5 py-3.5 last:border-0"
                >
                  <Avatar name={m.userId} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-mono text-[12.5px] font-medium">{m.userId}</div>
                  </div>
                  <Select
                    className="h-[34px] w-[150px]"
                    value={m.role}
                    options={roleOptions}
                    disabled={changeRole.isPending}
                    onChange={(e) =>
                      changeRole.mutate(
                        { userId: m.userId, role: e.target.value as OrgMemberRole },
                        { onError: () => toast.error(t('team.roleFailed')) },
                      )
                    }
                  />
                  <IconButton
                    aria-label={t('common.remove')}
                    size="sm"
                    onClick={() =>
                      removeMember.mutate(m.userId, {
                        onError: () => toast.error(t('team.removeFailed')),
                      })
                    }
                  >
                    <Trash2 size={15} />
                  </IconButton>
                </div>
              ))
            )}
          </Card>

          {pendingInvites.length > 0 && (
            <Card className="p-0">
              <div className="border-b border-border px-5 py-3 text-[11.5px] font-medium uppercase tracking-[0.05em] text-text-muted">
                {t('team.pendingInvites')}
              </div>
              {pendingInvites.map((inv) => (
                <div
                  key={inv.token}
                  className="flex items-center gap-3 border-b border-hairline px-5 py-3 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium">
                      {inv.targetEmail ?? inv.targetUserId ?? inv.token}
                    </div>
                  </div>
                  <span className="rounded-md border border-border px-2.5 py-1 text-[12px] font-medium text-text-secondary">
                    {t(`team.roles.${inv.role}`)}
                  </span>
                  <span className="text-[12px] text-pending">{t('team.pending')}</span>
                </div>
              ))}
            </Card>
          )}
        </div>

        <Card>
          <SectionHeader title={t('team.permissions')} />
          <div className="overflow-x-auto">
            <div className="grid grid-cols-[1.6fr_repeat(4,40px)] gap-2 pb-2 text-[11px] uppercase text-text-muted">
              <span />
              <span className="text-center">Adm</span>
              <span className="text-center">Coo</span>
              <span className="text-center">Pho</span>
              <span className="text-center">Sta</span>
            </div>
            {PERMISSIONS.map((p) => (
              <div
                key={p.key}
                className="grid grid-cols-[1.6fr_repeat(4,40px)] items-center gap-2 border-t border-hairline py-2.5 text-[13px]"
              >
                <span>{t(`team.perms.${p.key}`)}</span>
                {ROLES.map((r) => (
                  <span key={r} className="flex justify-center">
                    {p.roles[r] ? (
                      <Check size={15} className="text-approved" strokeWidth={2.5} />
                    ) : (
                      <span className="text-border-strong">–</span>
                    )}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title={t('team.inviteTitle')}
        description={t('team.inviteDesc')}
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
              {t('common.send')}
            </Button>
          </>
        }
      >
        <div className="space-y-3.5">
          <Field label={t('team.emailLabel')}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('team.emailPh')}
            />
          </Field>
          <Field label={t('team.roleLabel')}>
            <Select
              value={role}
              options={roleOptions}
              onChange={(e) => setRole(e.target.value as OrgMemberRole)}
            />
          </Field>
        </div>
      </Modal>
    </PageContainer>
  );
}
