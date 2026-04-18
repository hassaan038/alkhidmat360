import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  HandCoins,
  Loader2,
  Wheat,
  Sprout,
  Apple,
  Grape,
  Heart,
  Pencil,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  X as XIcon,
  Calendar,
  Users,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FadeIn from '../../components/animations/FadeIn';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/Skeleton';
import * as fitranaService from '../../services/fitranaService';
import * as systemConfigService from '../../services/systemConfigService';
import useQurbaniModuleStore from '../../store/qurbaniModuleStore';
import { cn, formatCurrency, formatDate, formatApiError, getStatusColor } from '../../lib/utils';

// Pakistan 2026 fitrana rates per person (PKR). Sourced from religious
// councils + Alkhidmat Foundation. Update these annually.
const FITRANA_BASES = [
  {
    key: 'wheat',
    label: 'Wheat (½ ṣāʿ)',
    description: 'Hanafi minimum — based on wheat flour',
    amount: 300,
    icon: Wheat,
  },
  {
    key: 'barley',
    label: 'Barley (1 ṣāʿ)',
    description: 'Based on barley grain',
    amount: 1100,
    icon: Sprout,
  },
  {
    key: 'dates',
    label: 'Dates (1 ṣāʿ)',
    description: 'Based on dates',
    amount: 1600,
    icon: Apple,
  },
  {
    key: 'raisins',
    label: 'Raisins (1 ṣāʿ)',
    description: 'Based on raisins (kishmish)',
    amount: 3800,
    icon: Grape,
  },
  {
    key: 'alkhidmat',
    label: 'Alkhidmat Recommended',
    description: "Foundation's published 2026 rate",
    amount: 600,
    icon: Heart,
  },
  {
    key: 'custom',
    label: 'Custom Amount',
    description: 'Enter your own per-person amount',
    amount: null,
    icon: Pencil,
  },
];

function FitranaRow({ fitrana }) {
  const total = parseFloat(fitrana.totalAmount) || 0;
  const perPerson = parseFloat(fitrana.amountPerPerson) || 0;
  const basisLabel =
    FITRANA_BASES.find((b) => b.key === fitrana.calculationBasis)?.label ||
    fitrana.calculationBasis;

  return (
    <Card className="shadow-soft hover:shadow-medium transition-shadow duration-300">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <p className="text-xs text-gray-500">Submission #{fitrana.id}</p>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(total)}</p>
            <p className="text-xs text-gray-500">
              {fitrana.numberOfPeople} people × {formatCurrency(perPerson)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {fitrana.paymentMarked && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium bg-info-light text-info-dark border-info">
                <CheckCircle2 className="w-3 h-3" /> Paid
              </span>
            )}
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium capitalize',
                getStatusColor(fitrana.status)
              )}
            >
              {fitrana.status}
            </span>
          </div>
        </div>

        <div className="space-y-1 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span>{basisLabel}</span>
          </div>
          {fitrana.createdAt && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{formatDate(fitrana.createdAt)}</span>
            </div>
          )}
          {fitrana.notes && (
            <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
              {fitrana.notes}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentModal({ open, onClose, calculation, onConfirmed }) {
  const [bankDetails, setBankDetails] = useState('');
  const [loadingBank, setLoadingBank] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!open) return;
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingBank(true);
    setErrorMsg('');
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

  const handleMarkPaid = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fitranaService.createFitrana({
        numberOfPeople: calculation.numberOfPeople,
        calculationBasis: calculation.calculationBasis,
        amountPerPerson: calculation.amountPerPerson,
        contactPhone: calculation.contactPhone || undefined,
        notes: calculation.notes || undefined,
        paymentMarked: true,
      });
      toast.success('Payment marked', {
        description: 'Your fitrana is recorded. You will be notified once admin confirms.',
      });
      onConfirmed?.(res.data?.fitrana);
      onClose();
    } catch (err) {
      const msg = formatApiError(err) || 'Could not save your fitrana.';
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
          <h2 className="text-lg font-semibold text-gray-900">Complete Fitrana Payment</h2>
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
              Total Fitrana
            </p>
            <p className="text-3xl font-bold text-primary-900">
              {formatCurrency(calculation.totalAmount)}
            </p>
            <p className="text-xs text-primary-700 mt-1">
              {calculation.numberOfPeople} people × {formatCurrency(calculation.amountPerPerson)}
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
              <Alert variant="warning">Bank details are not configured yet. Please contact support.</Alert>
            )}
          </div>

          <Alert variant="warning">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-xs">
                Your fitrana is <strong>not yet recorded</strong>. Click <strong>I've Paid</strong>{' '}
                only after you have transferred the amount. Cancel or close this window if you
                change your mind — nothing is saved until you confirm.
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

export default function Fitrana() {
  const { moduleEnabled, fetchFlag } = useQurbaniModuleStore();
  const [submissions, setSubmissions] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  // Calculator state
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [basisKey, setBasisKey] = useState('alkhidmat');
  const [customAmount, setCustomAmount] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [paymentOpen, setPaymentOpen] = useState(false);

  useEffect(() => {
    if (moduleEnabled === null) {
      fetchFlag();
    }
  }, [moduleEnabled, fetchFlag]);

  const loadSubmissions = async () => {
    setLoadingList(true);
    try {
      const res = await fitranaService.getMyFitranas();
      setSubmissions(res.data?.fitranas || []);
    } catch (err) {
      toast.error('Failed to load your submissions', { description: formatApiError(err) });
      setSubmissions([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (moduleEnabled === true) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadSubmissions();
    } else if (moduleEnabled === false) {
      setLoadingList(false);
    }
  }, [moduleEnabled]);

  const selectedBasis = useMemo(
    () => FITRANA_BASES.find((b) => b.key === basisKey),
    [basisKey]
  );

  const amountPerPerson = useMemo(() => {
    if (selectedBasis?.key === 'custom') {
      const v = parseFloat(customAmount);
      return Number.isFinite(v) && v > 0 ? v : 0;
    }
    return selectedBasis?.amount || 0;
  }, [selectedBasis, customAmount]);

  const totalAmount = useMemo(
    () => Math.max(0, Number(numberOfPeople) || 0) * amountPerPerson,
    [numberOfPeople, amountPerPerson]
  );

  const canProceed = numberOfPeople > 0 && amountPerPerson > 0;

  const handleProceedToPayment = () => {
    if (!canProceed) {
      toast.error('Cannot proceed', {
        description: 'Please enter at least 1 person and a per-person amount greater than 0.',
      });
      return;
    }
    setPaymentOpen(true);
  };

  const flagLoading = moduleEnabled === null;

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <FadeIn direction="down" delay={0}>
          <div className="mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
              <HandCoins className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fitrana</h1>
              <p className="text-gray-600 mt-1">
                Calculate and pay Sadaqat al-Fitr for every member of your household.
              </p>
            </div>
          </div>
        </FadeIn>

        {flagLoading ? (
          <SkeletonCard />
        ) : moduleEnabled === false ? (
          <FadeIn direction="up" delay={100}>
            <EmptyState
              title="Fitrana collection is currently closed"
              description="Fitrana submissions open during the Eid season. Please check back closer to Eid."
            />
          </FadeIn>
        ) : (
          <>
            <FadeIn direction="up" delay={100}>
              <Card className="shadow-medium mb-8">
                <CardHeader>
                  <CardTitle>Calculate Your Fitrana</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* People */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of People in Family <span className="text-error">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={numberOfPeople}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        setNumberOfPeople(Number.isNaN(v) ? 1 : Math.max(1, Math.min(100, v)));
                      }}
                      className="w-full sm:w-48 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Include every member of the household — adults, children, infants, and any
                      household help. Fitrana is obligatory for each one.
                    </p>
                  </div>

                  {/* Basis */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calculation Basis <span className="text-error">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {FITRANA_BASES.map((b) => {
                        const Icon = b.icon;
                        const active = b.key === basisKey;
                        return (
                          <button
                            key={b.key}
                            type="button"
                            onClick={() => setBasisKey(b.key)}
                            className={cn(
                              'text-left p-4 border-2 rounded-xl transition-all',
                              active
                                ? 'border-primary-500 bg-primary-50 shadow-glow-blue'
                                : 'border-gray-200 hover:border-primary-200'
                            )}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <Icon
                                className={cn(
                                  'w-5 h-5',
                                  active ? 'text-primary-600' : 'text-gray-500'
                                )}
                              />
                              {b.amount != null && (
                                <span className="text-xs font-semibold text-gray-700">
                                  {formatCurrency(b.amount)}/person
                                </span>
                              )}
                            </div>
                            <p
                              className={cn(
                                'text-sm font-semibold',
                                active ? 'text-primary-900' : 'text-gray-900'
                              )}
                            >
                              {b.label}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{b.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom amount */}
                  {basisKey === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Per-Person Amount (PKR) <span className="text-error">*</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full sm:w-48 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  {/* Optional details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="03001234567"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="On behalf of…"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Total + CTA */}
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-primary-700 font-semibold">
                        Total Fitrana
                      </p>
                      <p className="text-3xl font-bold text-primary-900">
                        {formatCurrency(totalAmount)}
                      </p>
                      <p className="text-xs text-primary-700 mt-0.5">
                        {numberOfPeople} people × {formatCurrency(amountPerPerson)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleProceedToPayment}
                      disabled={!canProceed}
                      size="lg"
                      className="bg-primary-600 hover:bg-primary-700 text-white"
                    >
                      Continue to Payment
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500">
                    Nothing is recorded until you mark the payment as done on the next step. You
                    can cancel or close anytime.
                  </p>
                </CardContent>
              </Card>
            </FadeIn>

            {/* My submissions */}
            <FadeIn direction="up" delay={150}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">My Fitrana Submissions</h2>
              {loadingList ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : submissions.length === 0 ? (
                <EmptyState
                  title="No submissions yet"
                  description="Once you complete a fitrana payment, it will appear here."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {submissions.map((f) => (
                    <FitranaRow key={f.id} fitrana={f} />
                  ))}
                </div>
              )}
            </FadeIn>
          </>
        )}
      </div>

      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        calculation={
          paymentOpen
            ? {
                numberOfPeople,
                calculationBasis: basisKey,
                amountPerPerson,
                totalAmount,
                contactPhone,
                notes,
              }
            : null
        }
        onConfirmed={() => {
          loadSubmissions();
        }}
      />
    </DashboardLayout>
  );
}
