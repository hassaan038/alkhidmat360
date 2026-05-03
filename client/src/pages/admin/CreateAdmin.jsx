import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import FormSection, { FormGrid, FormField } from '../../components/ui/FormSection';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { toast } from 'sonner';
import { UserPlus, Mail, Lock, User, Phone, CreditCard, ShieldCheck, Info, RotateCcw, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

const createAdminSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().min(11).max(15),
  cnic: z.string().length(13).optional().or(z.literal('')),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function CreateAdmin() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(createAdminSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const { confirmPassword: _cp, ...adminData } = data;
      await api.post('/admin/create-admin', adminData);
      toast.success(t('createAdmin.created'), { description: t('createAdmin.createdDesc') });
      reset();
    } catch (error) {
      toast.error(t('common.submissionFailed'), { description: error.response?.data?.message || t('common.tryAgainLater') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <PageContainer className="max-w-3xl space-y-6">
        <PageHeader
          icon={UserPlus}
          accent="primary"
          title={t('createAdmin.title')}
          description={t('createAdmin.description')}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title={t('settings.profile')} icon={User}>
            <FormGrid cols={2}>
              <FormField wide label={t('createAdmin.fullName')} required htmlFor="fn" error={errors.fullName?.message}>
                <Input id="fn" leftIcon={User} {...register('fullName')} placeholder={t('form.yourFullName')} />
              </FormField>
              <FormField wide label={t('createAdmin.email')} required htmlFor="em" error={errors.email?.message}>
                <Input id="em" type="email" leftIcon={Mail} {...register('email')} placeholder={t('form.emailPlaceholder')} />
              </FormField>
              <FormField label={t('createAdmin.phone')} required htmlFor="ph" error={errors.phoneNumber?.message}>
                <Input id="ph" type="tel" leftIcon={Phone} {...register('phoneNumber')} placeholder={t('form.phonePlaceholder')} />
              </FormField>
              <FormField label={t('settings.cnic')} htmlFor="cn" hint={t('settings.cnicHint')} error={errors.cnic?.message}>
                <Input id="cn" leftIcon={CreditCard} maxLength={13} {...register('cnic')} placeholder="1234567890123" />
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection title={t('createAdmin.password')} icon={Lock}>
            <FormGrid cols={2}>
              <FormField label={t('createAdmin.password')} required htmlFor="pw" error={errors.password?.message}>
                <Input id="pw" type="password" leftIcon={Lock} {...register('password')} placeholder={t('createAdmin.passwordHint')} />
              </FormField>
              <FormField label={t('settings.confirmPassword')} required htmlFor="cpw" error={errors.confirmPassword?.message}>
                <Input id="cpw" type="password" leftIcon={Lock} {...register('confirmPassword')} placeholder={t('settings.confirmPassword')} />
              </FormField>
            </FormGrid>
          </FormSection>

          <div className="rounded-2xl border border-primary-100 bg-primary-50/60 p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
                <Info className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-sm font-semibold text-primary-700 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> {t('roles.ADMIN')}
                </h4>
                <p className="mt-1 text-xs text-primary-700/90 leading-relaxed">
                  {t('createAdmin.description')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" leftIcon={RotateCcw} onClick={() => reset()} disabled={isSubmitting}>
              {t('common.reset')}
            </Button>
            <Button type="submit" size="lg" loading={isSubmitting} rightIcon={ArrowRight}>
              {t('createAdmin.submit')}
            </Button>
          </div>
        </form>
      </PageContainer>
    </DashboardLayout>
  );
}
