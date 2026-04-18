import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Coins } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FadeIn from '../../components/animations/FadeIn';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { SkeletonTable } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import * as zakatService from '../../services/zakatService';
import { cn, formatCurrency, getStatusColor, formatApiError } from '../../lib/utils';
import { imageUrl } from '../../lib/imageUrl';

export default function AdminZakatPayments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <FadeIn direction="down" delay={0}>
          <div className="mb-8 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Zakat Payments</h1>
              <p className="text-sm text-gray-600">
                A read-only log of donor zakat payments. Wealth breakdown captured at submission
                is preserved on the record. No approval action needed — payments auto-confirm.
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={100}>
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">All Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <SkeletonTable rows={5} />
              ) : items.length === 0 ? (
                <EmptyState
                  title="No zakat payments yet"
                  description="Donor submissions will appear here."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wealth</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nisab</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zakat</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid?</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Screenshot</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 align-top">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">#{p.id}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium text-gray-900">{p.user?.fullName || '—'}</div>
                            <div className="text-xs text-gray-500">{p.user?.email}</div>
                            {p.contactPhone && (
                              <div className="text-xs text-gray-500">{p.contactPhone}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {formatCurrency(p.totalWealth)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 capitalize">
                            {p.nisabBasis} · {formatCurrency(p.nisabThreshold)}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            {formatCurrency(p.zakatAmount)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {p.paymentMarked ? (
                              <span className="text-success-dark font-semibold">✓</span>
                            ) : (
                              <span className="text-gray-400">✗</span>
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
                                  className="w-12 h-12 object-cover rounded border border-gray-200 hover:opacity-80 transition"
                                />
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium capitalize',
                                getStatusColor(p.status)
                              )}
                            >
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </DashboardLayout>
  );
}
