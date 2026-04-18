import { useState } from 'react';
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

const loanTypes = [
  { value: 'BUSINESS', label: 'Business', icon: Briefcase },
  { value: 'EDUCATION', label: 'Education', icon: GraduationCap },
  { value: 'MEDICAL', label: 'Medical', icon: Stethoscope },
  { value: 'HOUSING', label: 'Housing', icon: Home },
  { value: 'MARRIAGE', label: 'Marriage', icon: Heart },
  { value: 'OTHER', label: 'Other', icon: FileText },
];

const infoPoints = [
  'All loans are interest-free (Qarz-e-Hasna).',
  'Applications are reviewed within 7–10 business days.',
  'Document verification is required after initial review.',
  'Repayment terms are discussed during approval.',
];

export default function LoanApplication() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: { loanType: 'BUSINESS', familyMembers: 1, monthlyIncome: 0, requestedAmount: 0 },
  });
  const selectedLoanType = watch('loanType');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await createLoanApplication(data);
      toast.success('Loan application submitted', {
        description: 'Your application will be reviewed within 7–10 business days.',
      });
      reset();
    } catch (error) {
      toast.error('Submission failed', {
        description: error.response?.data?.message || 'Please try again later',
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
          title="Loan Application"
          description="Apply for an interest-free loan (Qarz-e-Hasna) — pick a purpose, fill the details, and submit."
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title="Loan type" icon={Briefcase} description="What is this loan for?">
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
                        ? 'border-loan-500 bg-loan-50 ring-1 ring-inset ring-loan-200'
                        : 'border-gray-200 hover:border-loan-300 hover:bg-gray-50'
                    )}
                  >
                    <input type="radio" value={type.value} {...register('loanType')} className="sr-only" />
                    <span
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg mb-2 transition-colors',
                        selected ? 'bg-loan-100 text-loan-700' : 'bg-gray-100 text-gray-500'
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

          <FormSection title="Financial information" icon={Coins}>
            <FormGrid cols={2}>
              <FormField label="Requested amount (PKR)" required htmlFor="ra" error={errors.requestedAmount?.message}>
                <Input id="ra" type="number" min={0} {...register('requestedAmount')} placeholder="e.g., 50000" />
              </FormField>
              <FormField label="Monthly income (PKR)" required htmlFor="mi" error={errors.monthlyIncome?.message}>
                <Input id="mi" type="number" min={0} {...register('monthlyIncome')} placeholder="e.g., 30000" />
              </FormField>
              <FormField label="Family members" required htmlFor="fm" error={errors.familyMembers?.message}>
                <Input id="fm" type="number" min={1} {...register('familyMembers')} placeholder="e.g., 5" />
              </FormField>
              <FormField label="Employment status" required htmlFor="es" error={errors.employmentStatus?.message}>
                <Select id="es" {...register('employmentStatus')}>
                  <option value="">Select status</option>
                  <option value="Employed">Employed</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Daily Wage">Daily Wage</option>
                  <option value="Retired">Retired</option>
                  <option value="Student">Student</option>
                </Select>
              </FormField>
              <FormField wide label="Purpose description" required htmlFor="pd" error={errors.purposeDescription?.message}>
                <Textarea id="pd" rows={4} {...register('purposeDescription')} placeholder="Explain in detail why you need this loan and how it will be used" />
              </FormField>
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
                <Textarea id="aa" rows={3} {...register('applicantAddress')} placeholder="Complete residential address" />
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection title="Guarantor information" icon={Users} description="Optional — providing a guarantor improves your application.">
            <FormGrid cols={2}>
              <FormField wide label="Guarantor name" htmlFor="gn">
                <Input id="gn" leftIcon={User} {...register('guarantorName')} placeholder="Full name" />
              </FormField>
              <FormField label="Guarantor phone" htmlFor="gp">
                <Input id="gp" type="tel" leftIcon={Phone} {...register('guarantorPhone')} placeholder="03001234567" />
              </FormField>
              <FormField label="Guarantor CNIC" htmlFor="gc">
                <Input id="gc" leftIcon={CreditCard} maxLength={13} {...register('guarantorCNIC')} placeholder="1234567890123" />
              </FormField>
              <FormField wide label="Guarantor address" htmlFor="ga">
                <Textarea id="ga" rows={2} {...register('guarantorAddress')} placeholder="Complete residential address" />
              </FormField>
              <FormField wide label="Additional notes" htmlFor="add">
                <Textarea id="add" rows={2} {...register('additionalNotes')} placeholder="Anything else you'd like to share" />
              </FormField>
            </FormGrid>
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

        <div className="rounded-2xl border border-loan-100 bg-loan-50/60 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-loan-100 text-loan-700">
              <Info className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-loan-700">Important information</h4>
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
