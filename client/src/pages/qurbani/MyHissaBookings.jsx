import { useEffect, useState } from 'react';
import { BookOpen, Calendar, MapPin, Image as ImageIcon, CheckCircle2, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge, { StatusBadge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { SkeletonStatCard } from '../../components/ui/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import PaymentPanel from '../../components/qurbani/PaymentPanel';
import * as qurbaniModuleService from '../../services/qurbaniModuleService';
import { formatCurrency, formatDate, formatApiError } from '../../lib/utils';
import { imageUrl } from '../../lib/imageUrl';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

function BookingRow({ booking, onOpenPayment }) {
  const { t } = useTranslation();
  const listing = booking.listing || {};
  const img = imageUrl(listing.photoUrl);
  const total = parseFloat(booking.totalAmount ?? 0) || (booking.hissaCount ?? 0) * parseFloat(listing.pricePerHissa ?? 0);
  const canMarkPaid = !booking.paymentMarked && booking.status === 'pending';

  return (
    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row gap-5">
          <div className="w-full md:w-44 aspect-[4/3] md:aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
            {img ? (
              <img src={img} alt={listing.name} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 truncate">
                {listing.name || `${t('hissaBookings.listing')} #${booking.id}`}
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                {booking.paymentMarked ? (
                  <Badge variant="info" size="sm" icon={CheckCircle2}>{t('payment.paymentMarked')}</Badge>
                ) : (
                  <Badge variant="neutral" size="sm" icon={Clock}>{t('donation.paymentPending')}</Badge>
                )}
                <StatusBadge status={booking.status} size="sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <div>
                <span className="text-gray-500 dark:text-gray-400">{t('hissaBookings.hissas')}:</span>{' '}
                <span className="text-gray-900 dark:text-gray-50 font-medium tabular-nums">{booking.hissaCount}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">{t('common.total')}:</span>{' '}
                <span className="text-gray-900 dark:text-gray-50 font-medium tabular-nums">{formatCurrency(total)}</span>
              </div>
              {listing.pickupDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span>{formatDate(listing.pickupDate)}</span>
                </div>
              )}
              {listing.pickupLocation && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span className="truncate">{listing.pickupLocation}</span>
                </div>
              )}
            </div>

            {canMarkPaid && (
              <Button size="sm" variant="success" leftIcon={CheckCircle2} onClick={() => onOpenPayment(booking)}>
                {t('donation.ivePayd')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyHissaBookings() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentFor, setPaymentFor] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await qurbaniModuleService.getMyBookings();
      setBookings(res.data?.bookings || []);
    } catch (error) {
      toast.error(t('hissaBookings.noBookings'), { description: formatApiError(error) });
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
          title={t('hissaBookings.title')}
          description={t('hissaBookings.description')}
        />

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (<SkeletonStatCard key={i} />))}
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            tone="qurbani"
            title={t('hissaBookings.noBookingsTitle')}
            description={t('hissaBookings.noBookingsDesc')}
            action={{ label: t('common.view'), href: '/dashboard/user/qurbani-module' }}
          />
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (<BookingRow key={b.id} booking={b} onOpenPayment={setPaymentFor} />))}
          </div>
        )}

        <Modal
          open={!!paymentFor}
          onClose={() => setPaymentFor(null)}
          title={t('payment.title')}
          description={paymentFor?.listing?.name || (paymentFor ? `${t('hissaBookings.listing')} #${paymentFor.id}` : undefined)}
          size="md"
        >
          {paymentFor && (
            <PaymentPanel
              booking={paymentFor}
              onMarkedPaid={() => { load(); setTimeout(() => setPaymentFor(null), 600); }}
            />
          )}
        </Modal>
      </PageContainer>
    </DashboardLayout>
  );
}
