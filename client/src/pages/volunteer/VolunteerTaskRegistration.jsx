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
import { createVolunteerTask } from '../../services/volunteerService';
import { toast } from 'sonner';
import { HandHeart, User, Phone, Mail, Calendar, MapPin, Info, RotateCcw, ArrowRight, Shield, Briefcase } from 'lucide-react';
import { cn } from '../../lib/utils';

const volunteerTaskSchema = z.object({
  volunteerName: z.string().min(2, 'Name must be at least 2 characters'),
  volunteerPhone: z.string().min(11).max(15),
  volunteerEmail: z.string().email('Invalid email address'),
  volunteerAddress: z.string().min(10, 'Please provide a complete address'),
  taskCategory: z.enum(['DISTRIBUTION', 'FUNDRAISING', 'AWARENESS', 'ADMINISTRATIVE', 'FIELD_WORK', 'EVENT_SUPPORT']),
  availability: z.array(z.string()).min(1, 'Select at least one day'),
  skills: z.string().optional(),
  experience: z.string().optional(),
  preferredLocation: z.string().optional(),
  emergencyContact: z.string().min(11).max(15),
});

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' },
];

const TASK_CATEGORIES = [
  { value: 'DISTRIBUTION', label: 'Distribution', description: 'Food/aid distribution to beneficiaries' },
  { value: 'FUNDRAISING', label: 'Fundraising', description: 'Organizing fundraising campaigns' },
  { value: 'AWARENESS', label: 'Awareness', description: 'Community awareness programs' },
  { value: 'ADMINISTRATIVE', label: 'Administrative', description: 'Office and documentation work' },
  { value: 'FIELD_WORK', label: 'Field Work', description: 'On-ground assistance and surveys' },
  { value: 'EVENT_SUPPORT', label: 'Event Support', description: 'Helping organize events' },
];

const infoPoints = [
  'All registrations are reviewed within 2–3 business days.',
  'You will be contacted via phone if your registration is approved.',
  'Training sessions are provided for specific task categories.',
  'Volunteer opportunities are available year-round.',
];

export default function VolunteerTaskRegistration() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);

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
      toast.success('Registration submitted', { description: 'Your volunteer registration will be reviewed shortly.' });
      reset();
      setSelectedDays([]);
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
          icon={HandHeart}
          accent="volunteer"
          title="Volunteer Registration"
          description="Register to volunteer for distribution, fundraising, awareness, and field work."
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title="Personal information" icon={User}>
            <FormGrid cols={2}>
              <FormField wide label="Full name" required htmlFor="vn" error={errors.volunteerName?.message}>
                <Input id="vn" leftIcon={User} {...register('volunteerName')} placeholder="Your full name" />
              </FormField>
              <FormField label="Phone number" required htmlFor="vp" error={errors.volunteerPhone?.message}>
                <Input id="vp" type="tel" leftIcon={Phone} {...register('volunteerPhone')} placeholder="03001234567" />
              </FormField>
              <FormField label="Email" required htmlFor="ve" error={errors.volunteerEmail?.message}>
                <Input id="ve" type="email" leftIcon={Mail} {...register('volunteerEmail')} placeholder="you@example.com" />
              </FormField>
              <FormField wide label="Address" required htmlFor="va" error={errors.volunteerAddress?.message}>
                <Textarea id="va" rows={3} {...register('volunteerAddress')} placeholder="Complete residential address" />
              </FormField>
              <FormField wide label="Emergency contact" required htmlFor="ec" error={errors.emergencyContact?.message}>
                <Input id="ec" type="tel" leftIcon={Shield} {...register('emergencyContact')} placeholder="Next-of-kin phone number" />
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection title="Task preference & availability" icon={Briefcase}>
            <FormField label="Preferred task category" required htmlFor="tc" error={errors.taskCategory?.message}>
              <Select id="tc" {...register('taskCategory')}>
                <option value="">Select a category</option>
                {TASK_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label} — {c.description}</option>
                ))}
              </Select>
            </FormField>

            <FormField label="Availability (days)" required error={errors.availability?.message} className="mt-4">
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
                          : 'bg-white text-gray-700 ring-gray-200 hover:ring-volunteer-300 hover:text-volunteer-700'
                      )}
                    >
                      <Calendar className="h-3 w-3" />
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </FormField>

            <FormField label="Preferred location" hint="Optional" htmlFor="pl" className="mt-4">
              <Input id="pl" leftIcon={MapPin} {...register('preferredLocation')} placeholder="e.g., Karachi, Lahore, Islamabad" />
            </FormField>
          </FormSection>

          <FormSection title="Skills & experience" icon={Briefcase} description="Optional — helps us match you with the right tasks.">
            <FormGrid cols={1}>
              <FormField label="Skills" htmlFor="sk">
                <Textarea id="sk" rows={3} {...register('skills')} placeholder="e.g., first aid, public speaking, event management" />
              </FormField>
              <FormField label="Previous volunteer experience" htmlFor="ex">
                <Textarea id="ex" rows={3} {...register('experience')} placeholder="Describe any previous volunteer or community work" />
              </FormField>
            </FormGrid>
          </FormSection>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" leftIcon={RotateCcw} onClick={() => { reset(); setSelectedDays([]); }} disabled={isSubmitting}>
              Reset
            </Button>
            <Button type="submit" size="lg" loading={isSubmitting} rightIcon={ArrowRight}>
              Submit registration
            </Button>
          </div>
        </form>

        <div className="rounded-2xl border border-volunteer-100 bg-volunteer-50/60 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-volunteer-100 text-volunteer-700">
              <Info className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-volunteer-700">Volunteer information</h4>
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
