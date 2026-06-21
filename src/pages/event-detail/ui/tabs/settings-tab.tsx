import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Archive, Trash2 } from 'lucide-react';

import type { EventDetail } from '@/entities/event';
import { Button, Card, Field, Input, Modal, SectionHeader, toast } from '@/shared/ui';

export function SettingsTab({ event }: { event: EventDetail }) {
  const { t } = useTranslation();
  const [name, setName] = useState(event.name);
  const [location, setLocation] = useState(event.location);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="max-w-2xl space-y-[18px]">
      <Card className="space-y-5">
        <SectionHeader title={t('eventDetail.settings.eventDetails')} />
        <Field label={t('eventDetail.settings.eventName')}>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={t('eventDetail.settings.location')}>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} />
        </Field>
        <div className="flex justify-end">
          <Button variant="primary" onClick={() => toast.success(t('eventDetail.settings.saved'))}>
            {t('common.saveChanges')}
          </Button>
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="border-rejected/30">
        <SectionHeader
          title={
            <span className="flex items-center gap-2 text-rejected">
              <AlertTriangle size={16} /> {t('eventDetail.settings.dangerZone')}
            </span>
          }
        />
        <div className="flex items-center justify-between border-t border-hairline py-3.5">
          <div>
            <div className="text-[13.5px] font-medium">{t('eventDetail.settings.archiveEvent')}</div>
            <div className="text-xs text-text-muted">{t('eventDetail.settings.archiveDesc')}</div>
          </div>
          <Button variant="secondary" leadingIcon={<Archive size={15} />} onClick={() => toast.info(t('eventDetail.settings.archived'))}>
            {t('eventDetail.settings.archive')}
          </Button>
        </div>
        <div className="flex items-center justify-between border-t border-hairline py-3.5">
          <div>
            <div className="text-[13.5px] font-medium">{t('eventDetail.settings.deleteEvent')}</div>
            <div className="text-xs text-text-muted">{t('eventDetail.settings.deleteDesc')}</div>
          </div>
          <Button variant="destructive" leadingIcon={<Trash2 size={15} />} onClick={() => setConfirmDelete(true)}>
            {t('common.delete')}
          </Button>
        </div>
      </Card>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={t('eventDetail.settings.deleteConfirmTitle')}
        description={t('eventDetail.settings.deleteConfirmDesc', { name: event.name, total: event.assetCount.toLocaleString() })}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmDelete(false);
                toast.error(t('eventDetail.settings.deleted'));
              }}
            >
              {t('common.deletePermanently')}
            </Button>
          </>
        }
      />
    </div>
  );
}
