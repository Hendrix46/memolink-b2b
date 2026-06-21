import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/ui';
import { paths } from '@/shared/config/paths';

export function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="font-mono text-[64px] font-semibold text-accent">404</div>
      <h1 className="mt-2 text-xl font-semibold">{t('notFound.title')}</h1>
      <p className="mt-2 max-w-sm text-[13.5px] text-text-secondary">{t('notFound.desc')}</p>
      <Button className="mt-6" variant="primary" onClick={() => navigate(paths.dashboard)}>
        {t('notFound.back')}
      </Button>
    </div>
  );
}
