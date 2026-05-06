import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import FormSection, { FormGrid, FormField } from '../../components/ui/FormSection';
import Input, { Textarea, Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { createOrphanSponsorship } from '../../services/donationService';
import { Baby, Heart, User, Phone, Mail, RotateCcw, ArrowRight } from 'lucide-react';
import PaymentConfirmModal from '../../components/payments/PaymentConfirmModal';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';
import { pakistanPhoneSchema, strictEmailSchema } from '../../lib/validators';

const orphanSponsorshipSchema = z.object({
  sponsorshipType: z.string().min(2).max(50),
  monthlyAmount: z.coerce.number().positive('Monthly amount must be positive'),
  duration: z.coerce.number().int().min(1).max(120),
  totalAmount: z.coerce.number().positive('Total amount must be positive'),
  sponsorName: z.string().min(2, 'Name must be at least 2 characters'),
  sponsorPhone: pakistanPhoneSchema,
  sponsorEmail: strictEmailSchema,
  sponsorAddress: z.string().min(10, 'Please provide a complete address'),
  orphanAge: z.string().optional(),
  orphanGender: z.string().optional(),
  startDate: z.string().optional(),
  notes: z.string().optional(),
});

export default function OrphanSponsorship() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [customMode, setCustomMode] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  const sponsorshipTypes = useMemo(() => [
    { id: 'basic', name: t('orphanSponsorship.basicTier'), monthlyAmount: 5000, description: t('orphanSponsorship.basicDesc') },
    { id: 'standard', name: t('orphanSponsorship.standardTier'), monthlyAmount: 8000, description: t('orphanSponsorship.standardDesc') },
    { id: 'premium', name: t('orphanSponsorship.premiumTier'), monthlyAmount: 12000, description: t('orphanSponsorship.premiumDesc') },
  ], [t]);

  const benefits = useMemo(() => [
    t('orphanSponsorship.info1'),
    t('orphanSponsorship.info2'),
    t('orphanSponsorship.info3'),
    t('orphanSponsorship.info4'),
    t('orphanSponsorship.info5'),
  ], [t]);

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    resolver: zodResolver(orphanSponsorshipSchema),
    defaultValues: { monthlyAmount: 0, duration: 12, totalAmount: 0 },
  });
  const monthlyAmount = watch('monthlyAmount');
  const duration = watch('duration');

  const handleTypeSelect = (type) => {
    setSelectedType(type.id);
    setCustomMode(false);
    setValue('sponsorshipType', type.name, { shouldValidate: true });
    setValue('monthlyAmount', type.monthlyAmount);
    setValue('totalAmount', type.monthlyAmount * (duration || 1));
  };

  const enableCustom = () => {
    setSelectedType('');
    setCustomMode(true);
    setValue('sponsorshipType', '', { shouldValidate: false });
  };

  const handleDurationChange = (e) => {
    const newDuration = parseInt(e.target.value) || 0;
    setValue('totalAmount', (monthlyAmount || 0) * newDuration);
  };

  const onSubmit = (data) => {
    // eslint-disable-next-line no-unused-vars
    const { sponsorshipType, totalAmount, sponsorAddress, ...sponsorshipData } = data;
    setPendingPayload({ ...sponsorshipData, _totalCommitment: totalAmount });
    setPaymentOpen(true);
  };

  const handlePaymentConfirmed = async ({ paymentMarked, paymentScreenshot }) => {
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(pendingPayload || {}).forEach(([k, v]) => {
        if (k.startsWith('_')) return;
        if (v !== undefined && v !== null && v !== '') fd.append(k, String(v));
      });
      fd.append('paymentMarked', String(paymentMarked));
      if (paymentScreenshot) fd.append('paymentScreenshot', paymentScreenshot);
      await createOrphanSponsorship(fd);
      reset();
      setSelectedType('');
      setCustomMode(false);
      setPendingPayload(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <PageContainer className="max-w-4xl space-y-6">
        <PageHeader
          icon={Baby}
          accent="orphan"
          title={t('orphanSponsorship.title')}
          description={t('orphanSponsorship.description')}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title={t('orphanSponsorship.pickTier')} icon={Heart}>
            <div className="grid grid-cols-1 gap-3">
              {sponsorshipTypes.map((type) => (
                <label
                  key={type.id}
                  className={cn(
                    'relative flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 transition-colors duration-200',
                    selectedType === type.id
                      ? 'border-orphan-500 bg-orphan-50 dark:bg-orphan-500/10 ring-1 ring-inset ring-orphan-200 dark:ring-orphan-700/40'
                      : 'border-gray-200 dark:border-gray-800 hover:border-orphan-300 hover:bg-gray-50'
                  )}
                  onClick={() => handleTypeSelect(type)}
                >
                  <input type="radio" value={type.name} {...register('sponsorshipType')} className="sr-only" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{type.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{type.description}</p>
                  </div>
                  <p className="flex-shrink-0 text-base font-bold text-orphan-600 tabular-nums">
                    PKR {type.monthlyAmount.toLocaleString()}<span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('common.perMonth')}</span>
                  </p>
                </label>
              ))}
            </div>

            {!customMode ? (
              <button
                type="button"
                onClick={enableCustom}
                className="mt-3 text-sm font-medium text-orphan-600 hover:text-orphan-700 underline-offset-2 hover:underline cursor-pointer"
              >
                {t('orphanSponsorship.noneFitCustom')}
              </button>
            ) : (
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('orphanSponsorship.customTier')}</label>
                  <button
                    type="button"
                    onClick={() => { setCustomMode(false); setValue('sponsorshipType', '', { shouldValidate: false }); }}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    {t('orphanSponsorship.usePresetInstead')}
                  </button>
                </div>
                <Input {...register('sponsorshipType')} placeholder={t('orphanSponsorship.customPlaceholder')} autoFocus />
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('orphanSponsorship.customAmountHint')}</p>
              </div>
            )}
            {errors.sponsorshipType && <p className="mt-2 text-xs text-error-dark">{errors.sponsorshipType.message}</p>}

            <FormGrid cols={3} className="mt-5">
              <FormField label={t('orphanSponsorship.monthlyAmount')} required htmlFor="ma" error={errors.monthlyAmount?.message}>
                <Input id="ma" type="number" min={1} {...register('monthlyAmount')} />
              </FormField>
              <FormField label={t('orphanSponsorship.duration')} required htmlFor="du" error={errors.duration?.message}>
                <Input id="du" type="number" min={1} {...register('duration', { onChange: handleDurationChange })} />
              </FormField>
              <FormField label={t('orphanSponsorship.totalCol')} required htmlFor="ta" error={errors.totalAmount?.message} hint={t('orphanSponsorship.autoCalculated')}>
                <Input id="ta" type="number" readOnly {...register('totalAmount')} className="bg-gray-50 dark:bg-gray-900" />
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection title={t('orphanSponsorship.sponsorInformation')} icon={User}>
            <FormGrid cols={2}>
              <FormField wide label={t('form.fullName')} required htmlFor="sn" error={errors.sponsorName?.message}>
                <Input id="sn" leftIcon={User} {...register('sponsorName')} placeholder={t('form.yourFullName')} />
              </FormField>
              <FormField label={t('form.phoneNumber')} required htmlFor="sp" error={errors.sponsorPhone?.message}>
                <Input id="sp" type="tel" leftIcon={Phone} {...register('sponsorPhone')} placeholder={t('form.phonePlaceholder')} />
              </FormField>
              <FormField label={t('form.emailAddress')} required htmlFor="se" error={errors.sponsorEmail?.message}>
                <Input id="se" type="email" leftIcon={Mail} {...register('sponsorEmail')} placeholder={t('form.emailPlaceholder')} />
              </FormField>
              <FormField wide label={t('form.address')} required htmlFor="sa" error={errors.sponsorAddress?.message}>
                <Textarea id="sa" rows={3} {...register('sponsorAddress')} placeholder={t('orphanSponsorship.completeMailingAddress')} />
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection title={t('orphanSponsorship.orphanPreferences')} icon={Baby} description={t('orphanSponsorship.orphanPreferencesDesc')}>
            <FormGrid cols={3}>
              <FormField label={t('orphanSponsorship.orphanAge')} htmlFor="oa">
                <Select id="oa" {...register('orphanAge')}>
                  <option value="">{t('orphanSponsorship.anyAge')}</option>
                  <option value="0-5">{t('orphanSponsorship.age0_5')}</option>
                  <option value="6-10">{t('orphanSponsorship.age6_10')}</option>
                  <option value="11-15">{t('orphanSponsorship.age11_15')}</option>
                  <option value="16-18">{t('orphanSponsorship.age16_18')}</option>
                </Select>
              </FormField>
              <FormField label={t('orphanSponsorship.orphanGender')} htmlFor="og">
                <Select id="og" {...register('orphanGender')}>
                  <option value="">{t('orphanSponsorship.anyGender')}</option>
                  <option value="male">{t('common.male')}</option>
                  <option value="female">{t('common.female')}</option>
                </Select>
              </FormField>
              <FormField label={t('orphanSponsorship.startDate')} htmlFor="sd">
                <Input id="sd" type="date" {...register('startDate')} />
              </FormField>
              <FormField wide label={t('form.additionalNotes')} htmlFor="nt">
                <Textarea id="nt" rows={2} {...register('notes')} placeholder={t('orphanSponsorship.specialMessagePlaceholder')} />
              </FormField>
            </FormGrid>
          </FormSection>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" leftIcon={RotateCcw} onClick={() => { reset(); setSelectedType(''); setCustomMode(false); }} disabled={isSubmitting}>
              {t('common.reset')}
            </Button>
            <Button type="submit" size="lg" loading={isSubmitting} rightIcon={ArrowRight}>
              {t('orphanSponsorship.continueToFirstPayment')}
            </Button>
          </div>
        </form>

        <div className="rounded-2xl border border-orphan-100 dark:border-orphan-700/40 bg-orphan-50/60 dark:bg-orphan-500/10 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-orphan-100 dark:bg-orphan-500/15 text-orphan-700 dark:text-orphan-200">
              <Heart className="h-4 w-4 fill-orphan-600" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-orphan-700 dark:text-orphan-200">{t('orphanSponsorship.whatIncludes')}</h4>
              <ul className="mt-2 space-y-1 text-xs text-orphan-700/90">
                {benefits.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="mt-1.5 block h-1 w-1 flex-shrink-0 rounded-full bg-orphan-500" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </PageContainer>

      <PaymentConfirmModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        title={t('orphanSponsorship.completeFirstPayment')}
        totalAmount={Number(pendingPayload?.monthlyAmount) || 0}
        summaryLabel={t('orphanSponsorship.firstMonthPayment')}
        summaryHint={
          pendingPayload
            ? `${pendingPayload.duration}-${t('orphanSponsorship.monthCommitment')} ${Number(pendingPayload._totalCommitment || 0).toLocaleString()}`
            : undefined
        }
        onConfirmedSubmit={handlePaymentConfirmed}
        successMessage={t('orphanSponsorship.sponsorshipRecorded')}
        successDescription={t('orphanSponsorship.sponsorshipRecordedDesc')}
      />
    </DashboardLayout>
  );
}
