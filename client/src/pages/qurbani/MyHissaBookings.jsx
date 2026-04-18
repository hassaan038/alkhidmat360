import { useEffect, useState } from 'react';
import { BookOpen, Calendar, MapPin, Image as ImageIcon, X, CheckCircle2, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FadeIn from '../../components/animations/FadeIn';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { SkeletonCard } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import PaymentPanel from '../../components/qurbani/PaymentPanel';
import * as qurbaniModuleService from '../../services/qurbaniModuleService';
import { cn, formatCurrency, formatDate, getStatusColor, formatApiError } from '../../lib/utils';
import { imageUrl } from '../../lib/imageUrl';
import { toast } from 'sonner';

function BookingRow({ booking, onOpenPayment }) {
  const listing = booking.listing || {};
  const img = imageUrl(listing.photoUrl);
  const total =
    parseFloat(booking.totalAmount ?? 0) ||
    (booking.hissaCount ?? 0) * parseFloat(listing.pricePerHissa ?? 0);

  const canMarkPaid = !booking.paymentMarked && booking.status === 'pending';

  return (
    <Card className="shadow-soft hover:shadow-medium transition-shadow duration-300">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row gap-5">
          {/* Photo */}
          <div className="w-full md:w-44 aspect-[4/3] md:aspect-square bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
            {img ? (
              <img src={img} alt={listing.name} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-400" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {listing.name || `Booking #${booking.id}`}
              </h3>
              <div className="flex items-center gap-2">
                {booking.paymentMarked ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium bg-info-light text-info-dark border-info">
                    <CheckCircle2 className="w-3 h-3" /> Payment Marked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium bg-gray-100 text-gray-600 border-gray-300">
                    <Clock className="w-3 h-3" /> Unpaid
                  </span>
                )}
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium capitalize',
                    getStatusColor(booking.status)
                  )}
                >
                  {booking.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600 mb-3">
              <div>
                <span className="text-gray-500">Hissas:</span>{' '}
                <span className="text-gray-900 font-medium">{booking.hissaCount}</span>
              </div>
              <div>
                <span className="text-gray-500">Total:</span>{' '}
                <span className="text-gray-900 font-medium">{formatCurrency(total)}</span>
              </div>
              {listing.pickupDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{formatDate(listing.pickupDate)}</span>
                </div>
              )}
              {listing.pickupLocation && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{listing.pickupLocation}</span>
                </div>
              )}
            </div>

            {canMarkPaid && (
              <Button
                size="sm"
                onClick={() => onOpenPayment(booking)}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                I&apos;ve Paid
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyHissaBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentFor, setPaymentFor] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await qurbaniModuleService.getMyBookings();
      setBookings(res.data?.bookings || []);
    } catch (error) {
      toast.error('Could not load bookings', {
        description: formatApiError(error),
      });
      setBookings([]);
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
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <FadeIn direction="down" delay={0}>
          <div className="mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Hissa Bookings</h1>
              <p className="text-gray-600 mt-1">Track your qurbani hissa bookings and payments</p>
            </div>
          </div>
        </FadeIn>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <FadeIn direction="up" delay={100}>
            <EmptyState
              title="No bookings yet"
              description="You haven't booked any hissas yet. Head to Qurbani Booking to book one."
            />
          </FadeIn>
        ) : (
          <div className="space-y-4">
            {bookings.map((b, idx) => (
              <FadeIn key={b.id} direction="up" delay={Math.min(idx * 60, 240)}>
                <BookingRow booking={b} onOpenPayment={setPaymentFor} />
              </FadeIn>
            ))}
          </div>
        )}

        {/* Payment modal */}
        {paymentFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-large w-full max-w-lg max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Complete Payment</h2>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {paymentFor.listing?.name || `Booking #${paymentFor.id}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPaymentFor(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <PaymentPanel
                  booking={paymentFor}
                  onMarkedPaid={() => {
                    // Refresh list then close after a tick
                    load();
                    setTimeout(() => setPaymentFor(null), 600);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
