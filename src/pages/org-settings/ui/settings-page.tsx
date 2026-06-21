import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useViewer } from '@/entities/session';
import { Button, Card, Field, Input, PageContainer, PageHeader, SectionHeader, Switch, toast } from '@/shared/ui';

const NOTIFICATIONS = ['uploads', 'review', 'delivery', 'team'];

export function OrgSettingsPage() {
  const { t } = useTranslation();
  const viewer = useViewer();
  const [enabled, setEnabled] = useState<Set<string>>(new Set(['uploads', 'review', 'delivery']));

  const toggle = (key: string) =>
    setEnabled((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  return (
    <PageContainer width="narrow">
      <PageHeader title={t('orgSettings.title')} description={t('orgSettings.subtitle')} />

      <div className="space-y-[18px]">
        <Card className="space-y-5">
          <SectionHeader title={t('orgSettings.organization')} />
          <Field label={t('orgSettings.orgName')}>
            <Input defaultValue={viewer.workspace.name} />
          </Field>
          <Field label={t('orgSettings.contactEmail')}>
            <Input defaultValue={viewer.email} />
          </Field>
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => toast.success(t('orgSettings.saved'))}>
              {t('common.save')}
            </Button>
          </div>
        </Card>

        <Card>
          <SectionHeader title={t('orgSettings.notifications')} />
          <div className="flex flex-col">
            {NOTIFICATIONS.map((key) => {
              const on = enabled.has(key);
              return (
                <div key={key} className="flex items-center justify-between border-t border-hairline py-3.5 first:border-0">
                  <div>
                    <div className="text-[13.5px] font-medium">{t(`orgSettings.notif.${key}`)}</div>
                    <div className="text-xs text-text-muted">{t(`orgSettings.notif.${key}Desc`)}</div>
                  </div>
                  <Switch checked={on} onChange={() => toggle(key)} aria-label={t(`orgSettings.notif.${key}`)} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
