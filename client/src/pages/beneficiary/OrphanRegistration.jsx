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
import { createOrphanRegistration } from '../../services/applicationService';
import { toast } from 'sonner';
import { Baby, User, Phone, CreditCard, School, Coins, Users, Info, RotateCcw, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

export default function OrphanRegistration() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const infoPoints = useMemo(() => [
    t('orphanReg.info1'),
    t('orphanReg.info2'),
    t('orphanReg.info3'),
    t('orphanReg.info4'),
  ], [t]);

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
      toast.success(t('orphanReg.submitted'), { description: t('orphanReg.submittedDesc') });
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
          icon={Baby}
          accent="orphan"
          title={t('orphanReg.title')}
          description={t('orphanReg.description')}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title={t('orphanReg.orphanInformation')} icon={Baby}>
            <FormGrid cols={2}>
              <FormField wide label={t('orphanReg.orphanName')} required htmlFor="on" error={errors.orphanName?.message}>
                <Input id="on" {...register('orphanName')} placeholder={t('form.yourFullName')} />
              </FormField>
              <FormField label={t('orphanReg.orphanAge')} required htmlFor="oa" error={errors.orphanAge?.message}>
                <Input id="oa" type="number" min={0} max={18} {...register('orphanAge')} placeholder="10" />
              </FormField>
              <FormField label={t('orphanReg.orphanGender')} required htmlFor="og" error={errors.orphanGender?.message}>
                <Select id="og" {...register('orphanGender')}>
                  <option value="MALE">{t('orphanReg.male')}</option>
                  <option value="FEMALE">{t('orphanReg.female')}</option>
                </Select>
              </FormField>
              <FormField label={t('orphanReg.fatherStatus')} required htmlFor="fs" error={errors.fatherStatus?.message}>
                <Select id="fs" {...register('fatherStatus')}>
                  <option value="DECEASED">{t('orphanReg.deceased')}</option>
                  <option value="UNKNOWN">{t('orphanReg.unknown')}</option>
                  <option value="ABSENT">{t('orphanReg.absent')}</option>
                </Select>
              </FormField>
              <FormField label={t('orphanReg.motherStatus')} required htmlFor="ms" error={errors.motherStatus?.message}>
                <Select id="ms" {...register('motherStatus')}>
                  <option value="DECEASED">{t('orphanReg.deceased')}</option>
                  <option value="ALIVE">{t('orphanReg.alive')}</option>
                  <option value="UNKNOWN">{t('orphanReg.unknown')}</option>
                  <option value="ABSENT">{t('orphanReg.absent')}</option>
                </Select>
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection title={t('orphanReg.education')} icon={School}>
            <FormGrid cols={2}>
              <FormField label={t('orphanReg.educationLevel')} required htmlFor="el" error={errors.educationLevel?.message}>
                <Input id="el" {...register('educationLevel')} placeholder="Grade 5" />
              </FormField>
              <FormField label={t('orphanReg.schoolName')} htmlFor="sn">
                <Input id="sn" {...register('schoolName')} placeholder={t('orphanReg.schoolName')} />
              </FormField>
              <FormField wide label={t('orphanReg.healthCondition')} htmlFor="hc">
                <Textarea id="hc" rows={2} {...register('healthCondition')} placeholder={t('form.specialInstructions')} />
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection title={t('orphanReg.guardianInformation')} icon={User}>
            <FormGrid cols={2}>
              <FormField label={t('orphanReg.guardianName')} required htmlFor="gn" error={errors.guardianName?.message}>
                <Input id="gn" leftIcon={User} {...register('guardianName')} placeholder={t('form.yourFullName')} />
              </FormField>
              <FormField label={t('orphanReg.guardianRelation')} required htmlFor="gr" error={errors.guardianRelation?.message}>
                <Input id="gr" {...register('guardianRelation')} placeholder={t('orphanReg.guardianRelation')} />
              </FormField>
              <FormField label={t('orphanReg.guardianPhone')} required htmlFor="gp" error={errors.guardianPhone?.message}>
                <Input id="gp" type="tel" leftIcon={Phone} {...register('guardianPhone')} placeholder={t('form.phonePlaceholder')} />
              </FormField>
              <FormField label={t('orphanReg.guardianCNIC')} required htmlFor="gc" error={errors.guardianCNIC?.message}>
                <Input id="gc" leftIcon={CreditCard} maxLength={13} {...register('guardianCNIC')} placeholder="1234567890123" />
              </FormField>
              <FormField wide label={t('orphanReg.guardianAddress')} required htmlFor="ga" error={errors.guardianAddress?.message}>
                <Textarea id="ga" rows={3} {...register('guardianAddress')} placeholder={t('form.completeAddress')} />
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection title={t('orphanReg.householdInformation')} icon={Users}>
            <FormGrid cols={2}>
              <FormField label={t('orphanReg.monthlyIncome')} required htmlFor="mi" error={errors.monthlyIncome?.message}>
                <Input id="mi" type="number" min={0} leftIcon={Coins} {...register('monthlyIncome')} placeholder="20000" />
              </FormField>
              <FormField label={t('orphanReg.familyMembers')} required htmlFor="fm" error={errors.familyMembers?.message}>
                <Input id="fm" type="number" min={1} {...register('familyMembers')} placeholder="6" />
              </FormField>
              <FormField wide label={t('orphanReg.additionalNotes')} htmlFor="an">
                <Textarea id="an" rows={3} {...register('additionalNotes')} placeholder={t('form.specialInstructions')} />
              </FormField>
            </FormGrid>
          </FormSection>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" leftIcon={RotateCcw} onClick={() => reset()} disabled={isSubmitting}>
              {t('common.reset')}
            </Button>
            <Button type="submit" size="lg" loading={isSubmitting} rightIcon={ArrowRight}>
              {t('common.submitRegistration')}
            </Button>
          </div>
        </form>

        <div className="rounded-2xl border border-orphan-100 dark:border-orphan-700/40 bg-orphan-50/60 dark:bg-orphan-500/10 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-orphan-100 dark:bg-orphan-500/15 text-orphan-700 dark:text-orphan-200">
              <Info className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-orphan-700 dark:text-orphan-200">{t('orphanReg.registrationProcess')}</h4>
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
