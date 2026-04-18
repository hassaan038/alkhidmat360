import { useEffect, useState } from 'react';
import { BookOpen, Calendar, MapPin, Image as ImageIcon, X, CheckCircle2, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge, { StatusBadge } from '../../components/ui/Badge';
import { SkeletonStatCard } from '../../components/ui/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import PaymentPanel from '../../components/qurbani/PaymentPanel';
import * as qurbaniModuleService from '../../services/qurbaniModuleService';
import { formatCurrency, formatDate, formatApiError } from '../../lib/utils';
import { imageUrl } from '../../lib/imageUrl';
import { toast } from 'sonner';

function BookingRow({ booking, onOpenPayment }) {
  const listing = booking.listing || {};
  const img = imageUrl(listing.photoUrl);
  const total = parseFloat(booking.totalAmount ?? 0) || (booking.hissaCount ?? 0) * parseFloat(listing.pricePerHissa ?? 0);
  const canMarkPaid = !booking.paymentMarked && booking.status === 'pending';

  return (
    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row gap-5">
          <div className="w-full md:w-44 aspect-[4/3] md:aspect-square bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
            {img ? (
              <img src={img} alt={listing.name} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {listing.name || `Booking #${booking.id}`}
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                {booking.paymentMarked ? (
                  <Badge variant="info" size="sm" icon={CheckCircle2}>Payment marked</Badge>
                ) : (
                  <Badge variant="neutral" size="sm" icon={Clock}>Unpaid</Badge>
                )}
                <StatusBadge status={booking.status} size="sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600 mb-3">
              <div>
                <span className="text-gray-500">Hissas:</span>{' '}
                <span className="text-gray-900 font-medium tabular-nums">{booking.hissaCount}</span>
              </div>
              <div>
                <span className="text-gray-500">Total:</span>{' '}
                <span className="text-gray-900 font-medium tabular-nums">{formatCurrency(total)}</span>
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
              <Button size="sm" variant="success" leftIcon={CheckCircle2} onClick={() => onOpenPayment(booking)}>
                I&apos;ve paid
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
      toast.error('Could not load bookings', { description: formatApiError(error) });
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
      <PageContainer className="max-w-5xl space-y-6">
        <PageHeader
          icon={BookOpen}
          accent="qurbani"
          title="My Hissa Bookings"
          description="Track your qurbani hissa bookings and complete payments."
        />

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (<SkeletonStatCard key={i} />))}
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            tone="qurbani"
            title="No bookings yet"
            description="You haven't booked any hissas yet. Head to Qurbani Booking to book one."
            action={{ label: 'Browse listings', href: '/dashboard/user/qurbani-module' }}
          />
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (<BookingRow key={b.id} booking={b} onOpenPayment={setPaymentFor} />))}
          </div>
        )}

        {paymentFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-large w-full max-w-lg max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Complete payment</h2>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {paymentFor.listing?.name || `Booking #${paymentFor.id}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPaymentFor(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
                  aria-label="Close payment panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <PaymentPanel
                  booking={paymentFor}
                  onMarkedPaid={() => { load(); setTimeout(() => setPaymentFor(null), 600); }}
                />
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </DashboardLayout>
  );
}
