import { useTranslation } from 'react-i18next';

import { Modal } from '@/shared/ui';
import { CreateOrgForm } from './create-org-form';

export interface CreateOrgModalProps {
  open: boolean;
  onClose: () => void;
}

/** Create-organization dialog opened from the workspace switcher. */
export function CreateOrgModal({ open, onClose }: CreateOrgModalProps) {
  const { t } = useTranslation();
  return (
    <Modal open={open} onClose={onClose} title={t('orgCreate.title')} description={t('orgCreate.subtitle')}>
      <CreateOrgForm onDone={onClose} autoFocus />
    </Modal>
  );
}
