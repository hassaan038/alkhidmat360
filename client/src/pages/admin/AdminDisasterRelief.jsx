import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LifeBuoy, Check, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FadeIn from '../../components/animations/FadeIn';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { SkeletonTable } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import * as extraDonationService from '../../services/extraDonationService';
import { cn, formatCurrency, getStatusColor, formatApiError } from '../../lib/utils';
import { imageUrl } from '../../lib/imageUrl';

export default function AdminDisasterRelief() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

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

  const handleStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await extraDonationService.adminUpdateDisasterDonationStatus(id, status);
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
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <FadeIn direction="down" delay={0}>
          <div className="mb-8 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg flex items-center justify-center">
              <LifeBuoy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Disaster Relief Donations</h1>
              <p className="text-sm text-gray-600">
                Confirm or reject donations to disaster relief campaigns.
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={100}>
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">All Donations</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <SkeletonTable rows={5} />
              ) : items.length === 0 ? (
                <EmptyState
                  title="No disaster donations yet"
                  description="Donor submissions will appear here."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid?</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Screenshot</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((d) => (
                        <tr key={d.id} className="hover:bg-gray-50 align-top">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">#{d.id}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium text-gray-900">{d.donorName}</div>
                            <div className="text-xs text-gray-500">{d.donorPhone}</div>
                            {d.donorEmail && (
                              <div className="text-xs text-gray-500">{d.donorEmail}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium text-gray-900">{d.campaignLabel}</div>
                            <div className="text-xs text-gray-500">{d.campaignKey}</div>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            {formatCurrency(d.amount)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {d.paymentMarked ? (
                              <span className="text-success-dark font-semibold">✓</span>
                            ) : (
                              <span className="text-gray-400">✗</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {d.paymentScreenshotUrl ? (
                              <a
                                href={imageUrl(d.paymentScreenshotUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={imageUrl(d.paymentScreenshotUrl)}
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
                                getStatusColor(d.status)
                              )}
                            >
                              {d.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {d.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleStatus(d.id, 'confirmed')}
                                  disabled={updatingId === d.id}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Check className="w-3 h-3 mr-1" /> Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatus(d.id, 'rejected')}
                                  disabled={updatingId === d.id}
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <X className="w-3 h-3 mr-1" /> Reject
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
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </DashboardLayout>
  );
}
