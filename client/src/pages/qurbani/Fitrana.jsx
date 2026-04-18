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
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeading from '../../components/ui/SectionHeading';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { StatusBadge } from '../../components/ui/Badge';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonStatCard } from '../../components/ui/Skeleton';
import * as fitranaService from '../../services/fitranaService';
import * as systemConfigService from '../../services/systemConfigService';
import useQurbaniModuleStore from '../../store/qurbaniModuleStore';
import PaymentScreenshotPicker from '../../components/qurbani/PaymentScreenshotPicker';
import { cn, formatCurrency, formatDate, formatApiError } from '../../lib/utils';

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
            <p className="text-xs text-gray-500 dark:text-gray-400">Submission #{fitrana.id}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">{formatCurrency(total)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {fitrana.numberOfPeople} people × {formatCurrency(perPerson)}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {fitrana.paymentMarked && <Badge variant="info" size="sm" icon={CheckCircle2}>Paid</Badge>}
            <StatusBadge status={fitrana.status} size="sm" />
          </div>
        </div>

        <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span>{basisLabel}</span>
          </div>
          {fitrana.createdAt && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span>{formatDate(fitrana.createdAt)}</span>
            </div>
          )}
          {fitrana.notes && (
            <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
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
      fd.append('numberOfPeople', String(calculation.numberOfPeople));
      fd.append('calculationBasis', calculation.calculationBasis);
      fd.append('amountPerPerson', String(calculation.amountPerPerson));
      if (calculation.contactPhone) fd.append('contactPhone', calculation.contactPhone);
      if (calculation.notes) fd.append('notes', calculation.notes);
      fd.append('paymentMarked', 'true');
      if (screenshot) fd.append('paymentScreenshot', screenshot);

      const res = await fitranaService.createFitrana(fd);
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-large w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Complete Fitrana Payment</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 dark:text-gray-400"
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
              <Banknote className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Bank Details</h4>
            </div>
            {loadingBank ? (
              <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ) : bankDetails ? (
              <pre className="whitespace-pre-wrap font-sans text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 text-gray-800 dark:text-gray-100 leading-relaxed">
                {bankDetails}
              </pre>
            ) : (
              <Alert variant="warning">Bank details are not configured yet. Please contact support.</Alert>
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
                Your fitrana is <strong>not yet recorded</strong>. Click <strong>I've Paid</strong>{' '}
                only after you have transferred the amount. Cancel or close this window if you
                change your mind — nothing is saved until you confirm.
              </p>
            </div>
          </Alert>

          {errorMsg && <p className="text-sm text-error">{errorMsg}</p>}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
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
      <PageContainer className="max-w-5xl space-y-6">
        <PageHeader
          icon={HandCoins}
          accent="zakat"
          title="Fitrana"
          description="Calculate and pay Sadaqat al-Fitr for every member of your household."
        />

        {flagLoading ? (
          <SkeletonStatCard />
        ) : moduleEnabled === false ? (
          <EmptyState
            icon={HandCoins}
            tone="zakat"
            title="Fitrana collection is currently closed"
            description="Fitrana submissions open during the Eid season. Please check back closer to Eid."
          />
        ) : (
          <>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Calculate your fitrana</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* People */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                      className="w-full sm:w-48 px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Include every member of the household — adults, children, infants, and any
                      household help. Fitrana is obligatory for each one.
                    </p>
                  </div>

                  {/* Basis */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                              'text-left p-4 border rounded-xl transition-colors duration-200 cursor-pointer',
                              active
                                ? 'border-zakat-500 bg-zakat-50 dark:bg-zakat-500/10 ring-1 ring-inset ring-zakat-200 dark:ring-zakat-700/40'
                                : 'border-gray-200 dark:border-gray-800 hover:border-zakat-300 hover:bg-gray-50'
                            )}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', active ? 'bg-zakat-100 dark:bg-zakat-500/15 text-zakat-700 dark:text-zakat-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400')}>
                                <Icon className="w-4 h-4" />
                              </span>
                              {b.amount != null && (
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 tabular-nums">
                                  {formatCurrency(b.amount)}/person
                                </span>
                              )}
                            </div>
                            <p className={cn('text-sm font-semibold mt-2', active ? 'text-zakat-700 dark:text-zakat-200' : 'text-gray-900 dark:text-gray-50')}>
                              {b.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{b.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom amount */}
                  {basisKey === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Per-Person Amount (PKR) <span className="text-error">*</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full sm:w-48 px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  {/* Optional details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contact Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="03001234567"
                        className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="On behalf of…"
                        className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Total + CTA */}
                  <div className="bg-zakat-50 dark:bg-zakat-500/10 border border-zakat-200 dark:border-zakat-700/40 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-zakat-700 dark:text-zakat-200 font-semibold">
                        Total fitrana
                      </p>
                      <p className="text-3xl font-bold text-zakat-700 dark:text-zakat-200 tabular-nums">
                        {formatCurrency(totalAmount)}
                      </p>
                      <p className="text-xs text-zakat-700/80 mt-0.5">
                        {numberOfPeople} people × {formatCurrency(amountPerPerson)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleProceedToPayment}
                      disabled={!canProceed}
                      size="lg"
                    >
                      Continue to payment
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Nothing is recorded until you mark the payment as done on the next step. You
                    can cancel or close anytime.
                  </p>
                </CardContent>
              </Card>

            <div>
              <SectionHeading title="My fitrana submissions" description="Your fitrana history" size="md" />
              {loadingList ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SkeletonStatCard />
                  <SkeletonStatCard />
                </div>
              ) : submissions.length === 0 ? (
                <EmptyState
                  icon={HandCoins}
                  tone="zakat"
                  title="No submissions yet"
                  description="Once you complete a fitrana payment, it will appear here."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {submissions.map((f) => (<FitranaRow key={f.id} fitrana={f} />))}
                </div>
              )}
            </div>
          </>
        )}
      </PageContainer>

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
