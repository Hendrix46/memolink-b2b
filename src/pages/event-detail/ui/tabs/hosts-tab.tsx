import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';

import type { EventDetail, EventHostMember, HostRole } from '@/entities/event';
import { InviteCohostModal, useInviteCohost } from '@/features/invite-cohost';
import { Avatar, Button, Card, SectionHeader, StatusBadge } from '@/shared/ui';

const ROLE_COLOR: Record<HostRole, string> = {
  owner: 'var(--color-accent)',
  manager: 'var(--color-processing)',
  editor: 'var(--color-approved)',
  viewer: 'var(--color-text-muted)',
};

const LEGEND_ROLES: HostRole[] = ['manager', 'editor', 'viewer'];

export function HostsTab({ event }: { event: EventDetail }) {
  const { t } = useTranslation();
  const owner = event.hosts.find((h) => h.role === 'owner');
  const cohosts = event.hosts.filter((h) => h.role !== 'owner');
  const openInvite = useInviteCohost((s) => s.openModal);

  const invite = () => openInvite(event.title);

  return (
    <div className="space-y-[22px]">
      <InviteCohostModal />
      <SectionHeader
        title={<span className="text-[17px]">{t('eventDetail.hosts.title')}</span>}
        description={<span className="block max-w-[540px]">{t('eventDetail.hosts.subtitle')}</span>}
        action={
          <Button variant="primary" size="lg" leadingIcon={<UserPlus size={16} />} onClick={invite}>
            {t('eventDetail.hosts.invite')}
          </Button>
        }
      />

      {/* Owner */}
      {owner && (
        <div className="space-y-2.5">
          <div className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-text-muted">
            {t('eventDetail.hosts.owner')}
          </div>
          <Card className="flex items-center gap-3.5">
            <Avatar name={owner.name} size={46} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-semibold">{owner.name}</span>
                <span className="rounded-md bg-[rgba(109,94,246,0.15)] px-1.5 py-0.5 text-[10px] font-bold text-accent-soft">
                  {t('eventDetail.hosts.you')}
                </span>
              </div>
              <div className="mt-0.5 font-mono text-[12.5px] text-text-muted">{owner.email}</div>
            </div>
            <span className="rounded-md bg-[rgba(109,94,246,0.1)] px-2.5 py-1 text-[12px] font-medium text-accent-soft">
              {t('eventDetail.hosts.ownerRole')}
            </span>
          </Card>
        </div>
      )}

      {/* Co-hosts */}
      <div className="space-y-2.5">
        <div className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-text-muted">
          {t('eventDetail.hosts.cohostsCount', { count: cohosts.length })}
        </div>
        <Card className="p-0">
          {cohosts.map((c) => (
            <CohostRow key={c.id} member={c} />
          ))}
        </Card>
      </div>

      {/* Access levels legend */}
      <div className="space-y-2.5">
        <div className="text-[11.5px] font-medium uppercase tracking-[0.06em] text-text-muted">
          {t('eventDetail.hosts.accessLevels')}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {LEGEND_ROLES.map((role) => (
            <Card key={role} compact>
              <div className="flex items-center gap-2 text-[13.5px] font-medium" style={{ color: ROLE_COLOR[role] }}>
                <span className="size-1.5 rounded-full" style={{ background: ROLE_COLOR[role] }} />
                {t(`eventDetail.hosts.roles.${role}`)}
              </div>
              <p className="mt-1.5 text-[12px] text-text-muted">{t(`eventDetail.hosts.blurbs.${role}`)}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function CohostRow({ member }: { member: EventHostMember }) {
  const { t } = useTranslation();
  const statusColor = member.status === 'active' ? 'var(--color-approved)' : 'var(--color-pending)';
  return (
    <div className="flex items-center gap-3.5 border-b border-hairline px-4 py-3.5 last:border-0">
      <Avatar name={member.name} size={42} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{member.name}</span>
          <StatusBadge color={statusColor} label={t(`eventDetail.hosts.status.${member.status}`)} />
        </div>
        <div className="mt-0.5 font-mono text-[12.5px] text-text-muted">{member.email}</div>
      </div>
      <span
        className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12.5px] font-medium"
        style={{ color: ROLE_COLOR[member.role] }}
      >
        <span className="size-1.5 rounded-full" style={{ background: ROLE_COLOR[member.role] }} />
        {t(`eventDetail.hosts.roles.${member.role}`)}
      </span>
    </div>
  );
}
