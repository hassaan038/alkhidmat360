import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Coins, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Input';
import { SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import * as zakatService from '../../services/zakatService';
import { formatCurrency, formatApiError } from '../../lib/utils';
import { imageUrl } from '../../lib/imageUrl';
import { useTranslation } from 'react-i18next';

const STATUS_OPTIONS = ['pending', 'under_review', 'approved', 'rejected'];

export default function AdminZakatApplications() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await zakatService.adminListZakatApplications();
      setItems(res.data?.applications || []);
    } catch (err) {
      toast.error(t('zakatApplication.failedToLoad'), { description: formatApiError(err) });
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
      await zakatService.adminUpdateZakatApplicationStatus(id, status);
      toast.success(t('table.statusUpdated'));
      load();
    } catch (err) {
      toast.error(t('table.statusUpdateFailed'), { description: formatApiError(err) });
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleExpand = (id) => setExpanded(expanded === id ? null : id);

  return (
    <DashboardLayout>
      <PageContainer className="space-y-6">
        <PageHeader
          icon={Coins}
          accent="zakat"
          title={t('adminZakat.applicationsTitle')}
          description={t('adminZakat.applicationsDesc')}
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
                  icon={Coins}
                  tone="zakat"
                  title={t('zakatApplication.noApplications')}
                  description={t('zakatApplication.noApplicationsDesc')}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur border-b border-gray-200 dark:border-gray-800">
                      <tr>
                        <Th>#</Th><Th>{t('zakatApplication.applicantName')}</Th><Th>{t('settings.cnic')}</Th>
                        <Th>{t('zakatApplication.familyMembers')}</Th><Th>{t('zakatApplication.monthlyIncome')}</Th><Th>{t('common.status')}</Th><Th></Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((a) => {
                        const cnicDoc = imageUrl(a.cnicDocumentUrl);
                        return (
                          <>
                            <tr key={a.id} className="transition-colors hover:bg-zakat-50/40 align-top">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-50">#{a.id}</td>
                              <td className="px-4 py-3 text-sm">
                                <div className="font-medium text-gray-900 dark:text-gray-50">{a.applicantName}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{a.applicantPhone}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{a.user?.email}</div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                {a.applicantCNIC}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-50">{a.familyMembers}</td>
                              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                {formatCurrency(a.monthlyIncome)}
                                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                  {a.employmentStatus.replace('-', ' ')}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Select
                                  value={a.status}
                                  onChange={(e) => handleStatus(a.id, e.target.value)}
                                  disabled={updatingId === a.id}
                                  className="h-8 text-xs capitalize w-[140px]"
                                >
                                  {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s} className="capitalize">
                                      {s.replace('_', ' ')}
                                    </option>
                                  ))}
                                </Select>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(a.id)}
                                  className="rounded-md p-1 text-gray-400 dark:text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
                                  aria-label={t('common.view')}
                                >
                                  {expanded === a.id ? (
                                    <ChevronUp className="w-5 h-5" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5" />
                                  )}
                                </button>
                              </td>
                            </tr>
                            {expanded === a.id && (
                              <tr key={`${a.id}-details`}>
                                <td colSpan={7} className="px-4 py-4 bg-gray-50 dark:bg-gray-900">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1 text-gray-800 dark:text-gray-100">
                                      <div>
                                        <span className="text-gray-500 dark:text-gray-400">{t('common.address')}:</span>{' '}
                                        {a.applicantAddress}
                                      </div>
                                      <div>
                                        <span className="text-gray-500 dark:text-gray-400">{t('zakatApplication.housingStatus')}:</span>{' '}
                                        <span className="capitalize">{a.housingStatus}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500 dark:text-gray-400">{t('zakatApplication.disabilityDetails')}:</span>{' '}
                                        {a.hasDisabledMembers
                                          ? `${t('common.yes')} — ${a.disabilityDetails || '—'}`
                                          : t('common.no')}
                                      </div>
                                      <div>
                                        <span className="text-gray-500 dark:text-gray-400">{t('zakatApplication.amountRequested')}:</span>{' '}
                                        {a.amountRequested
                                          ? formatCurrency(a.amountRequested)
                                          : '—'}
                                      </div>
                                      <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                                        <div className="text-gray-500 dark:text-gray-400 mb-0.5">{t('zakatApplication.reasonForApplication')}:</div>
                                        <p className="text-gray-800 dark:text-gray-100">{a.reasonForApplication}</p>
                                      </div>
                                      {a.additionalNotes && (
                                        <div>
                                          <span className="text-gray-500 dark:text-gray-400">{t('common.notes')}:</span>{' '}
                                          {a.additionalNotes}
                                        </div>
                                      )}
                                      <div className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                                        {a.createdAt
                                          ? new Date(a.createdAt).toLocaleString()
                                          : '—'}
                                      </div>
                                    </div>
                                    {cnicDoc && (
                                      <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('zakatApplication.cnicDocument')}</p>
                                        <a href={cnicDoc} target="_blank" rel="noopener noreferrer">
                                          <img
                                            src={cnicDoc}
                                            alt={t('settings.cnic')}
                                            className="w-full max-w-sm h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-800 hover:opacity-90 transition"
                                          />
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
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
