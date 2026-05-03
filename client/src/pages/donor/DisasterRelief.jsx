import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Calendar, CheckCircle2, Waves, AlertTriangle, Home, HeartPulse, Shield, LifeBuoy,
  User, Phone, Mail, RotateCcw, ArrowRight, Coins,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import FormSection, { FormGrid, FormField } from '../../components/ui/FormSection';
import SectionHeading from '../../components/ui/SectionHeading';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge, { StatusBadge } from '../../components/ui/Badge';
import IconTile from '../../components/ui/IconTile';
import { Card, CardContent } from '../../components/ui/Card';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonStatCard } from '../../components/ui/Skeleton';
import PaymentConfirmModal from '../../components/payments/PaymentConfirmModal';
import * as extraDonationService from '../../services/extraDonationService';
import { cn, formatCurrency, formatDate, formatApiError } from '../../lib/utils';
import { useTranslation } from 'react-i18next';

const CAMPAIGN_KEYS = [
  { key: 'floods', icon: Waves },
  { key: 'earthquake', icon: AlertTriangle },
  { key: 'shelter', icon: Home },
  { key: 'medical', icon: HeartPulse },
  { key: 'general', icon: Shield },
];

const QUICK_AMOUNTS = [1000, 2500, 5000, 10000, 25000, 50000];

const schema = z.object({
  donorName: z.string().min(2, 'Name must be at least 2 characters'),
  donorPhone: z.string().min(10, 'Please enter a valid phone number').max(20),
  donorEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  notes: z.string().optional(),
});

function DonationCard({ donation }) {
  const { t } = useTranslation();
  const campaign = CAMPAIGN_KEYS.find((c) => c.key === donation.campaignKey);
  const Icon = campaign?.icon || LifeBuoy;
  return (
    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            <IconTile icon={Icon} tone="disaster" size="md" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('sadqa.donationNo')}{donation.id}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 tabular-nums">{formatCurrency(donation.amount)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{donation.campaignLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {donation.paymentMarked && <Badge variant="info" size="sm" icon={CheckCircle2}>{t('sadqa.paid')}</Badge>}
            <StatusBadge status={donation.status} size="sm" />
          </div>
        </div>
        {donation.createdAt && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            <span>{formatDate(donation.createdAt)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DisasterRelief() {
  const { t } = useTranslation();
  const CAMPAIGNS = useMemo(() => CAMPAIGN_KEYS.map((c) => ({
    ...c,
    label: t(`disasterRelief.${c.key}`),
    description: t(`disasterRelief.${c.key}Desc`),
  })), [t]);
  const [past, setPast] = useState([]);
  const [loadingPast, setLoadingPast] = useState(true);
  const [campaignKey, setCampaignKey] = useState('floods');
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { amount: '' },
  });
  const watchAmount = watch('amount');
  const selected = useMemo(() => CAMPAIGNS.find((c) => c.key === campaignKey), [CAMPAIGNS, campaignKey]);

  const loadPast = async () => {
    setLoadingPast(true);
    try {
      const res = await extraDonationService.getMyDisasterDonations();
      setPast(res.data?.donations || []);
    } catch (err) {
      toast.error(t('disasterRelief.failedToLoad'), { description: formatApiError(err) });
      setPast([]);
    } finally {
      setLoadingPast(false);
    }
  };
  useEffect(() => { loadPast(); }, []);

  const onSubmit = (data) => {
    setPendingPayload({ ...data, campaignKey, campaignLabel: selected?.label || campaignKey });
    setPaymentOpen(true);
  };

  const handleConfirmed = async ({ paymentMarked, paymentScreenshot }) => {
    const fd = new FormData();
    Object.entries(pendingPayload || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') fd.append(k, String(v));
    });
    fd.append('paymentMarked', String(paymentMarked));
    if (paymentScreenshot) fd.append('paymentScreenshot', paymentScreenshot);
    await extraDonationService.createDisasterDonation(fd);
    reset({ amount: '' });
    setPendingPayload(null);
    loadPast();
  };

  return (
    <DashboardLayout>
      <PageContainer className="max-w-5xl space-y-6">
        <PageHeader
          icon={LifeBuoy}
          accent="disaster"
          title={t('disasterRelief.title')}
          description={t('disasterRelief.description')}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title={t('disasterRelief.chooseACampaign')} icon={LifeBuoy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CAMPAIGNS.map((c) => {
                const CIcon = c.icon;
                const active = campaignKey === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCampaignKey(c.key)}
                    className={cn(
                      'text-left p-4 rounded-xl border transition-colors duration-200 cursor-pointer',
                      active
                        ? 'border-disaster-500 bg-disaster-50 dark:bg-disaster-500/10 ring-1 ring-inset ring-disaster-200 dark:ring-disaster-700/40'
                        : 'border-gray-200 dark:border-gray-800 hover:border-disaster-300 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', active ? 'bg-disaster-100 dark:bg-disaster-500/15 text-disaster-700 dark:text-disaster-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400')}>
                        <CIcon className="w-4 h-4" />
                      </span>
                      <p className={cn('text-sm font-semibold', active ? 'text-disaster-700 dark:text-disaster-200' : 'text-gray-900 dark:text-gray-50')}>
                        {c.label}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{c.description}</p>
                  </button>
                );
              })}
            </div>
          </FormSection>

          <FormSection title={t('disasterRelief.amount')} icon={Coins}>
            <FormField label={t('disasterRelief.amountPkr')} required htmlFor="amt" error={errors.amount?.message}>
              <Input id="amt" type="number" min={1} {...register('amount')} placeholder={t('qurbaniDonation.enterAmount')} />
            </FormField>
            <div className="flex flex-wrap gap-2 mt-3">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setValue('amount', amt, { shouldValidate: true })}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium ring-1 ring-inset transition-colors cursor-pointer',
                    Number(watchAmount) === amt
                      ? 'bg-disaster-600 text-white ring-disaster-600'
                      : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 ring-gray-200 hover:ring-disaster-300 hover:text-disaster-700'
                  )}
                >
                  {formatCurrency(amt)}
                </button>
              ))}
            </div>
          </FormSection>

          <FormSection title={t('disasterRelief.yourDetails')} icon={User}>
            <FormGrid cols={2}>
              <FormField label={t('form.fullName')} required htmlFor="dn" error={errors.donorName?.message}>
                <Input id="dn" leftIcon={User} {...register('donorName')} placeholder={t('form.yourFullName')} />
              </FormField>
              <FormField label={t('form.phoneNumber')} required htmlFor="dp" error={errors.donorPhone?.message}>
                <Input id="dp" type="tel" leftIcon={Phone} {...register('donorPhone')} placeholder={t('form.phonePlaceholder')} />
              </FormField>
              <FormField wide label={t('form.email')} htmlFor="de" hint={t('form.optional')} error={errors.donorEmail?.message}>
                <Input id="de" type="email" leftIcon={Mail} {...register('donorEmail')} placeholder={t('form.emailPlaceholder')} />
              </FormField>
              <FormField wide label={t('form.notes')} htmlFor="nt">
                <Textarea id="nt" rows={2} {...register('notes')} placeholder={t('form.specialInstructions')} />
              </FormField>
            </FormGrid>
          </FormSection>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" leftIcon={RotateCcw} onClick={() => reset({ amount: '' })} disabled={isSubmitting}>
              {t('common.reset')}
            </Button>
            <Button type="submit" size="lg" loading={isSubmitting} rightIcon={ArrowRight}>
              {t('common.continueToPayment')}
            </Button>
          </div>
        </form>

        <div>
          <SectionHeading title={t('disasterRelief.myDonations')} description={t('disasterRelief.yourCampaignHistory')} size="md" />
          {loadingPast ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SkeletonStatCard />
              <SkeletonStatCard />
            </div>
          ) : past.length === 0 ? (
            <EmptyState
              icon={LifeBuoy}
              tone="disaster"
              title={t('disasterRelief.noDonations')}
              description={t('disasterRelief.noDonationsDesc')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {past.map((d) => (<DonationCard key={d.id} donation={d} />))}
            </div>
          )}
        </div>
      </PageContainer>

      <PaymentConfirmModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        title={t('disasterRelief.completePayment')}
        totalAmount={Number(pendingPayload?.amount) || 0}
        summaryLabel={t('disasterRelief.totalContribution')}
        summaryHint={pendingPayload?.campaignLabel ? `${t('sadqa.purpose')}: ${pendingPayload.campaignLabel}` : undefined}
        onConfirmedSubmit={handleConfirmed}
        successMessage={t('disasterRelief.donationRecorded')}
        successDescription={t('disasterRelief.donationRecordedDesc')}
      />
    </DashboardLayout>
  );
}
