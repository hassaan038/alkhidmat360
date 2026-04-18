import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ClipboardList, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FadeIn from '../../components/animations/FadeIn';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { SkeletonTable } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import * as qurbaniModuleService from '../../services/qurbaniModuleService';
import { cn, formatCurrency, formatDate, getStatusColor, formatApiError } from '../../lib/utils';
import { imageUrl } from '../../lib/imageUrl';

export default function QurbaniBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await qurbaniModuleService.adminListBookings();
      setBookings(res.data?.bookings || []);
    } catch (error) {
      toast.error('Failed to load bookings', { description: formatApiError(error) });
      setBookings([]);
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
      await qurbaniModuleService.adminUpdateBookingStatus(id, status);
      toast.success('Booking updated');
      load();
    } catch (error) {
      toast.error('Update failed', { description: formatApiError(error) });
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleExpand = (id) => setExpanded(expanded === id ? null : id);

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <FadeIn direction="up" delay={0}>
          <div className="mb-6 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Qurbani Bookings</h1>
              <p className="text-sm text-gray-600">Review hissa bookings and confirm payments</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={100}>
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <SkeletonTable rows={5} />
              ) : bookings.length === 0 ? (
                <EmptyState
                  title="No bookings yet"
                  description="Bookings will appear here as users reserve hissas."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listing</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hissas</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid?</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map((b) => {
                        const total =
                          parseFloat(b.totalAmount ?? 0) ||
                          (b.hissaCount ?? 0) * parseFloat(b.listing?.pricePerHissa ?? 0);
                        return (
                          <>
                            <tr key={b.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">#{b.id}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                <div className="font-medium text-gray-900">
                                  {b.user?.fullName || '—'}
                                </div>
                                <div className="text-xs text-gray-500">{b.user?.email}</div>
                                <div className="text-xs text-gray-500">{b.user?.phoneNumber}</div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                <div className="font-medium text-gray-900">
                                  {b.listing?.name || '—'}
                                </div>
                                {b.listing?.pickupLocation && (
                                  <div className="text-xs text-gray-500 line-clamp-1">
                                    {b.listing.pickupLocation}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{b.hissaCount}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {formatCurrency(total)}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {b.paymentMarked ? (
                                  <Check className="w-4 h-4 text-success-dark" aria-label="Paid" />
                                ) : (
                                  <X className="w-4 h-4 text-gray-400" aria-label="Unpaid" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {b.listing?.pickupDate ? formatDate(b.listing.pickupDate) : '—'}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={cn(
                                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium capitalize',
                                    getStatusColor(b.status)
                                  )}
                                >
                                  {b.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {b.status === 'pending' && (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleStatus(b.id, 'confirmed')}
                                      disabled={updatingId === b.id}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      <Check className="w-3 h-3 mr-1" /> Confirm
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleStatus(b.id, 'rejected')}
                                      disabled={updatingId === b.id}
                                      className="border-red-300 text-red-600 hover:bg-red-50"
                                    >
                                      <X className="w-3 h-3 mr-1" /> Reject
                                    </Button>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(b.id)}
                                  className="text-gray-400 hover:text-gray-600"
                                  aria-label="Expand row"
                                >
                                  {expanded === b.id ? (
                                    <ChevronUp className="w-5 h-5" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5" />
                                  )}
                                </button>
                              </td>
                            </tr>
                            {expanded === b.id && (
                              <tr key={`${b.id}-details`}>
                                <td colSpan={10} className="px-4 py-4 bg-gray-50">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1 text-sm text-gray-800">
                                      <div>
                                        <span className="text-gray-500">Notes:</span>{' '}
                                        {b.notes || '—'}
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Created:</span>{' '}
                                        {b.createdAt
                                          ? new Date(b.createdAt).toLocaleString()
                                          : '—'}
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Payment marked:</span>{' '}
                                        {b.paymentMarked ? 'Yes' : 'No'}
                                      </div>
                                    </div>
                                    {b.paymentScreenshotUrl && (
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">
                                          Payment screenshot
                                        </p>
                                        <a
                                          href={imageUrl(b.paymentScreenshotUrl)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <img
                                            src={imageUrl(b.paymentScreenshotUrl)}
                                            alt="Payment screenshot"
                                            className="w-full max-w-xs h-40 object-contain rounded-lg border border-gray-200 bg-white hover:opacity-90 transition"
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
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </DashboardLayout>
  );
}
