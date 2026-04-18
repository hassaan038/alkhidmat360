import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, Banknote } from 'lucide-react';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import PaymentScreenshotPicker from './PaymentScreenshotPicker';
import * as systemConfigService from '../../services/systemConfigService';
import * as qurbaniModuleService from '../../services/qurbaniModuleService';
import { formatCurrency, formatApiError } from '../../lib/utils';

/**
 * PaymentPanel — fetches bank details and lets the user mark a booking as paid.
 *
 * Props:
 *  - booking: { id, totalAmount, hissaCount, paymentMarked, listing? }
 *  - onMarkedPaid: (updatedBooking) => void
 */
export default function PaymentPanel({ booking, onMarkedPaid }) {
  const [bankDetails, setBankDetails] = useState('');
  const [loadingBank, setLoadingBank] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [marked, setMarked] = useState(!!booking?.paymentMarked);
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingBank(true);
    systemConfigService
      .getBankDetails()
      .then((res) => {
        if (!active) return;
        setBankDetails(res.data?.bankDetails || '');
      })
      .catch(() => {
        if (!active) return;
        setBankDetails('');
      })
      .finally(() => {
        if (active) setLoadingBank(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMarked(!!booking?.paymentMarked);
  }, [booking?.paymentMarked]);

  const handleScreenshotChange = (file) => {
    setScreenshot(file);
    setScreenshotPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  const handleMarkPaid = async () => {
    if (!booking?.id) return;
    setSubmitting(true);
    try {
      const res = await qurbaniModuleService.markBookingPaid(booking.id, screenshot);
      setMarked(true);
      toast.success('Payment marked', {
        description: 'Awaiting admin confirmation.',
      });
      onMarkedPaid?.(res.data?.booking);
    } catch (error) {
      toast.error('Failed to mark as paid', {
        description: formatApiError(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const total = booking
    ? parseFloat(booking.totalAmount ?? 0) ||
      (booking.hissaCount ?? 0) * parseFloat(booking.listing?.pricePerHissa ?? 0)
    : 0;

  return (
    <div className="space-y-4">
      {/* Total */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <p className="text-xs uppercase tracking-wide text-primary-700 font-semibold mb-1">
          Total Amount Due
        </p>
        <p className="text-3xl font-bold text-primary-900">
          {formatCurrency(total)}
        </p>
        {booking?.hissaCount && (
          <p className="text-xs text-primary-700 mt-1">
            {booking.hissaCount} hissa{booking.hissaCount > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Bank details */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Banknote className="w-4 h-4 text-gray-500" />
          <h4 className="text-sm font-semibold text-gray-900">Bank Details</h4>
        </div>
        {loadingBank ? (
          <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        ) : bankDetails ? (
          <pre className="whitespace-pre-wrap font-sans text-sm bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-800 leading-relaxed">
            {bankDetails}
          </pre>
        ) : (
          <Alert variant="warning">
            Bank details are not configured yet. Please contact support.
          </Alert>
        )}
      </div>

      {/* Screenshot (optional, only when not yet marked) */}
      {!marked && (
        <PaymentScreenshotPicker
          file={screenshot}
          previewUrl={screenshotPreview}
          onChange={handleScreenshotChange}
          onClear={() => handleScreenshotChange(null)}
          disabled={submitting}
        />
      )}

      {/* Action */}
      {marked ? (
        <Alert variant="success">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Payment marked — awaiting admin confirmation</p>
              <p className="text-xs mt-1 opacity-90">
                You will be notified once the admin verifies your payment.
              </p>
            </div>
          </div>
        </Alert>
      ) : (
        <Button
          type="button"
          onClick={handleMarkPaid}
          disabled={submitting}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white"
          size="lg"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Marking...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              I&apos;ve Paid
            </>
          )}
        </Button>
      )}

      <p className="text-xs text-gray-500 text-center">
        After you transfer the amount, click the button to notify the admin. Your
        booking will be confirmed once the payment is verified.
      </p>

      <div className="bg-warning-light/40 border border-warning/30 rounded-lg p-3 text-xs text-warning-dark">
        <p className="font-medium mb-1">Estimated price — adjustments may apply</p>
        <p>This amount is based on the estimated bull price. We purchase the bull only after collecting payments. If the actual price is higher, you may be asked to top up; if lower, the difference is refunded to you.</p>
      </div>
    </div>
  );
}
