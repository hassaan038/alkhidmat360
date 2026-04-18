import { useState } from 'react';
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

const infoPoints = [
  'Applications are reviewed based on need and eligibility.',
  'Distribution centers are announced before Ramadan.',
  'You will be notified via phone if approved.',
  'CNIC verification is mandatory for collection.',
];

export default function RamadanRationApplication() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: zodResolver(ramadanRationSchema),
    defaultValues: { familyMembers: 1, monthlyIncome: 0, hasDisabledMembers: false, previouslyReceived: false },
  });
  const hasDisabledMembers = watch('hasDisabledMembers');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await createRamadanRationApplication(data);
      toast.success('Application submitted', { description: 'Your application will be reviewed shortly.' });
      reset();
    } catch (error) {
      toast.error('Submission failed', { description: error.response?.data?.message || 'Please try again later' });
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
          title="Ramadan Ration Application"
          description="Apply for a Ramadan ration package — we review by family size, income, and need."
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title="Family information" icon={Users}>
            <FormGrid cols={2}>
              <FormField label="Family members" required htmlFor="fm" error={errors.familyMembers?.message}>
                <Input id="fm" type="number" min={1} {...register('familyMembers')} placeholder="e.g., 5" />
              </FormField>
              <FormField label="Monthly income (PKR)" required htmlFor="mi" error={errors.monthlyIncome?.message}>
                <Input id="mi" type="number" min={0} leftIcon={Coins} {...register('monthlyIncome')} placeholder="e.g., 15000" />
              </FormField>
              <FormField wide htmlFor="dm">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    id="dm"
                    type="checkbox"
                    {...register('hasDisabledMembers')}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-primary-600 focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">My family has disabled or special needs members</span>
                </label>
              </FormField>
              {hasDisabledMembers && (
                <FormField wide label="Disability details" htmlFor="dd">
                  <Textarea id="dd" rows={3} {...register('disabilityDetails')} placeholder="Describe the condition and any special needs" />
                </FormField>
              )}
            </FormGrid>
          </FormSection>

          <FormSection title="Applicant information" icon={User}>
            <FormGrid cols={2}>
              <FormField wide label="Full name" required htmlFor="an" error={errors.applicantName?.message}>
                <Input id="an" leftIcon={User} {...register('applicantName')} placeholder="Your full name" />
              </FormField>
              <FormField label="Phone number" required htmlFor="ap" error={errors.applicantPhone?.message}>
                <Input id="ap" type="tel" leftIcon={Phone} {...register('applicantPhone')} placeholder="03001234567" />
              </FormField>
              <FormField label="CNIC (13 digits)" required htmlFor="ac" error={errors.applicantCNIC?.message}>
                <Input id="ac" leftIcon={CreditCard} maxLength={13} {...register('applicantCNIC')} placeholder="1234567890123" />
              </FormField>
              <FormField wide label="Address" required htmlFor="aa" error={errors.applicantAddress?.message}>
                <Textarea id="aa" rows={3} {...register('applicantAddress')} placeholder="Complete address with area and landmarks" />
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection title="Application details" icon={Apple}>
            <FormField label="Reason for application" required htmlFor="re" error={errors.reasonForApplication?.message}>
              <Textarea id="re" rows={4} {...register('reasonForApplication')} placeholder="Explain why you need the ration package and your current circumstances" />
            </FormField>
            <div className="mt-4">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register('previouslyReceived')}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-primary-600 focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">I have previously received ration from Alkhidmat</span>
              </label>
            </div>
            <FormField label="Additional notes" htmlFor="add" className="mt-4">
              <Textarea id="add" rows={3} {...register('additionalNotes')} placeholder="Any additional information you'd like to share" />
            </FormField>
          </FormSection>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" leftIcon={RotateCcw} onClick={() => reset()} disabled={isSubmitting}>
              Reset
            </Button>
            <Button type="submit" size="lg" loading={isSubmitting} rightIcon={ArrowRight}>
              Submit application
            </Button>
          </div>
        </form>

        <div className="rounded-2xl border border-ration-100 dark:border-ration-700/40 bg-ration-50/60 dark:bg-ration-500/10 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-ration-100 dark:bg-ration-500/15 text-ration-700 dark:text-ration-200">
              <Info className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-ration-700 dark:text-ration-200">Distribution information</h4>
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
