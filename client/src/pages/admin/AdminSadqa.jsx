import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Heart, Check, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import * as extraDonationService from '../../services/extraDonationService';
import { formatCurrency, formatApiError } from '../../lib/utils';
import { imageUrl } from '../../lib/imageUrl';

export default function AdminSadqa() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await extraDonationService.adminListSadqas();
      setItems(res.data?.sadqas || []);
    } catch (err) {
      toast.error('Failed to load donations', { description: formatApiError(err) });
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  return (
    <DashboardLayout>
      <PageContainer className="space-y-6">
        <PageHeader
          icon={Heart}
          accent="sadqa"
          title="Sadqa Donations"
          description="Read-only log of general sadqa donations (auto-confirmed on payment)."
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
              icon={Heart}
              tone="sadqa"
              title="No sadqa donations yet"
              description="Donor submissions will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur border-b border-gray-200">
                  <tr>
                    <Th>#</Th><Th>Donor</Th><Th>Amount</Th><Th>Purpose</Th>
                    <Th>Paid?</Th><Th>Screenshot</Th><Th>Status</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-sadqa-50/40 align-top">
                      <td className="px-4 py-3 text-sm font-medium text-gray-600">#{s.id}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">{s.donorName}</div>
                        <div className="text-xs text-gray-500">{s.donorPhone}</div>
                        {s.donorEmail && <div className="text-xs text-gray-500">{s.donorEmail}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 tabular-nums">
                        {formatCurrency(s.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{s.purpose || '—'}</td>
                      <td className="px-4 py-3 text-sm">
                        {s.paymentMarked ? (
                          <Check className="w-4 h-4 text-success-dark" aria-label="Paid" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400" aria-label="Unpaid" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {s.paymentScreenshotUrl ? (
                          <a href={imageUrl(s.paymentScreenshotUrl)} target="_blank" rel="noopener noreferrer" className="inline-block overflow-hidden rounded border border-gray-200 transition hover:border-primary-300">
                            <img src={imageUrl(s.paymentScreenshotUrl)} alt="Payment" className="w-12 h-12 object-cover" />
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={s.status} size="sm" />
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
    <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  );
}
