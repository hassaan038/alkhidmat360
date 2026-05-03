import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Settings, Power, Save, Banknote } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import FormSection, { FormField } from '../../components/ui/FormSection';
import Button from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import * as systemConfigService from '../../services/systemConfigService';
import useQurbaniModuleStore from '../../store/qurbaniModuleStore';
import { formatApiError, cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';

export default function QurbaniModuleSettings() {
  const { t } = useTranslation();
  const refreshFlag = useQurbaniModuleStore((s) => s.refreshFlag);

  const [enabled, setEnabled] = useState(false);
  const [bankDetails, setBankDetails] = useState('');
  const [loadingFlag, setLoadingFlag] = useState(true);
  const [loadingBank, setLoadingBank] = useState(true);
  const [savingFlag, setSavingFlag] = useState(false);
  const [savingBank, setSavingBank] = useState(false);

  useEffect(() => {
    systemConfigService
      .getQurbaniModuleFlag()
      .then((res) => setEnabled(!!res.data?.enabled))
      .catch((err) => toast.error(t('table.statusUpdateFailed'), { description: formatApiError(err) }))
      .finally(() => setLoadingFlag(false));

    systemConfigService
      .getBankDetails()
      .then((res) => setBankDetails(res.data?.bankDetails || ''))
      .catch((err) => toast.error(t('table.statusUpdateFailed'), { description: formatApiError(err) }))
      .finally(() => setLoadingBank(false));
  }, [t]);

  const handleToggle = async () => {
    const next = !enabled;
    setSavingFlag(true);
    try {
      await systemConfigService.updateQurbaniModuleFlag(next);
      setEnabled(next);
      toast.success(next ? t('qurbaniSettings.moduleEnabled') : t('qurbaniSettings.moduleDisabled'));
      await refreshFlag();
    } catch (error) {
      toast.error(t('table.statusUpdateFailed'), { description: formatApiError(error) });
    } finally {
      setSavingFlag(false);
    }
  };

  const handleSaveBank = async () => {
    setSavingBank(true);
    try {
      await systemConfigService.updateBankDetails(bankDetails);
      toast.success(t('table.statusUpdated'));
    } catch (error) {
      toast.error(t('table.statusUpdateFailed'), { description: formatApiError(error) });
    } finally {
      setSavingBank(false);
    }
  };

  return (
    <DashboardLayout>
      <PageContainer className="max-w-3xl space-y-6">
        <PageHeader
          icon={Settings}
          accent="qurbani"
          title={t('qurbaniSettings.title')}
          description={t('qurbaniSettings.description')}
          meta={
            !loadingFlag && (
              <Badge variant={enabled ? 'success' : 'neutral'} size="sm" dot>
                {enabled ? t('qurbaniSettings.moduleEnabled') : t('qurbaniSettings.moduleDisabled')}
              </Badge>
            )
          }
        />

        <FormSection title={t('qurbaniSettings.moduleStatus')} icon={Power}>
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/60">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('qurbaniSettings.moduleStatus')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {loadingFlag ? t('common.loading') : enabled ? t('qurbaniSettings.moduleEnabled') : t('qurbaniSettings.moduleDisabled')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggle}
              disabled={loadingFlag || savingFlag}
              aria-label={t('qurbaniSettings.moduleStatus')}
              aria-pressed={enabled}
              className={cn(
                'relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-qurbani-500 focus-visible:ring-offset-2 cursor-pointer disabled:opacity-50',
                enabled ? 'bg-qurbani-600' : 'bg-gray-300'
              )}
            >
              <span
                className={cn(
                  'inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-900 shadow transition-transform',
                  enabled ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        </FormSection>

        <FormSection title={t('qurbaniSettings.bankDetails')} icon={Banknote}>
          {loadingBank ? (
            <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ) : (
            <>
              <FormField label={t('qurbaniSettings.bankDetails')} htmlFor="bd">
                <Textarea
                  id="bd"
                  value={bankDetails}
                  onChange={(e) => setBankDetails(e.target.value)}
                  rows={8}
                  placeholder={`Bank: Meezan Bank\nAccount Title: Alkhidmat Foundation\nAccount #: 01234567890\nIBAN: PK00MEZN0001234567890`}
                  className="font-mono text-sm"
                />
              </FormField>
              <div className="flex justify-end mt-4">
                <Button type="button" leftIcon={Save} loading={savingBank} onClick={handleSaveBank}>
                  {t('qurbaniSettings.saveBankDetails')}
                </Button>
              </div>
            </>
          )}
        </FormSection>
      </PageContainer>
    </DashboardLayout>
  );
}
