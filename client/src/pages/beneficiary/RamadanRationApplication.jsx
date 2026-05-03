import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import FormSection, { FormGrid, FormField } from '../../components/ui/FormSection';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { createRamadanRationApplication } from '../../services/applicationService';
import { toast } from 'sonner';
import { Apple, User, Phone, CreditCard, Users, Info, RotateCcw, ArrowRight, Coins } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ramadanRationSchema = z.object({
  familyMembers: z.coerce.number().int().min(1, 'Must have at least 1 family member'),
  monthlyIncome: z.coerce.number().nonnegative('Monthly income must be non-negative'),
  hasDisabledMembers: z.boolean(),
  disabilityDetails: z.string().optional(),
  applicantName: z.string().min(2, 'Name must be at least 2 characters'),
  applicantPhone: z.string().min(11).max(15),
  applicantCNIC: z.string().length(13, 'CNIC must be exactly 13 digits'),
  applicantAddress: z.string().min(10, 'Please provide a complete address'),
  reasonForApplication: z.string().min(10, 'Reason must be at least 10 characters'),
  previouslyReceived: z.boolean(),
  additionalNotes: z.string().optional(),
});

export default function RamadanRationApplication() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const infoPoints = useMemo(() => [
    t('ramadanRation.info1'),
    t('ramadanRation.info2'),
    t('ramadanRation.info3'),
    t('ramadanRation.info4'),
  ], [t]);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: zodResolver(ramadanRationSchema),
    defaultValues: { familyMembers: 1, monthlyIncome: 0, hasDisabledMembers: false, previouslyReceived: false },
  });
  const hasDisabledMembers = watch('hasDisabledMembers');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await createRamadanRationApplication(data);
      toast.success(t('ramadanRation.submitted'), { description: t('ramadanRation.submittedDesc') });
      reset();
    } catch (error) {
      toast.error(t('common.submissionFailed'), { description: error.response?.data?.message || t('common.tryAgainLater') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <PageContainer className="max-w-4xl space-y-6">
        <PageHeader
          icon={Apple}
          accent="ration"
          title={t('ramadanRation.title')}
          description={t('ramadanRation.description')}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title={t('ramadanRation.familyInformation')} icon={Users}>
            <FormGrid cols={2}>
              <FormField label={t('ramadanRation.familyMembers')} required htmlFor="fm" error={errors.familyMembers?.message}>
                <Input id="fm" type="number" min={1} {...register('familyMembers')} placeholder="5" />
              </FormField>
              <FormField label={t('ramadanRation.monthlyIncome')} required htmlFor="mi" error={errors.monthlyIncome?.message}>
                <Input id="mi" type="number" min={0} leftIcon={Coins} {...register('monthlyIncome')} placeholder="15000" />
              </FormField>
              <FormField wide htmlFor="dm">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    id="dm"
                    type="checkbox"
                    {...register('hasDisabledMembers')}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-primary-600 focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('ramadanRation.hasDisabledMembers')}</span>
                </label>
              </FormField>
              {hasDisabledMembers && (
                <FormField wide label={t('ramadanRation.disabilityDetails')} htmlFor="dd">
                  <Textarea id="dd" rows={3} {...register('disabilityDetails')} placeholder={t('form.specialInstructions')} />
                </FormField>
              )}
            </FormGrid>
          </FormSection>

          <FormSection title={t('ramadanRation.applicantInformation')} icon={User}>
            <FormGrid cols={2}>
              <FormField wide label={t('ramadanRation.applicantName')} required htmlFor="an" error={errors.applicantName?.message}>
                <Input id="an" leftIcon={User} {...register('applicantName')} placeholder={t('form.yourFullName')} />
              </FormField>
              <FormField label={t('ramadanRation.applicantPhone')} required htmlFor="ap" error={errors.applicantPhone?.message}>
                <Input id="ap" type="tel" leftIcon={Phone} {...register('applicantPhone')} placeholder={t('form.phonePlaceholder')} />
              </FormField>
              <FormField label={t('ramadanRation.applicantCNIC')} required htmlFor="ac" error={errors.applicantCNIC?.message}>
                <Input id="ac" leftIcon={CreditCard} maxLength={13} {...register('applicantCNIC')} placeholder="1234567890123" />
              </FormField>
              <FormField wide label={t('ramadanRation.applicantAddress')} required htmlFor="aa" error={errors.applicantAddress?.message}>
                <Textarea id="aa" rows={3} {...register('applicantAddress')} placeholder={t('form.completeAddress')} />
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection title={t('ramadanRation.applicationDetails')} icon={Apple}>
            <FormField label={t('ramadanRation.reasonForApplication')} required htmlFor="re" error={errors.reasonForApplication?.message}>
              <Textarea id="re" rows={4} {...register('reasonForApplication')} placeholder={t('form.specialInstructions')} />
            </FormField>
            <div className="mt-4">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register('previouslyReceived')}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-primary-600 focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('ramadanRation.previouslyReceived')}</span>
              </label>
            </div>
            <FormField label={t('ramadanRation.additionalNotes')} htmlFor="add" className="mt-4">
              <Textarea id="add" rows={3} {...register('additionalNotes')} placeholder={t('form.specialInstructions')} />
            </FormField>
          </FormSection>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" leftIcon={RotateCcw} onClick={() => reset()} disabled={isSubmitting}>
              {t('common.reset')}
            </Button>
            <Button type="submit" size="lg" loading={isSubmitting} rightIcon={ArrowRight}>
              {t('common.submitApplication')}
            </Button>
          </div>
        </form>

        <div className="rounded-2xl border border-ration-100 dark:border-ration-700/40 bg-ration-50/60 dark:bg-ration-500/10 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-ration-100 dark:bg-ration-500/15 text-ration-700 dark:text-ration-200">
              <Info className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-ration-700 dark:text-ration-200">{t('rationDonation.distributionInformation')}</h4>
              <ul className="mt-2 space-y-1 text-xs text-ration-700/90">
                {infoPoints.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-1.5 block h-1 w-1 flex-shrink-0 rounded-full bg-ration-500" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
