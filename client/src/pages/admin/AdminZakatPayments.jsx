import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Coins, Check, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import * as zakatService from '../../services/zakatService';
import { formatCurrency, formatApiError } from '../../lib/utils';
import { imageUrl } from '../../lib/imageUrl';

export default function AdminZakatPayments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await zakatService.adminListZakatPayments();
      setItems(res.data?.payments || []);
    } catch (err) {
      toast.error('Failed to load zakat payments', { description: formatApiError(err) });
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
      await zakatService.adminUpdateZakatPaymentStatus(id, status);
      toast.success('Status updated');
      load();
    } catch (err) {
      toast.error('Update failed', { description: formatApiError(err) });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <DashboardLayout>
      <PageContainer className="space-y-6">
        <PageHeader
          icon={Coins}
          accent="zakat"
          title="Zakat Payments"
          description="Verify the bank transfer (use the screenshot if attached) and Confirm or Reject."
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
                  title="No zakat payments yet"
                  description="Donor submissions will appear here."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur border-b border-gray-200 dark:border-gray-800">
                      <tr>
                        <Th>#</Th><Th>Donor</Th><Th>Wealth</Th><Th>Nisab</Th>
                        <Th>Zakat</Th><Th>Paid?</Th><Th>Screenshot</Th><Th>Status</Th><Th>Actions</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((p) => (
                        <tr key={p.id} className="transition-colors hover:bg-zakat-50/40 align-top">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-50">#{p.id}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium text-gray-900 dark:text-gray-50">{p.user?.fullName || '—'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{p.user?.email}</div>
                            {p.contactPhone && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">{p.contactPhone}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                            {formatCurrency(p.totalWealth)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 capitalize">
                            {p.nisabBasis} · {formatCurrency(p.nisabThreshold)}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-50">
                            {formatCurrency(p.zakatAmount)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {p.paymentMarked ? (
                              <Check className="w-4 h-4 text-success-dark" aria-label="Paid" />
                            ) : (
                              <X className="w-4 h-4 text-gray-400 dark:text-gray-500" aria-label="Unpaid" />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {p.paymentScreenshotUrl ? (
                              <a
                                href={imageUrl(p.paymentScreenshotUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={imageUrl(p.paymentScreenshotUrl)}
                                  alt="Payment"
                                  className="w-12 h-12 object-cover rounded border border-gray-200 dark:border-gray-800 hover:opacity-80 transition"
                                />
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={p.status} size="sm" />
                          </td>
                          <td className="px-4 py-3">
                            {p.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button size="sm" variant="success" leftIcon={Check} onClick={() => handleStatus(p.id, 'confirmed')} disabled={updatingId === p.id}>
                                  Confirm
                                </Button>
                                <Button size="sm" variant="outline" leftIcon={X} onClick={() => handleStatus(p.id, 'rejected')} disabled={updatingId === p.id} className="border-error/40 text-error-dark hover:bg-error-light/60">
                                  Reject
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
