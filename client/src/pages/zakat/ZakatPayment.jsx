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
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeading from '../../components/ui/SectionHeading';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Badge, { StatusBadge } from '../../components/ui/Badge';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonStatCard } from '../../components/ui/Skeleton';
import PaymentScreenshotPicker from '../../components/qurbani/PaymentScreenshotPicker';
import * as zakatService from '../../services/zakatService';
import * as systemConfigService from '../../services/systemConfigService';
import { cn, formatCurrency, formatDate, formatApiError } from '../../lib/utils';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <Card className="shadow-soft hover:shadow-medium transition-shadow duration-300">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('sadqa.donationNo')}{payment.id}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {formatCurrency(payment.zakatAmount)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatCurrency(payment.totalWealth)} ·{' '}
              {payment.nisabBasis === 'gold' ? t('zakatPayment.nisabGold') : t('zakatPayment.nisabSilver')}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {payment.paymentMarked && <Badge variant="info" size="sm" icon={CheckCircle2}>{t('sadqa.paid')}</Badge>}
            <StatusBadge status={payment.status} size="sm" />
          </div>
        </div>
        {payment.createdAt && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span>{formatDate(payment.createdAt)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PaymentModal({ open, onClose, calculation, onConfirmed }) {
  const { t } = useTranslation();
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
      toast.success(t('zakatPayment.paymentRecorded'), {
        description: t('zakatPayment.paymentRecordedDesc'),
      });
      onConfirmed?.(res.data?.payment);
      onClose();
    } catch (err) {
      const msg = formatApiError(err) || t('payment.couldNotSave');
      setErrorMsg(msg);
      toast.error(t('common.submissionFailed'), { description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-large w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">{t('zakatPayment.completePayment')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 dark:text-gray-400"
            aria-label={t('common.close')}
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-xs uppercase tracking-wide text-primary-700 font-semibold mb-1">
              {t('zakatPayment.totalZakat')}
            </p>
            <p className="text-3xl font-bold text-primary-900">
              {formatCurrency(calculation.zakatAmount)}
            </p>
            <p className="text-xs text-primary-700 mt-1">
              2.5% · {formatCurrency(calculation.totalWealth)}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Banknote className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{t('fitrana.bankDetails')}</h4>
            </div>
            {loadingBank ? (
              <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            ) : bankDetails ? (
              <pre className="whitespace-pre-wrap font-sans text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 text-gray-800 dark:text-gray-100 leading-relaxed">
                {bankDetails}
              </pre>
            ) : (
              <Alert variant="warning">{t('fitrana.bankNotConfigured')}</Alert>
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
              <p className="text-xs">{t('payment.notYetRecorded')}</p>
            </div>
          </Alert>

          {errorMsg && <p className="text-sm text-error">{errorMsg}</p>}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            {t('common.cancel')}
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
                {t('fitrana.recording')}
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {t('fitrana.iHavePaid')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ZakatPayment() {
  const { t } = useTranslation();
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
      toast.error(t('zakatPayment.failedToLoad'), { description: formatApiError(err) });
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
      toast.error(t('common.submissionFailed'), {
        description: isAboveNisab
          ? t('common.tryAgainLater')
          : t('zakatPayment.belowNisab'),
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
    'w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent';

  return (
    <DashboardLayout>
      <PageContainer className="max-w-5xl space-y-6">
        <PageHeader
          icon={Coins}
          accent="zakat"
          title={t('zakatPayment.title')}
          description={t('zakatPayment.description')}
        />

        {/* Reference rates */}
          <Card className="shadow-card bg-gray-50/40">
            <CardContent className="pt-5">
              <div className="flex items-start gap-2 mb-3 text-xs text-gray-600 dark:text-gray-400">
                <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                <p>
                  Reference rates default to recent Pakistan market prices and are used to value
                  any gold/silver you enter and to compute the nisab threshold. Override either
                  if your reference rate differs.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
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

        {/* Calculator */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>{t('zakatPayment.calculator')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('zakatPayment.cashSavings')}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('zakatPayment.investments')}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('zakatPayment.goldGrams')}
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
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      ≈ {formatCurrency(goldValue)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('zakatPayment.silverGrams')}
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
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      ≈ {formatCurrency(silverValue)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('zakatPayment.businessAssets')}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('zakatPayment.otherAssets')}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('zakatPayment.liabilitiesField')}
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
                <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('zakatPayment.nisabBasis')}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      key: 'silver',
                      label: t('zakatPayment.nisabSilver'),
                      grams: NISAB_SILVER_GRAMS,
                    },
                    {
                      key: 'gold',
                      label: t('zakatPayment.nisabGold'),
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
                          'text-left p-4 border rounded-xl transition-colors duration-200 cursor-pointer',
                          active
                            ? 'border-zakat-500 bg-zakat-50 dark:bg-zakat-500/10 ring-1 ring-inset ring-zakat-200 dark:ring-zakat-700/40'
                            : 'border-gray-200 dark:border-gray-800 hover:border-zakat-300 hover:bg-gray-50'
                        )}
                      >
                        <p className={cn('text-sm font-semibold', active ? 'text-zakat-700 dark:text-zakat-200' : 'text-gray-900 dark:text-gray-50')}>
                          {b.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {b.grams}g · threshold ≈ {formatCurrency(threshold)}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Many scholars recommend the silver basis since it sets a lower threshold,
                  meaning more donors qualify and more zakat reaches those in need.
                </p>
              </div>

              {/* Optional fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('skinPickup.contactPhone')} ({t('common.optional')})
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder={t('form.phonePlaceholder')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('common.notes')} ({t('common.optional')})
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
                  'rounded-xl p-5 border',
                  isAboveNisab
                    ? 'bg-zakat-50 dark:bg-zakat-500/10 border-zakat-200 dark:border-zakat-700/40'
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                )}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-semibold">{t('zakatPayment.totalWealth')}</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-50 tabular-nums">
                      {formatCurrency(totalWealth)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-semibold">{t('zakatPayment.nisabBasis')}</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-50 tabular-nums">
                      {formatCurrency(nisabThreshold)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider font-semibold">{t('zakatPayment.zakatAmount')}</p>
                    <p className={cn('text-2xl font-bold tabular-nums', isAboveNisab ? 'text-zakat-700 dark:text-zakat-200' : 'text-gray-500 dark:text-gray-400')}>
                      {formatCurrency(zakatAmount)}
                    </p>
                  </div>
                </div>

                {!isAboveNisab && totalWealth > 0 && (
                  <Alert variant="default" className="mt-3">
                    <p className="text-xs">{t('zakatPayment.belowNisab')}</p>
                  </Alert>
                )}

                <div className="mt-4 flex justify-end">
                  <Button type="button" onClick={handleProceed} disabled={!canProceed} size="lg">
                    {t('common.continueToPayment')}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('fitrana.nothingRecorded')}
              </p>
            </CardContent>
          </Card>

        {/* Past payments */}
        <div>
          <SectionHeading title={t('zakatPayment.myPayments')} description={t('zakatPayment.yourPaymentHistory')} size="md" />
          {loadingPast ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SkeletonStatCard />
              <SkeletonStatCard />
            </div>
          ) : past.length === 0 ? (
            <EmptyState
              icon={Coins}
              tone="zakat"
              title={t('zakatPayment.noPayments')}
              description={t('zakatPayment.noPaymentsDesc')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {past.map((p) => (<PastPaymentCard key={p.id} payment={p} />))}
            </div>
          )}
        </div>
      </PageContainer>

      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        calculation={calculationForModal}
        onConfirmed={() => loadPast()}
      />
    </DashboardLayout>
  );
}
