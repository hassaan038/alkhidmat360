import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LifeBuoy, Check, X } from 'lucide-react';
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

export default function AdminDisasterRelief() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await extraDonationService.adminListDisasterDonations();
      setItems(res.data?.donations || []);
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
          icon={LifeBuoy}
          accent="disaster"
          title="Disaster Relief Donations"
          description="Read-only log of donations to disaster relief campaigns (auto-confirmed on payment)."
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
              icon={LifeBuoy}
              tone="disaster"
              title="No disaster donations yet"
              description="Donor submissions will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <Th>#</Th><Th>Donor</Th><Th>Campaign</Th><Th>Amount</Th>
                    <Th>Paid?</Th><Th>Screenshot</Th><Th>Status</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((d) => (
                    <tr key={d.id} className="transition-colors hover:bg-disaster-50/40 align-top">
                      <td className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">#{d.id}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900 dark:text-gray-50">{d.donorName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{d.donorPhone}</div>
                        {d.donorEmail && <div className="text-xs text-gray-500 dark:text-gray-400">{d.donorEmail}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900 dark:text-gray-50">{d.campaignLabel}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{d.campaignKey}</div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-50 tabular-nums">
                        {formatCurrency(d.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {d.paymentMarked ? (
                          <Check className="w-4 h-4 text-success-dark" aria-label="Paid" />
                        ) : (
                          <X className="w-4 h-4 text-gray-400 dark:text-gray-500" aria-label="Unpaid" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {d.paymentScreenshotUrl ? (
                          <a href={imageUrl(d.paymentScreenshotUrl)} target="_blank" rel="noopener noreferrer" className="inline-block overflow-hidden rounded border border-gray-200 dark:border-gray-800 transition hover:border-primary-300">
                            <img src={imageUrl(d.paymentScreenshotUrl)} alt="Payment" className="w-12 h-12 object-cover" />
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={d.status} size="sm" />
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
