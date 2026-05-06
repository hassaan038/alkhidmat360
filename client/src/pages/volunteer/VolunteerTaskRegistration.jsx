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
import { createVolunteerTask } from '../../services/volunteerService';
import { toast } from 'sonner';
import { HandHeart, User, Phone, Mail, Calendar, MapPin, Info, RotateCcw, ArrowRight, Shield, Briefcase } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';
import { pakistanPhoneSchema, strictEmailSchema } from '../../lib/validators';

const volunteerTaskSchema = z.object({
  volunteerName: z.string().min(2, 'Name must be at least 2 characters'),
  volunteerPhone: pakistanPhoneSchema,
  volunteerEmail: strictEmailSchema,
  volunteerAddress: z.string().min(10, 'Please provide a complete address'),
  taskCategory: z.enum(['DISTRIBUTION', 'FUNDRAISING', 'AWARENESS', 'ADMINISTRATIVE', 'FIELD_WORK', 'EVENT_SUPPORT']),
  availability: z.array(z.string()).min(1, 'Select at least one day'),
  skills: z.string().optional(),
  experience: z.string().optional(),
  preferredLocation: z.string().optional(),
  emergencyContact: pakistanPhoneSchema,
});

export default function VolunteerTaskRegistration() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);

  const DAYS_OF_WEEK = useMemo(() => [
    { value: 'monday', label: t('volunteer.mon') },
    { value: 'tuesday', label: t('volunteer.tue') },
    { value: 'wednesday', label: t('volunteer.wed') },
    { value: 'thursday', label: t('volunteer.thu') },
    { value: 'friday', label: t('volunteer.fri') },
    { value: 'saturday', label: t('volunteer.sat') },
    { value: 'sunday', label: t('volunteer.sun') },
  ], [t]);

  const TASK_CATEGORIES = useMemo(() => [
    { value: 'DISTRIBUTION', label: t('volunteer.distribution'), description: t('volunteer.distributionDesc') },
    { value: 'FUNDRAISING', label: t('volunteer.fundraising'), description: t('volunteer.fundraisingDesc') },
    { value: 'AWARENESS', label: t('volunteer.awareness'), description: t('volunteer.awarenessDesc') },
    { value: 'ADMINISTRATIVE', label: t('volunteer.administrative'), description: t('volunteer.administrativeDesc') },
    { value: 'FIELD_WORK', label: t('volunteer.fieldWork'), description: t('volunteer.fieldWorkDesc') },
    { value: 'EVENT_SUPPORT', label: t('volunteer.eventSupport'), description: t('volunteer.eventSupportDesc') },
  ], [t]);

  const infoPoints = useMemo(() => [
    t('volunteer.info1'),
    t('volunteer.info2'),
    t('volunteer.info3'),
    t('volunteer.info4'),
  ], [t]);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: zodResolver(volunteerTaskSchema),
    defaultValues: { availability: [] },
  });

  const handleDayToggle = (day) => {
    const next = selectedDays.includes(day) ? selectedDays.filter((d) => d !== day) : [...selectedDays, day];
    setSelectedDays(next);
    setValue('availability', next, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const submitData = { ...data, availability: JSON.stringify(data.availability) };
      await createVolunteerTask(submitData);
      toast.success(t('volunteer.submitted'), { description: t('volunteer.submittedDesc') });
      reset();
      setSelectedDays([]);
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
          icon={HandHeart}
          accent="volunteer"
          title={t('volunteer.title')}
          description={t('volunteer.description')}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title={t('volunteer.personalInformation')} icon={User}>
            <FormGrid cols={2}>
              <FormField wide label={t('volunteer.volunteerName')} required htmlFor="vn" error={errors.volunteerName?.message}>
                <Input id="vn" leftIcon={User} {...register('volunteerName')} placeholder={t('form.yourFullName')} />
              </FormField>
              <FormField label={t('volunteer.volunteerPhone')} required htmlFor="vp" error={errors.volunteerPhone?.message}>
                <Input id="vp" type="tel" leftIcon={Phone} {...register('volunteerPhone')} placeholder={t('form.phonePlaceholder')} />
              </FormField>
              <FormField label={t('volunteer.volunteerEmail')} required htmlFor="ve" error={errors.volunteerEmail?.message}>
                <Input id="ve" type="email" leftIcon={Mail} {...register('volunteerEmail')} placeholder={t('form.emailPlaceholder')} />
              </FormField>
              <FormField wide label={t('volunteer.volunteerAddress')} required htmlFor="va" error={errors.volunteerAddress?.message}>
                <Textarea id="va" rows={3} {...register('volunteerAddress')} placeholder={t('form.completeAddress')} />
              </FormField>
              <FormField wide label={t('volunteer.emergencyContact')} required htmlFor="ec" error={errors.emergencyContact?.message}>
                <Input id="ec" type="tel" leftIcon={Shield} {...register('emergencyContact')} placeholder={t('form.phonePlaceholder')} />
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection title={t('volunteer.taskPreference')} icon={Briefcase}>
            <FormField label={t('volunteer.taskCategory')} required htmlFor="tc" error={errors.taskCategory?.message}>
              <Select id="tc" {...register('taskCategory')}>
                <option value="">{t('volunteer.selectCategory')}</option>
                {TASK_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label} — {c.description}</option>
                ))}
              </Select>
            </FormField>

            <FormField label={t('volunteer.availability')} required error={errors.availability?.message} className="mt-4">
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const on = selectedDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleDayToggle(day.value)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors cursor-pointer',
                        on
                          ? 'bg-volunteer-600 text-white ring-volunteer-600'
                          : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 ring-gray-200 hover:ring-volunteer-300 hover:text-volunteer-700'
                      )}
                    >
                      <Calendar className="h-3 w-3" />
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </FormField>

            <FormField label={t('volunteer.preferredLocation')} hint={t('form.optional')} htmlFor="pl" className="mt-4">
              <Input id="pl" leftIcon={MapPin} {...register('preferredLocation')} placeholder={t('volunteer.preferredLocation')} />
            </FormField>
          </FormSection>

          <FormSection title={t('volunteer.skillsExperience')} icon={Briefcase}>
            <FormGrid cols={1}>
              <FormField label={t('volunteer.skills')} htmlFor="sk">
                <Textarea id="sk" rows={3} {...register('skills')} placeholder={t('volunteer.skills')} />
              </FormField>
              <FormField label={t('volunteer.experience')} htmlFor="ex">
                <Textarea id="ex" rows={3} {...register('experience')} placeholder={t('volunteer.experience')} />
              </FormField>
            </FormGrid>
          </FormSection>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" leftIcon={RotateCcw} onClick={() => { reset(); setSelectedDays([]); }} disabled={isSubmitting}>
              {t('common.reset')}
            </Button>
            <Button type="submit" size="lg" loading={isSubmitting} rightIcon={ArrowRight}>
              {t('common.submitRegistration')}
            </Button>
          </div>
        </form>

        <div className="rounded-2xl border border-volunteer-100 dark:border-volunteer-700/40 bg-volunteer-50/60 dark:bg-volunteer-500/10 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-volunteer-100 dark:bg-volunteer-500/15 text-volunteer-700 dark:text-volunteer-200">
              <Info className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-volunteer-700 dark:text-volunteer-200">{t('volunteer.volunteerInformation')}</h4>
              <ul className="mt-2 space-y-1 text-xs text-volunteer-700/90">
                {infoPoints.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-1.5 block h-1 w-1 flex-shrink-0 rounded-full bg-volunteer-500" />
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
