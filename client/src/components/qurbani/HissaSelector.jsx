import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, X, Banknote, CheckCircle2, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import * as qurbaniModuleService from '../../services/qurbaniModuleService';
import * as systemConfigService from '../../services/systemConfigService';
import { formatCurrency, formatApiError } from '../../lib/utils';

/**
 * HissaSelector — modal with two steps:
 *   1. pick hissa count + notes
 *   2. show bank details + "I've Paid" or "Cancel"
 *
 * No booking is created until the user clicks "I've Paid". Cancelling
 * or closing the modal at any point discards the in-progress selection
 * — no DB write, no slot reservation.
 */
export default function HissaSelector({ listing, open, onClose, onSubmitted }) {
  const [step, setStep] = useState(1);
  const [hissaCount, setHissaCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [bankDetails, setBankDetails] = useState('');
  const [loadingBank, setLoadingBank] = useState(false);

  const pricePerHissa = parseFloat(listing?.pricePerHissa ?? 0);
  const available = listing?.hissasAvailable ?? 0;
  const total = hissaCount * pricePerHissa;

  // Reset state whenever the modal opens for a new listing
  useEffect(() => {
    if (open) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setStep(1);
      setHissaCount(1);
      setNotes('');
      setErrorMsg('');
      setBankDetails('');
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [open, listing?.id]);

  // Fetch bank details once we hit step 2
  useEffect(() => {
    if (step !== 2) return;
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingBank(true);
    systemConfigService
      .getBankDetails()
      .then((res) => {
        if (active) setBankDetails(res.data?.bankDetails || '');
      })
      .catch(() => {
        if (active) setBankDetails('');
      })
      .finally(() => {
        if (active) setLoadingBank(false);
      });
    return () => {
      active = false;
    };
  }, [step]);

  if (!open || !listing) return null;

  const handleCountChange = (e) => {
    const v = parseInt(e.target.value, 10);
    if (Number.isNaN(v)) {
      setHissaCount(1);
      return;
    }
    const clamped = Math.max(1, Math.min(available || 1, v));
    setHissaCount(clamped);
  };

  const handleContinue = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (hissaCount < 1) {
      setErrorMsg('Please select at least 1 hissa.');
      return;
    }
    if (hissaCount > available) {
      setErrorMsg(`Only ${available} hissa(s) available.`);
      return;
    }
    setStep(2);
  };

  // Only here do we actually persist the booking. Until this fires, the
  // user has reserved nothing.
  const handleMarkPaid = async () => {
    setErrorMsg('');
    setSubmitting(true);
    try {
      const res = await qurbaniModuleService.createBooking({
        listingId: listing.id,
        hissaCount,
        paymentMarked: true,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
      const created = res.data?.booking;
      toast.success('Payment marked', {
        description: 'Your hissas are reserved. You will be notified once admin confirms.',
      });
      onSubmitted?.(created);
      onClose();
    } catch (error) {
      const msg = formatApiError(error) || 'Could not save your booking.';
      setErrorMsg(msg);
      toast.error('Booking failed', { description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Closing or cancelling at any step discards the selection — nothing
    // is in the database yet.
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-large w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {step === 1 ? 'Book Hissa' : 'Complete Payment'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{listing.name}</p>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 1 ? (
            <form id="hissa-form" onSubmit={handleContinue} className="space-y-5">
              {/* Hissa count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Hissas <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={available || 1}
                  value={hissaCount}
                  onChange={handleCountChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {available} hissa{available === 1 ? '' : 's'} available ·{' '}
                  {formatCurrency(pricePerHissa)} each
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Anything we should know?"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-sm"
                />
              </div>

              {/* Total */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-primary-900">Total</span>
                <span className="text-xl font-bold text-primary-900">
                  {formatCurrency(total)}
                </span>
              </div>

              <p className="text-xs text-gray-500">
                Your hissas are not reserved yet. They will be locked only after you
                mark payment as done on the next step.
              </p>

              {errorMsg && <p className="text-sm text-error">{errorMsg}</p>}
            </form>
          ) : (
            // STEP 2 — payment instructions, no DB write yet
            <div className="space-y-4">
              {/* Total */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-primary-700 font-semibold mb-1">
                  Total Amount Due
                </p>
                <p className="text-3xl font-bold text-primary-900">
                  {formatCurrency(total)}
                </p>
                <p className="text-xs text-primary-700 mt-1">
                  {hissaCount} hissa{hissaCount > 1 ? 's' : ''} × {formatCurrency(pricePerHissa)}
                </p>
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

              <Alert variant="warning">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="text-xs">
                    Your hissas are <strong>not yet reserved</strong>. Click{' '}
                    <strong>I've Paid</strong> only after you have transferred the
                    amount — that's when the slot is locked. Cancel or close this
                    window if you change your mind.
                  </p>
                </div>
              </Alert>

              {errorMsg && <p className="text-sm text-error">{errorMsg}</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          {step === 1 ? (
            <>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={submitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                form="hissa-form"
                disabled={submitting || available === 0}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                Continue to Payment
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={submitting}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleMarkPaid}
                disabled={submitting}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Reserving…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    I&apos;ve Paid
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
