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
import { createLoanApplication } from '../../services/applicationService';
import { toast } from 'sonner';
import {
  DollarSign, Briefcase, GraduationCap, Stethoscope, Home, Heart, FileText,
  User, Phone, CreditCard, Info, RotateCcw, ArrowRight, Coins, Users,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';

const loanApplicationSchema = z.object({
  loanType: z.enum(['BUSINESS', 'EDUCATION', 'MEDICAL', 'HOUSING', 'MARRIAGE', 'OTHER']),
  requestedAmount: z.coerce.number().positive('Requested amount must be positive'),
  monthlyIncome: z.coerce.number().nonnegative('Monthly income must be non-negative'),
  familyMembers: z.coerce.number().int().min(1),
  employmentStatus: z.string().min(2).max(50),
  purposeDescription: z.string().min(10, 'Purpose description must be at least 10 characters'),
  applicantName: z.string().min(2),
  applicantPhone: z.string().min(11).max(15),
  applicantCNIC: z.string().length(13, 'CNIC must be exactly 13 digits'),
  applicantAddress: z.string().min(10, 'Please provide a complete address'),
  guarantorName: z.string().min(2).optional().or(z.literal('')),
  guarantorPhone: z.string().min(11).max(15).optional().or(z.literal('')),
  guarantorCNIC: z.string().length(13).optional().or(z.literal('')),
  guarantorAddress: z.string().min(10).optional().or(z.literal('')),
  additionalNotes: z.string().optional(),
});

export default function LoanApplication() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loanTypes = useMemo(() => [
    { value: 'BUSINESS', label: t('loanApplication.business'), icon: Briefcase },
    { value: 'EDUCATION', label: t('loanApplication.education'), icon: GraduationCap },
    { value: 'MEDICAL', label: t('loanApplication.medical'), icon: Stethoscope },
    { value: 'HOUSING', label: t('loanApplication.housing'), icon: Home },
    { value: 'MARRIAGE', label: t('loanApplication.marriage'), icon: Heart },
    { value: 'OTHER', label: t('loanApplication.other'), icon: FileText },
  ], [t]);

  const infoPoints = useMemo(() => [
    t('loanApplication.info1'),
    t('loanApplication.info2'),
    t('loanApplication.info3'),
    t('loanApplication.info4'),
  ], [t]);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: { loanType: 'BUSINESS', familyMembers: 1, monthlyIncome: 0, requestedAmount: 0 },
  });
  const selectedLoanType = watch('loanType');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await createLoanApplication(data);
      toast.success(t('loanApplication.submitted'), {
        description: t('loanApplication.submittedDesc'),
      });
      reset();
    } catch (error) {
      toast.error(t('common.submissionFailed'), {
        description: error.response?.data?.message || t('common.tryAgainLater'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <PageContainer className="max-w-4xl space-y-6">
        <PageHeader
          icon={DollarSign}
          accent="loan"
          title={t('loanApplication.title')}
          description={t('loanApplication.description')}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title={t('loanApplication.loanType')} icon={Briefcase}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {loanTypes.map((type) => {
                const TypeIcon = type.icon;
                const selected = selectedLoanType === type.value;
                return (
                  <label
                    key={type.value}
                    className={cn(
                      'relative flex cursor-pointer flex-col items-center justify-center rounded-xl border p-4 transition-colors duration-200',
                      selected
                        ? 'border-loan-500 bg-loan-50 dark:bg-loan-500/10 ring-1 ring-inset ring-loan-200 dark:ring-loan-700/40'
                        : 'border-gray-200 dark:border-gray-800 hover:border-loan-300 hover:bg-gray-50'
                    )}
                  >
                    <input type="radio" value={type.value} {...register('loanType')} className="sr-only" />
                    <span
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg mb-2 transition-colors',
                        selected ? 'bg-loan-100 dark:bg-loan-500/15 text-loan-700 dark:text-loan-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                      )}
                    >
                      <TypeIcon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium text-center">{type.label}</span>
                  </label>
                );
              })}
            </div>
          </FormSection>

          <FormSection title={t('loanApplication.financialInformation')} icon={Coins}>
            <FormGrid cols={2}>
              <FormField label={t('loanApplication.requestedAmount')} required htmlFor="ra" error={errors.requestedAmount?.message}>
                <Input id="ra" type="number" min={1} {...register('requestedAmount')} placeholder="50000" />
              </FormField>
              <FormField label={t('loanApplication.monthlyIncome')} required htmlFor="mi" error={errors.monthlyIncome?.message}>
                <Input id="mi" type="number" min={0} {...register('monthlyIncome')} placeholder="30000" />
              </FormField>
              <FormField label={t('loanApplication.familyMembers')} required htmlFor="fm" error={errors.familyMembers?.message}>
                <Input id="fm" type="number" min={1} {...register('familyMembers')} placeholder="5" />
              </FormField>
              <FormField label={t('loanApplication.employmentStatus')} required htmlFor="es" error={errors.employmentStatus?.message}>
                <Select id="es" {...register('employmentStatus')}>
                  <option value="">{t('loanApplication.selectStatus')}</option>
                  <option value="Employed">{t('loanApplication.employed')}</option>
                  <option value="Self-Employed">{t('loanApplication.selfEmployed')}</option>
                  <option value="Unemployed">{t('loanApplication.unemployed')}</option>
                  <option value="Daily Wage">{t('loanApplication.dailyWage')}</option>
                  <option value="Retired">{t('loanApplication.retired')}</option>
                  <option value="Student">{t('loanApplication.student')}</option>
                </Select>
              </FormField>
              <FormField wide label={t('loanApplication.purposeDescription')} required htmlFor="pd" error={errors.purposeDescription?.message}>
                <Textarea id="pd" rows={4} {...register('purposeDescription')} placeholder={t('loanApplication.purposePlaceholder')} />
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection title={t('loanApplication.applicantInformation')} icon={User}>
            <FormGrid cols={2}>
              <FormField wide label={t('loanApplication.applicantName')} required htmlFor="an" error={errors.applicantName?.message}>
                <Input id="an" leftIcon={User} {...register('applicantName')} placeholder={t('form.yourFullName')} />
              </FormField>
              <FormField label={t('loanApplication.applicantPhone')} required htmlFor="ap" error={errors.applicantPhone?.message}>
                <Input id="ap" type="tel" leftIcon={Phone} {...register('applicantPhone')} placeholder={t('form.phonePlaceholder')} />
              </FormField>
              <FormField label={t('loanApplication.applicantCNIC')} required htmlFor="ac" error={errors.applicantCNIC?.message}>
                <Input id="ac" leftIcon={CreditCard} maxLength={13} {...register('applicantCNIC')} placeholder="1234567890123" />
              </FormField>
              <FormField wide label={t('loanApplication.applicantAddress')} required htmlFor="aa" error={errors.applicantAddress?.message}>
                <Textarea id="aa" rows={3} {...register('applicantAddress')} placeholder={t('form.completeAddress')} />
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection title={t('loanApplication.guarantorInformation')} icon={Users}>
            <FormGrid cols={2}>
              <FormField wide label={t('loanApplication.guarantorName')} htmlFor="gn">
                <Input id="gn" leftIcon={User} {...register('guarantorName')} placeholder={t('form.yourFullName')} />
              </FormField>
              <FormField label={t('loanApplication.guarantorPhone')} htmlFor="gp">
                <Input id="gp" type="tel" leftIcon={Phone} {...register('guarantorPhone')} placeholder={t('form.phonePlaceholder')} />
              </FormField>
              <FormField label={t('loanApplication.guarantorCNIC')} htmlFor="gc">
                <Input id="gc" leftIcon={CreditCard} maxLength={13} {...register('guarantorCNIC')} placeholder="1234567890123" />
              </FormField>
              <FormField wide label={t('loanApplication.guarantorAddress')} htmlFor="ga">
                <Textarea id="ga" rows={2} {...register('guarantorAddress')} placeholder={t('form.completeAddress')} />
              </FormField>
              <FormField wide label={t('loanApplication.additionalNotes')} htmlFor="add">
                <Textarea id="add" rows={2} {...register('additionalNotes')} placeholder={t('form.specialInstructions')} />
              </FormField>
            </FormGrid>
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

        <div className="rounded-2xl border border-loan-100 dark:border-loan-700/40 bg-loan-50/60 dark:bg-loan-500/10 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-loan-100 dark:bg-loan-500/15 text-loan-700 dark:text-loan-200">
              <Info className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-loan-700 dark:text-loan-200">{t('common.importantInformation')}</h4>
              <ul className="mt-2 space-y-1 text-xs text-loan-700/90">
                {infoPoints.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-1.5 block h-1 w-1 flex-shrink-0 rounded-full bg-loan-500" />
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
