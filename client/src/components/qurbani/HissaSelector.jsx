import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';
import Button from '../ui/Button';
import * as qurbaniModuleService from '../../services/qurbaniModuleService';
import PaymentPanel from './PaymentPanel';
import { formatCurrency, formatApiError } from '../../lib/utils';

/**
 * HissaSelector — modal with two steps:
 *   1. pick hissa count, submit booking
 *   2. show PaymentPanel for the just-created booking
 *
 * Props:
 *  - listing
 *  - open
 *  - onClose: () => void
 *  - onSubmitted: (booking) => void — called once a booking is created so the
 *    parent can refresh its list.
 */
export default function HissaSelector({ listing, open, onClose, onSubmitted }) {
  const [step, setStep] = useState(1);
  const [hissaCount, setHissaCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

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
      setBooking(null);
      setErrorMsg('');
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [open, listing?.id]);

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

  const handleSubmit = async (e) => {
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

    const payload = {
      listingId: listing.id,
      hissaCount,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };

    setSubmitting(true);
    try {
      const res = await qurbaniModuleService.createBooking(payload);
      const created = res.data?.booking;
      setBooking(created);
      toast.success('Booking created', {
        description: 'Please complete your payment to confirm.',
      });
      onSubmitted?.(created);
      setStep(2);
    } catch (error) {
      const msg = formatApiError(error) || 'Could not create booking.';
      setErrorMsg(msg);
      toast.error('Booking failed', { description: msg });
    } finally {
      setSubmitting(false);
    }
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
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 1 ? (
            <form id="hissa-form" onSubmit={handleSubmit} className="space-y-5">
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

              {errorMsg && (
                <p className="text-sm text-error">{errorMsg}</p>
              )}
            </form>
          ) : (
            <PaymentPanel booking={booking} />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          {step === 1 ? (
            <>
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                form="hissa-form"
                disabled={submitting || available === 0}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  'Continue to Payment'
                )}
              </Button>
            </>
          ) : (
            <Button type="button" onClick={onClose} className="bg-primary-600 hover:bg-primary-700 text-white">
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
