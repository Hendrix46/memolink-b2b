import { useTranslation } from 'react-i18next';
import { Check, UserPlus } from 'lucide-react';

import type { OrgRole } from '@/entities/session';
import { Avatar, Button, Card, PageContainer, PageHeader, SectionHeader, toast } from '@/shared/ui';

interface Member {
  id: string;
  name: string;
  email: string;
  role: OrgRole;
}

const MEMBERS: Member[] = [
  { id: 'm1', name: 'Dana Whitfield', email: 'dana@jetbrains.com', role: 'admin' },
  { id: 'm2', name: 'Marco Bellini', email: 'marco@jetbrains.com', role: 'coordinator' },
  { id: 'm3', name: 'Priya Raman', email: 'priya@memolink.studio', role: 'photographer' },
  { id: 'm4', name: 'Sam Okafor', email: 'sam@memolink.studio', role: 'photographer' },
];

const PERMISSIONS = [
  { key: 'createEvents', roles: { admin: true, coordinator: true, photographer: false } },
  { key: 'curate', roles: { admin: true, coordinator: true, photographer: false } },
  { key: 'manageTeam', roles: { admin: true, coordinator: false, photographer: false } },
  { key: 'upload', roles: { admin: true, coordinator: true, photographer: true } },
];

export function TeamPage() {
  const { t } = useTranslation();
  return (
    <PageContainer>
      <PageHeader
        title={t('team.title')}
        description={t('team.subtitle')}
        actions={
          <Button variant="primary" leadingIcon={<UserPlus size={16} />} onClick={() => toast.info(t('team.inviteToast'))}>
            {t('team.inviteMember')}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-0">
          <div className="border-b border-border px-5 py-3 text-[11.5px] font-medium uppercase tracking-[0.05em] text-text-muted">
            {t('team.members')}
          </div>
          {MEMBERS.map((m) => (
            <div key={m.id} className="flex items-center gap-3 border-b border-hairline px-5 py-3.5 last:border-0">
              <Avatar name={m.name} size={36} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-medium">{m.name}</div>
                <div className="truncate font-mono text-[11.5px] text-text-muted">{m.email}</div>
              </div>
              <span className="rounded-md border border-border px-2.5 py-1 text-[12px] font-medium text-text-secondary">
                {t(`team.roles.${m.role}`)}
              </span>
            </div>
          ))}
        </Card>

        <Card>
          <SectionHeader title={t('team.permissions')} />
          <div className="overflow-x-auto">
            <div className="grid grid-cols-[1.6fr_repeat(3,40px)] gap-2 pb-2 text-[11px] uppercase text-text-muted">
              <span />
              <span className="text-center">Adm</span>
              <span className="text-center">Coo</span>
              <span className="text-center">Pho</span>
            </div>
            {PERMISSIONS.map((p) => (
              <div key={p.key} className="grid grid-cols-[1.6fr_repeat(3,40px)] items-center gap-2 border-t border-hairline py-2.5 text-[13px]">
                <span>{t(`team.perms.${p.key}`)}</span>
                {(['admin', 'coordinator', 'photographer'] as OrgRole[]).map((r) => (
                  <span key={r} className="flex justify-center">
                    {p.roles[r] ? <Check size={15} className="text-approved" strokeWidth={2.5} /> : <span className="text-border-strong">–</span>}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
