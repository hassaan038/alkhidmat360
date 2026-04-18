import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Coins,
  Loader2,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  X as XIcon,
  Calendar,
  Info,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FadeIn from '../../components/animations/FadeIn';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/Skeleton';
import PaymentScreenshotPicker from '../../components/qurbani/PaymentScreenshotPicker';
import * as zakatService from '../../services/zakatService';
import * as systemConfigService from '../../services/systemConfigService';
import {
  cn,
  formatCurrency,
  formatDate,
  formatApiError,
  getStatusColor,
} from '../../lib/utils';

// Pakistan 2026 reference rates — UPDATE ANNUALLY (or expose to admin
// settings). Donors can override the per-gram rate inline if their
// reference value differs.
const DEFAULT_GOLD_PKR_PER_GRAM = 39000;
const DEFAULT_SILVER_PKR_PER_GRAM = 480;

// Religious nisab thresholds in grams — fixed.
const NISAB_GOLD_GRAMS = 87.48; // 7.5 tola
const NISAB_SILVER_GRAMS = 612.36; // 52.5 tola

const ZAKAT_RATE = 0.025;

const NUM = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

function PastPaymentCard({ payment }) {
  return (
    <Card className="shadow-soft hover:shadow-medium transition-shadow duration-300">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <p className="text-xs text-gray-500">Payment #{payment.id}</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(payment.zakatAmount)}
            </p>
            <p className="text-xs text-gray-500">
              On wealth of {formatCurrency(payment.totalWealth)} ·{' '}
              {payment.nisabBasis === 'gold' ? 'Gold nisab' : 'Silver nisab'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {payment.paymentMarked && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium bg-info-light text-info-dark border-info">
                <CheckCircle2 className="w-3 h-3" /> Paid
              </span>
            )}
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium capitalize',
                getStatusColor(payment.status)
              )}
            >
              {payment.status}
            </span>
          </div>
        </div>
        {payment.createdAt && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{formatDate(payment.createdAt)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PaymentModal({ open, onClose, calculation, onConfirmed }) {
  const [bankDetails, setBankDetails] = useState('');
  const [loadingBank, setLoadingBank] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingBank(true);
    setErrorMsg('');
    setScreenshot(null);
    setScreenshotPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
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

  if (!open || !calculation) return null;

  const handleScreenshotChange = (file) => {
    setScreenshot(file);
    setScreenshotPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  const handleMarkPaid = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const fd = new FormData();
      Object.entries(calculation.payload).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, String(v));
      });
      fd.append('paymentMarked', 'true');
      if (screenshot) fd.append('paymentScreenshot', screenshot);

      const res = await zakatService.createZakatPayment(fd);
      toast.success('Payment marked', {
        description: 'Your zakat is recorded. You will be notified once admin confirms.',
      });
      onConfirmed?.(res.data?.payment);
      onClose();
    } catch (err) {
      const msg = formatApiError(err) || 'Could not save your zakat.';
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
          <h2 className="text-lg font-semibold text-gray-900">Complete Zakat Payment</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="Close"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-xs uppercase tracking-wide text-primary-700 font-semibold mb-1">
              Total Zakat
            </p>
            <p className="text-3xl font-bold text-primary-900">
              {formatCurrency(calculation.zakatAmount)}
            </p>
            <p className="text-xs text-primary-700 mt-1">
              2.5% of {formatCurrency(calculation.totalWealth)} zakatable wealth
            </p>
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
                Your zakat is <strong>not yet recorded</strong>. Click <strong>I've Paid</strong>{' '}
                only after you have transferred the amount. Cancel or close to discard.
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
            onClick={handleMarkPaid}
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

export default function ZakatPayment() {
  const [past, setPast] = useState([]);
  const [loadingPast, setLoadingPast] = useState(true);

  // Editable per-gram rates (donor can adjust if their reference price differs)
  const [goldRate, setGoldRate] = useState(DEFAULT_GOLD_PKR_PER_GRAM);
  const [silverRate, setSilverRate] = useState(DEFAULT_SILVER_PKR_PER_GRAM);

  // Asset breakdown
  const [cashSavings, setCashSavings] = useState('');
  const [goldGrams, setGoldGrams] = useState('');
  const [silverGrams, setSilverGrams] = useState('');
  const [investments, setInvestments] = useState('');
  const [businessAssets, setBusinessAssets] = useState('');
  const [otherAssets, setOtherAssets] = useState('');
  const [liabilities, setLiabilities] = useState('');

  const [nisabBasis, setNisabBasis] = useState('silver');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [paymentOpen, setPaymentOpen] = useState(false);

  const loadPast = async () => {
    setLoadingPast(true);
    try {
      const res = await zakatService.getMyZakatPayments();
      setPast(res.data?.payments || []);
    } catch (err) {
      toast.error('Failed to load past payments', { description: formatApiError(err) });
      setPast([]);
    } finally {
      setLoadingPast(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPast();
  }, []);

  const goldValue = useMemo(() => NUM(goldGrams) * NUM(goldRate), [goldGrams, goldRate]);
  const silverValue = useMemo(
    () => NUM(silverGrams) * NUM(silverRate),
    [silverGrams, silverRate]
  );

  const totalAssets = useMemo(
    () =>
      NUM(cashSavings) +
      goldValue +
      silverValue +
      NUM(investments) +
      NUM(businessAssets) +
      NUM(otherAssets),
    [cashSavings, goldValue, silverValue, investments, businessAssets, otherAssets]
  );

  const totalWealth = useMemo(
    () => Math.max(0, totalAssets - NUM(liabilities)),
    [totalAssets, liabilities]
  );

  const nisabThreshold = useMemo(
    () =>
      nisabBasis === 'gold'
        ? NISAB_GOLD_GRAMS * NUM(goldRate)
        : NISAB_SILVER_GRAMS * NUM(silverRate),
    [nisabBasis, goldRate, silverRate]
  );

  const isAboveNisab = totalWealth >= nisabThreshold && totalWealth > 0;
  const zakatAmount = isAboveNisab ? totalWealth * ZAKAT_RATE : 0;

  const canProceed = isAboveNisab && zakatAmount > 0;

  const handleProceed = () => {
    if (!canProceed) {
      toast.error('Cannot proceed', {
        description: isAboveNisab
          ? 'Calculated zakat is zero — please review your inputs.'
          : 'Your zakatable wealth is below the nisab threshold. Zakat is not obligatory.',
      });
      return;
    }
    setPaymentOpen(true);
  };

  const calculationForModal = paymentOpen
    ? {
        zakatAmount,
        totalWealth,
        payload: {
          cashSavings: NUM(cashSavings),
          goldGrams: NUM(goldGrams),
          goldValue,
          silverGrams: NUM(silverGrams),
          silverValue,
          investments: NUM(investments),
          businessAssets: NUM(businessAssets),
          otherAssets: NUM(otherAssets),
          liabilities: NUM(liabilities),
          nisabBasis,
          nisabThreshold,
          totalWealth,
          zakatAmount,
          contactPhone: contactPhone || undefined,
          notes: notes || undefined,
        },
      }
    : null;

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent';

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <FadeIn direction="down" delay={0}>
          <div className="mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
              <Coins className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Zakat</h1>
              <p className="text-gray-600 mt-1">
                Calculate the 2.5% zakat on your wealth held above the nisab threshold for one
                lunar year.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Reference rates */}
        <FadeIn direction="up" delay={50}>
          <Card className="shadow-soft mb-6 bg-gray-50/40">
            <CardContent className="pt-5">
              <div className="flex items-start gap-2 mb-3 text-xs text-gray-600">
                <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p>
                  Reference rates default to recent Pakistan market prices and are used to value
                  any gold/silver you enter and to compute the nisab threshold. Override either
                  if your reference rate differs.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Gold rate (PKR/gram)
                  </label>
                  <input
                    type="number"
                    value={goldRate}
                    onChange={(e) => setGoldRate(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Silver rate (PKR/gram)
                  </label>
                  <input
                    type="number"
                    value={silverRate}
                    onChange={(e) => setSilverRate(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Calculator */}
        <FadeIn direction="up" delay={100}>
          <Card className="shadow-medium mb-8">
            <CardHeader>
              <CardTitle>Your Zakatable Wealth</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cash & Savings (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={cashSavings}
                    onChange={(e) => setCashSavings(e.target.value)}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Investments (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={investments}
                    onChange={(e) => setInvestments(e.target.value)}
                    placeholder="Stocks, mutual funds, savings certificates"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gold (grams)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={goldGrams}
                    onChange={(e) => setGoldGrams(e.target.value)}
                    placeholder="Total grams of gold"
                    className={inputClass}
                  />
                  {goldValue > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      ≈ {formatCurrency(goldValue)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Silver (grams)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={silverGrams}
                    onChange={(e) => setSilverGrams(e.target.value)}
                    placeholder="Total grams of silver"
                    className={inputClass}
                  />
                  {silverValue > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      ≈ {formatCurrency(silverValue)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Assets (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={businessAssets}
                    onChange={(e) => setBusinessAssets(e.target.value)}
                    placeholder="Inventory, receivables"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Other Zakatable Assets (PKR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={otherAssets}
                    onChange={(e) => setOtherAssets(e.target.value)}
                    placeholder="Rental income, agricultural produce, etc."
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Liabilities / Debts due within 12 months (PKR)
                </label>
                <input
                  type="number"
                  min={0}
                  value={liabilities}
                  onChange={(e) => setLiabilities(e.target.value)}
                  placeholder="Subtracted from your zakatable wealth"
                  className={inputClass}
                />
              </div>

              {/* Nisab basis */}
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  Nisab Basis
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      key: 'silver',
                      label: 'Silver (lower threshold)',
                      grams: NISAB_SILVER_GRAMS,
                    },
                    {
                      key: 'gold',
                      label: 'Gold',
                      grams: NISAB_GOLD_GRAMS,
                    },
                  ].map((b) => {
                    const active = nisabBasis === b.key;
                    const threshold =
                      b.grams * (b.key === 'gold' ? NUM(goldRate) : NUM(silverRate));
                    return (
                      <button
                        key={b.key}
                        type="button"
                        onClick={() => setNisabBasis(b.key)}
                        className={cn(
                          'text-left p-4 border-2 rounded-xl transition-all',
                          active
                            ? 'border-primary-500 bg-primary-50 shadow-glow-blue'
                            : 'border-gray-200 hover:border-primary-200'
                        )}
                      >
                        <p
                          className={cn(
                            'text-sm font-semibold',
                            active ? 'text-primary-900' : 'text-gray-900'
                          )}
                        >
                          {b.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {b.grams}g · threshold ≈ {formatCurrency(threshold)}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Many scholars recommend the silver basis since it sets a lower threshold,
                  meaning more donors qualify and more zakat reaches those in need.
                </p>
              </div>

              {/* Optional fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="03001234567"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. for the year 1447 AH"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Summary + CTA */}
              <div
                className={cn(
                  'rounded-lg p-5 border',
                  isAboveNisab
                    ? 'bg-primary-50 border-primary-200'
                    : 'bg-gray-50 border-gray-200'
                )}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Total Wealth</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(totalWealth)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      Nisab Threshold
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(nisabThreshold)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Zakat Due</p>
                    <p
                      className={cn(
                        'text-2xl font-bold',
                        isAboveNisab ? 'text-primary-900' : 'text-gray-500'
                      )}
                    >
                      {formatCurrency(zakatAmount)}
                    </p>
                  </div>
                </div>

                {!isAboveNisab && totalWealth > 0 && (
                  <Alert variant="default" className="mt-3">
                    <p className="text-xs">
                      Your zakatable wealth is below the {nisabBasis} nisab threshold. Zakat is
                      not obligatory on you for this period.
                    </p>
                  </Alert>
                )}

                <div className="mt-4 flex justify-end">
                  <Button
                    type="button"
                    onClick={handleProceed}
                    disabled={!canProceed}
                    size="lg"
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    Continue to Payment
                  </Button>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Nothing is recorded until you mark the payment as done on the next step. Cancel
                or close the popup to discard.
              </p>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Past payments */}
        <FadeIn direction="up" delay={150}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Zakat Payments</h2>
          {loadingPast ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : past.length === 0 ? (
            <EmptyState
              title="No zakat payments yet"
              description="Once you complete a payment, it will appear here."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {past.map((p) => (
                <PastPaymentCard key={p.id} payment={p} />
              ))}
            </div>
          )}
        </FadeIn>
      </div>

      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        calculation={calculationForModal}
        onConfirmed={() => loadPast()}
      />
    </DashboardLayout>
  );
}
