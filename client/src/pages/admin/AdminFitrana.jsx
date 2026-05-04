import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { HandCoins, Check, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import * as fitranaService from '../../services/fitranaService';
import { formatCurrency, formatApiError } from '../../lib/utils';
import { imageUrl } from '../../lib/imageUrl';
import { useTranslation } from 'react-i18next';

export default function AdminFitrana() {
  const { t } = useTranslation();
  const BASIS_LABEL = {
    wheat: t('fitrana.wheat'),
    barley: t('fitrana.barley'),
    dates: t('fitrana.dates'),
    raisins: t('fitrana.raisins'),
    alkhidmat: t('fitrana.alkhidmat'),
    custom: t('fitrana.custom'),
  };
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fitranaService.adminListFitranas();
      setItems(res.data?.fitranas || []);
    } catch (err) {
      toast.error(t('fitrana.failedToLoad'), { description: formatApiError(err) });
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const handleStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await fitranaService.adminUpdateFitranaStatus(id, status);
      const email = items.find((r) => r.id === id)?.user?.email;
      toast.success(
        t('table.statusUpdated'),
        email ? { description: t('table.emailSentTo', { email }) } : undefined,
      );
      load();
    } catch (err) {
      toast.error(t('table.statusUpdateFailed'), { description: formatApiError(err) });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <DashboardLayout>
      <PageContainer className="space-y-6">
        <PageHeader
          icon={HandCoins}
          accent="zakat"
          title={t('adminFitrana.title')}
          description={t('adminFitrana.description')}
        />

          <Card className="overflow-hidden">
              {loading ? (
                <div className="p-5 space-y-2">
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </div>
              ) : items.length === 0 ? (
                <EmptyState
                  icon={HandCoins}
                  tone="zakat"
                  title={t('fitrana.noSubmissions')}
                  description={t('fitrana.noSubmissionsDesc')}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur border-b border-gray-200 dark:border-gray-800">
                      <tr>
                        <Th>#</Th><Th>{t('common.name')}</Th><Th>{t('fitrana.people')}</Th><Th>{t('fitrana.calculationBasis')}</Th>
                        <Th>{t('fitrana.amountPerPerson')}</Th><Th>{t('common.total')}</Th><Th>{t('sadqa.paid')}</Th>
                        <Th>{t('payment.screenshotOptional')}</Th><Th>{t('common.status')}</Th><Th>{t('common.actions')}</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((f) => (
                        <tr key={f.id} className="transition-colors hover:bg-zakat-50/40">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-50">#{f.id}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium text-gray-900 dark:text-gray-50">
                              {f.user?.fullName || '—'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{f.user?.email}</div>
                            {f.contactPhone && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">{f.contactPhone}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-50">{f.numberOfPeople}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                            {BASIS_LABEL[f.calculationBasis] || f.calculationBasis}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                            {formatCurrency(f.amountPerPerson)}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-50">
                            {formatCurrency(f.totalAmount)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {f.paymentMarked ? (
                              <Check className="w-4 h-4 text-success-dark" aria-label={t('sadqa.paid')} />
                            ) : (
                              <X className="w-4 h-4 text-gray-400 dark:text-gray-500" aria-label={t('donation.paymentPending')} />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {f.paymentScreenshotUrl ? (
                              <a
                                href={imageUrl(f.paymentScreenshotUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={t('common.view')}
                              >
                                <img
                                  src={imageUrl(f.paymentScreenshotUrl)}
                                  alt={t('payment.screenshotOptional')}
                                  className="w-12 h-12 object-cover rounded border border-gray-200 dark:border-gray-800 hover:opacity-80 transition"
                                />
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={f.status} size="sm" />
                          </td>
                          <td className="px-4 py-3">
                            {f.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button size="sm" variant="success" leftIcon={Check} onClick={() => handleStatus(f.id, 'confirmed')} disabled={updatingId === f.id}>
                                  {t('common.confirm')}
                                </Button>
                                <Button size="sm" variant="outline" leftIcon={X} onClick={() => handleStatus(f.id, 'rejected')} disabled={updatingId === f.id} className="border-error/40 text-error-dark hover:bg-error-light/60">
                                  {t('common.reject')}
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </Card>
      </PageContainer>
    </DashboardLayout>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  );
}
