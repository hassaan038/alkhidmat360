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
import { createOrphanRegistration } from '../../services/applicationService';
import { toast } from 'sonner';
import { Baby, User, Phone, CreditCard, School, HeartPulse, Coins, Users, Info, RotateCcw, ArrowRight } from 'lucide-react';

const orphanRegistrationSchema = z.object({
  orphanName: z.string().min(2, 'Name must be at least 2 characters'),
  orphanAge: z.coerce.number().int().min(0).max(18, 'Orphan must be 18 or younger'),
  orphanGender: z.enum(['MALE', 'FEMALE']),
  guardianRelation: z.string().min(2).max(50),
  guardianName: z.string().min(2, 'Name must be at least 2 characters'),
  guardianPhone: z.string().min(11).max(15),
  guardianCNIC: z.string().length(13, 'CNIC must be exactly 13 digits'),
  guardianAddress: z.string().min(10, 'Please provide a complete address'),
  monthlyIncome: z.coerce.number().nonnegative(),
  familyMembers: z.coerce.number().int().min(1),
  educationLevel: z.string().min(2).max(50),
  schoolName: z.string().min(2).optional().or(z.literal('')),
  healthCondition: z.string().optional(),
  fatherStatus: z.enum(['DECEASED', 'UNKNOWN', 'ABSENT']),
  motherStatus: z.enum(['DECEASED', 'ALIVE', 'UNKNOWN', 'ABSENT']),
  additionalNotes: z.string().optional(),
});

const infoPoints = [
  'Our team verifies every registration within 7–10 days.',
  'A home visit may be required for verification.',
  'Required: Guardian CNIC, birth certificate (if available).',
  'Approved orphans become eligible for sponsorship and support.',
];

export default function OrphanRegistration() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(orphanRegistrationSchema),
    defaultValues: {
      orphanAge: 0, orphanGender: 'MALE', monthlyIncome: 0, familyMembers: 1,
      fatherStatus: 'DECEASED', motherStatus: 'ALIVE',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await createOrphanRegistration(data);
      toast.success('Registration submitted', { description: 'Our team will contact you for verification within 7 days.' });
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
          icon={Baby}
          accent="orphan"
          title="Orphan Registration"
          description="Register an orphan child for support and sponsorship. Our team verifies every entry."
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title="Orphan information" icon={Baby}>
            <FormGrid cols={2}>
              <FormField wide label="Orphan full name" required htmlFor="on" error={errors.orphanName?.message}>
                <Input id="on" {...register('orphanName')} placeholder="Orphan's full name" />
              </FormField>
              <FormField label="Age" required htmlFor="oa" error={errors.orphanAge?.message}>
                <Input id="oa" type="number" min={0} max={18} {...register('orphanAge')} placeholder="e.g., 10" />
              </FormField>
              <FormField label="Gender" required htmlFor="og" error={errors.orphanGender?.message}>
                <Select id="og" {...register('orphanGender')}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </Select>
              </FormField>
              <FormField label="Father status" required htmlFor="fs" error={errors.fatherStatus?.message}>
                <Select id="fs" {...register('fatherStatus')}>
                  <option value="DECEASED">Deceased</option>
                  <option value="UNKNOWN">Unknown</option>
                  <option value="ABSENT">Absent</option>
                </Select>
              </FormField>
              <FormField label="Mother status" required htmlFor="ms" error={errors.motherStatus?.message}>
                <Select id="ms" {...register('motherStatus')}>
                  <option value="DECEASED">Deceased</option>
                  <option value="ALIVE">Alive</option>
                  <option value="UNKNOWN">Unknown</option>
                  <option value="ABSENT">Absent</option>
                </Select>
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection title="Education" icon={School}>
            <FormGrid cols={2}>
              <FormField label="Education level" required htmlFor="el" error={errors.educationLevel?.message}>
                <Input id="el" {...register('educationLevel')} placeholder="e.g., Grade 5, Not enrolled" />
              </FormField>
              <FormField label="School name" htmlFor="sn" hint="If enrolled">
                <Input id="sn" {...register('schoolName')} placeholder="School name" />
              </FormField>
              <FormField wide label="Health condition" htmlFor="hc">
                <Textarea id="hc" rows={2} {...register('healthCondition')} placeholder="Any health issues, disabilities, or special needs" />
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection title="Guardian information" icon={User}>
            <FormGrid cols={2}>
              <FormField label="Guardian name" required htmlFor="gn" error={errors.guardianName?.message}>
                <Input id="gn" leftIcon={User} {...register('guardianName')} placeholder="Your full name" />
              </FormField>
              <FormField label="Relation to orphan" required htmlFor="gr" error={errors.guardianRelation?.message}>
                <Input id="gr" {...register('guardianRelation')} placeholder="e.g., Uncle, Grandmother" />
              </FormField>
              <FormField label="Guardian phone" required htmlFor="gp" error={errors.guardianPhone?.message}>
                <Input id="gp" type="tel" leftIcon={Phone} {...register('guardianPhone')} placeholder="03001234567" />
              </FormField>
              <FormField label="Guardian CNIC" required htmlFor="gc" error={errors.guardianCNIC?.message}>
                <Input id="gc" leftIcon={CreditCard} maxLength={13} {...register('guardianCNIC')} placeholder="1234567890123" />
              </FormField>
              <FormField wide label="Guardian address" required htmlFor="ga" error={errors.guardianAddress?.message}>
                <Textarea id="ga" rows={3} {...register('guardianAddress')} placeholder="Complete residential address" />
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection title="Household information" icon={Users}>
            <FormGrid cols={2}>
              <FormField label="Monthly income (PKR)" required htmlFor="mi" error={errors.monthlyIncome?.message}>
                <Input id="mi" type="number" min={0} leftIcon={Coins} {...register('monthlyIncome')} placeholder="e.g., 20000" />
              </FormField>
              <FormField label="Total family members" required htmlFor="fm" error={errors.familyMembers?.message}>
                <Input id="fm" type="number" min={1} {...register('familyMembers')} placeholder="e.g., 6" />
              </FormField>
              <FormField wide label="Additional notes" htmlFor="an">
                <Textarea id="an" rows={3} {...register('additionalNotes')} placeholder="Any additional information about the orphan's circumstances" />
              </FormField>
            </FormGrid>
          </FormSection>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" leftIcon={RotateCcw} onClick={() => reset()} disabled={isSubmitting}>
              Reset
            </Button>
            <Button type="submit" size="lg" loading={isSubmitting} rightIcon={ArrowRight}>
              Submit registration
            </Button>
          </div>
        </form>

        <div className="rounded-2xl border border-orphan-100 dark:border-orphan-700/40 bg-orphan-50/60 dark:bg-orphan-500/10 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-orphan-100 dark:bg-orphan-500/15 text-orphan-700 dark:text-orphan-200">
              <Info className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-orphan-700 dark:text-orphan-200">Registration process</h4>
              <ul className="mt-2 space-y-1 text-xs text-orphan-700/90">
                {infoPoints.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-1.5 block h-1 w-1 flex-shrink-0 rounded-full bg-orphan-500" />
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
