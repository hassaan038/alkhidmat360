import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import FormSection, { FormGrid, FormField } from '../../components/ui/FormSection';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Heart, Bot, Mountain, Beef, Info, RotateCcw, ArrowRight, User, Phone, Calendar, FileText } from 'lucide-react';
import { createQurbaniDonation } from '../../services/donationService';
import PaymentConfirmModal from '../../components/payments/PaymentConfirmModal';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';

const qurbaniSchema = z.object({
  animalType: z.enum(['GOAT', 'CAMEL', 'COW'], { required_error: 'Please select an animal type' }),
  quantity: z.coerce.number().int().min(1).max(100),
  totalAmount: z.coerce.number().positive('Amount must be positive'),
  donorName: z.string().min(2, 'Name must be at least 2 characters'),
  donorPhone: z.string().min(11, 'Phone number must be at least 11 digits').max(15, 'Phone number must not exceed 15 digits'),
  donorAddress: z.string().min(10, 'Please provide a complete address'),
  deliveryDate: z.string().optional(),
  notes: z.string().optional(),
});

export default function QurbaniDonation() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  const animals = useMemo(() => [
    { value: 'GOAT', label: t('qurbaniDonation.goat'), icon: Bot, hint: t('qurbaniDonation.goatHint') },
    { value: 'COW', label: t('qurbaniDonation.cow'), icon: Beef, hint: t('qurbaniDonation.cowHint') },
    { value: 'CAMEL', label: t('qurbaniDonation.camel'), icon: Mountain, hint: t('qurbaniDonation.camelHint') },
  ], [t]);

  const infoPoints = useMemo(() => [
    t('qurbaniDonation.info1'),
    t('qurbaniDonation.info2'),
    t('qurbaniDonation.info3'),
    t('qurbaniDonation.info4'),
  ], [t]);

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    resolver: zodResolver(qurbaniSchema),
    defaultValues: { animalType: 'GOAT', quantity: 1, totalAmount: 30000 },
  });

  const animalType = watch('animalType');
  const quantity = watch('quantity');
  const suggested = (animalType === 'GOAT' ? 30000 : animalType === 'COW' ? 210000 : animalType === 'CAMEL' ? 300000 : 0) * (quantity || 1);

  const amountTouchedRef = useRef(false);
  useEffect(() => {
    if (amountTouchedRef.current) return;
    if (suggested > 0) {
      setValue('totalAmount', suggested, { shouldDirty: false, shouldValidate: false });
    }
  }, [suggested, setValue]);

  const onSubmit = (data) => {
    setPendingPayload(data);
    setPaymentOpen(true);
  };

  const handlePaymentConfirmed = async ({ paymentMarked, paymentScreenshot }) => {
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(pendingPayload || {}).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') fd.append(k, String(v));
      });
      fd.append('paymentMarked', String(paymentMarked));
      if (paymentScreenshot) fd.append('paymentScreenshot', paymentScreenshot);
      await createQurbaniDonation(fd);
      reset();
      amountTouchedRef.current = false;
      setPendingPayload(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <PageContainer className="max-w-4xl space-y-6">
        <PageHeader
          icon={Heart}
          accent="qurbani"
          title={t('qurbaniDonation.title')}
          description={t('qurbaniDonation.description')}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title={t('qurbaniDonation.donationDetails')} icon={Heart}>
            <FormField label={t('qurbaniDonation.animalType')} required error={errors.animalType?.message}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {animals.map((a) => {
                  const AIcon = a.icon;
                  const selected = animalType === a.value;
                  return (
                    <label
                      key={a.value}
                      className={cn(
                        'relative flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors duration-200',
                        selected
                          ? 'border-qurbani-500 bg-qurbani-50 dark:bg-qurbani-500/10 ring-1 ring-inset ring-qurbani-200 dark:ring-qurbani-700/40'
                          : 'border-gray-200 dark:border-gray-800 hover:border-qurbani-300 hover:bg-gray-50'
                      )}
                    >
                      <input type="radio" value={a.value} {...register('animalType')} className="sr-only" />
                      <span
                        className={cn(
                          'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-colors',
                          selected ? 'bg-qurbani-100 dark:bg-qurbani-500/15 text-qurbani-700 dark:text-qurbani-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        )}
                      >
                        <AIcon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{a.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{a.hint}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </FormField>

            <FormGrid cols={2} className="mt-5">
              <FormField label={t('qurbaniDonation.quantity')} required htmlFor="qty" error={errors.quantity?.message}>
                <Input id="qty" type="number" min={1} {...register('quantity')} placeholder={t('qurbaniDonation.enterQuantity')} />
              </FormField>
              <FormField
                label={t('qurbaniDonation.totalAmount')}
                required
                htmlFor="total"
                error={errors.totalAmount?.message}
              >
                <Input
                  id="total"
                  type="number"
                  min={1}
                  {...register('totalAmount', { onChange: () => { amountTouchedRef.current = true; } })}
                  placeholder={t('qurbaniDonation.enterAmount')}
                />
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection title={t('qurbaniDonation.donorInformation')} icon={User} description={t('qurbaniDonation.donorInformationDesc')}>
            <FormGrid cols={2}>
              <FormField label={t('form.fullName')} required htmlFor="donorName" error={errors.donorName?.message}>
                <Input id="donorName" leftIcon={User} {...register('donorName')} placeholder={t('form.yourFullName')} />
              </FormField>
              <FormField label={t('form.phoneNumber')} required htmlFor="donorPhone" error={errors.donorPhone?.message}>
                <Input id="donorPhone" type="tel" leftIcon={Phone} {...register('donorPhone')} placeholder={t('form.phonePlaceholder')} />
              </FormField>
              <FormField wide label={t('form.address')} required htmlFor="donorAddress" error={errors.donorAddress?.message}>
                <Textarea id="donorAddress" rows={3} {...register('donorAddress')} placeholder={t('form.completeAddress')} />
              </FormField>
              <FormField label={t('form.preferredDeliveryDate')} htmlFor="deliveryDate" hint={t('form.optionalSubject')}>
                <Input id="deliveryDate" type="date" leftIcon={Calendar} {...register('deliveryDate')} />
              </FormField>
              <FormField label={t('form.notes')} htmlFor="notes" hint={t('form.specialInstructions')}>
                <Input id="notes" leftIcon={FileText} {...register('notes')} placeholder={t('form.optionalNotes')} />
              </FormField>
            </FormGrid>
          </FormSection>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" leftIcon={RotateCcw} onClick={() => { reset(); amountTouchedRef.current = false; }} disabled={isSubmitting}>
              {t('common.reset')}
            </Button>
            <Button type="submit" size="lg" loading={isSubmitting} rightIcon={ArrowRight}>
              {t('common.continueToPayment')}
            </Button>
          </div>
        </form>

        {/* Info panel */}
        <div className="rounded-2xl border border-qurbani-100 dark:border-qurbani-700/40 bg-qurbani-50/60 dark:bg-qurbani-500/10 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-qurbani-100 dark:bg-qurbani-500/15 text-qurbani-700 dark:text-qurbani-200">
              <Info className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-qurbani-700 dark:text-qurbani-200">{t('common.importantInformation')}</h4>
              <ul className="mt-2 space-y-1 text-xs text-qurbani-700/90">
                {infoPoints.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-1.5 block h-1 w-1 flex-shrink-0 rounded-full bg-qurbani-500" />
                    <span>{p}</span>
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
        title={t('qurbaniDonation.completeQurbaniPayment')}
        totalAmount={Number(pendingPayload?.totalAmount) || 0}
        summaryLabel={t('qurbaniDonation.totalDonation')}
        summaryHint={pendingPayload ? `${pendingPayload.quantity} × ${pendingPayload.animalType?.toLowerCase()}` : undefined}
        onConfirmedSubmit={handlePaymentConfirmed}
        successMessage={t('qurbaniDonation.donationRecorded')}
        successDescription={t('qurbaniDonation.donationRecordedDesc')}
      />
    </DashboardLayout>
  );
}
