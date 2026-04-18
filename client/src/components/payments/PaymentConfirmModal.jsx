import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, X, Banknote, CheckCircle2, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import PaymentScreenshotPicker from '../qurbani/PaymentScreenshotPicker';
import * as systemConfigService from '../../services/systemConfigService';
import { formatCurrency, formatApiError } from '../../lib/utils';

/**
 * PaymentConfirmModal — generic deferred-write payment popup.
 *
 * Donor flow: form validates inputs locally → opens this modal with the
 * total + the payload they would have submitted → modal fetches bank
 * details, lets the user attach an optional screenshot, and only
 * persists when "I've Paid" is clicked. Cancel/X = no DB write.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - title?: string                       (defaults to "Complete Payment")
 *  - totalAmount: number                  (PKR — shown in the header)
 *  - summaryLabel?: string                (e.g. "Total Donation", "First Month")
 *  - summaryHint?: string                 (small line under the amount)
 *  - onConfirmedSubmit: async ({ paymentMarked, paymentScreenshot }) => void
 *      Called when user clicks I've Paid. Throws to surface errors.
 *  - successMessage?: string              (toast title)
 *  - successDescription?: string          (toast description)
 */
export default function PaymentConfirmModal({
  open,
  onClose,
  title = 'Complete Payment',
  totalAmount,
  summaryLabel = 'Total Amount Due',
  summaryHint,
  onConfirmedSubmit,
  successMessage = 'Payment marked',
  successDescription = 'Awaiting admin confirmation. You will be notified once verified.',
}) {
  const [bankDetails, setBankDetails] = useState('');
  const [loadingBank, setLoadingBank] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoadingBank(true);
    setErrorMsg('');
    setScreenshot(null);
    setScreenshotPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    /* eslint-enable react-hooks/set-state-in-effect */
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
  }, [open]);

  if (!open) return null;

  const handleScreenshotChange = (file) => {
    setScreenshot(file);
    setScreenshotPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  const handlePaid = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      await onConfirmedSubmit({ paymentMarked: true, paymentScreenshot: screenshot });
      toast.success(successMessage, { description: successDescription });
      onClose();
    } catch (err) {
      const msg = formatApiError(err) || 'Could not save your submission.';
      setErrorMsg(msg);
      toast.error('Submission failed', { description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-large w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-xs uppercase tracking-wide text-primary-700 font-semibold mb-1">
              {summaryLabel}
            </p>
            <p className="text-3xl font-bold text-primary-900">{formatCurrency(totalAmount)}</p>
            {summaryHint && (
              <p className="text-xs text-primary-700 mt-1">{summaryHint}</p>
            )}
          </div>

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

          <PaymentScreenshotPicker
            file={screenshot}
            previewUrl={screenshotPreview}
            onChange={handleScreenshotChange}
            onClear={() => handleScreenshotChange(null)}
            disabled={submitting}
          />

          <Alert variant="warning">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-xs">
                Your submission is <strong>not yet recorded</strong>. Click{' '}
                <strong>I've Paid</strong> only after you have transferred the amount.
                Cancel or close to discard.
              </p>
            </div>
          </Alert>

          {errorMsg && <p className="text-sm text-error">{errorMsg}</p>}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handlePaid}
            disabled={submitting}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Recording…
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                I&apos;ve Paid
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
