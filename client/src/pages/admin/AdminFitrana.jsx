import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { HandCoins, Check, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FadeIn from '../../components/animations/FadeIn';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { SkeletonTable } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import * as fitranaService from '../../services/fitranaService';
import { cn, formatCurrency, getStatusColor, formatApiError } from '../../lib/utils';

const BASIS_LABEL = {
  wheat: 'Wheat',
  barley: 'Barley',
  dates: 'Dates',
  raisins: 'Raisins',
  alkhidmat: 'Alkhidmat',
  custom: 'Custom',
};

export default function AdminFitrana() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fitranaService.adminListFitranas();
      setItems(res.data?.fitranas || []);
    } catch (err) {
      toast.error('Failed to load fitrana submissions', { description: formatApiError(err) });
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
              <HandCoins className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fitrana Submissions</h1>
              <p className="text-sm text-gray-600">
                Confirm or reject fitrana payments. Per-person amount and basis used at the time
                of submission are preserved.
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={100}>
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">All Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <SkeletonTable rows={5} />
              ) : items.length === 0 ? (
                <EmptyState
                  title="No fitrana submissions yet"
                  description="Submissions from users will appear here."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">People</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basis</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Per Person</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid?</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((f) => (
                        <tr key={f.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">#{f.id}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium text-gray-900">
                              {f.user?.fullName || '—'}
                            </div>
                            <div className="text-xs text-gray-500">{f.user?.email}</div>
                            {f.contactPhone && (
                              <div className="text-xs text-gray-500">{f.contactPhone}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{f.numberOfPeople}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {BASIS_LABEL[f.calculationBasis] || f.calculationBasis}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {formatCurrency(f.amountPerPerson)}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            {formatCurrency(f.totalAmount)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {f.paymentMarked ? (
                              <span className="text-success-dark font-semibold">✓</span>
                            ) : (
                              <span className="text-gray-400">✗</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium capitalize',
                                getStatusColor(f.status)
                              )}
                            >
                              {f.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {f.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleStatus(f.id, 'confirmed')}
                                  disabled={updatingId === f.id}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Check className="w-3 h-3 mr-1" /> Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatus(f.id, 'rejected')}
                                  disabled={updatingId === f.id}
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
