import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ClipboardList, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import * as qurbaniModuleService from '../../services/qurbaniModuleService';
import { formatCurrency, formatDate, formatApiError } from '../../lib/utils';
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
      <PageContainer className="space-y-6">
        <PageHeader
          icon={ClipboardList}
          accent="qurbani"
          title="Qurbani Bookings"
          description="Review hissa bookings and confirm payments."
        />

          <Card className="overflow-hidden">
              {loading ? (
                <div className="p-5 space-y-2">
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </div>
              ) : bookings.length === 0 ? (
                <EmptyState
                  icon={ClipboardList}
                  tone="qurbani"
                  title="No bookings yet"
                  description="Bookings will appear here as users reserve hissas."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur border-b border-gray-200">
                      <tr>
                        <Th>#</Th><Th>User</Th><Th>Listing</Th>
                        <Th>Hissas</Th><Th>Amount</Th><Th>Paid?</Th>
                        <Th>Pickup</Th><Th>Status</Th><Th>Actions</Th><Th></Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookings.map((b) => {
                        const total =
                          parseFloat(b.totalAmount ?? 0) ||
                          (b.hissaCount ?? 0) * parseFloat(b.listing?.pricePerHissa ?? 0);
                        return (
                          <>
                            <tr key={b.id} className="transition-colors hover:bg-qurbani-50/40">
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
                                <StatusBadge status={b.status} size="sm" />
                              </td>
                              <td className="px-4 py-3">
                                {b.status === 'pending' && (
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="success" leftIcon={Check} onClick={() => handleStatus(b.id, 'confirmed')} disabled={updatingId === b.id}>
                                      Confirm
                                    </Button>
                                    <Button size="sm" variant="outline" leftIcon={X} onClick={() => handleStatus(b.id, 'rejected')} disabled={updatingId === b.id} className="border-error/40 text-error-dark hover:bg-error-light/60">
                                      Reject
                                    </Button>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(b.id)}
                                  className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
                                  aria-label={expanded === b.id ? 'Collapse row' : 'Expand row'}
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
