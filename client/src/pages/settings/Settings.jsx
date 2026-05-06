import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Settings as SettingsIcon, User, KeyRound, Trash2, AlertTriangle, CheckCircle2,
  Mail, Phone, CreditCard, Lock, ShieldAlert,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import FormSection, { FormGrid, FormField } from '../../components/ui/FormSection';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import { SkeletonStatCard } from '../../components/ui/Skeleton';
import * as userService from '../../services/userService';
import useAuthStore from '../../store/authStore';
import { cn, formatApiError, formatDate } from '../../lib/utils';
import {
  cnicOptionalSchema,
  pakistanPhoneSchema,
  strictEmailSchema,
} from '../../lib/validators';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: strictEmailSchema,
  phoneNumber: pakistanPhoneSchema,
  cnic: cnicOptionalSchema,
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

const TAB_IDS = [
  { id: 'profile', labelKey: 'settings.profile', icon: User },
  { id: 'security', labelKey: 'settings.security', icon: KeyRound },
  { id: 'danger', labelKey: 'settings.dangerZone', icon: ShieldAlert },
];

function ProfileSection({ profile, onUpdated, t }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.fullName || '',
      email: profile.email || '',
      phoneNumber: profile.phoneNumber || '',
      cnic: profile.cnic || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await userService.updateMyProfile(data);
      toast.success(t('settings.profileUpdated'));
      const next = res.data?.user;
      if (next) {
        reset({
          fullName: next.fullName || '',
          email: next.email || '',
          phoneNumber: next.phoneNumber || '',
          cnic: next.cnic || '',
        });
        onUpdated?.(next);
      }
    } catch (err) {
      toast.error(t('settings.updateFailed'), { description: formatApiError(err) });
    }
  };

  return (
    <FormSection title={t('settings.profile')} icon={User} description={t('settings.profileDesc')}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormGrid cols={2}>
          <FormField label={t('settings.fullName')} required htmlFor="fn" error={errors.fullName?.message}>
            <Input id="fn" leftIcon={User} {...register('fullName')} />
          </FormField>
          <FormField label={t('settings.email')} required htmlFor="em" error={errors.email?.message}>
            <Input id="em" type="email" leftIcon={Mail} {...register('email')} />
          </FormField>
          <FormField label={t('settings.phone')} required htmlFor="ph" error={errors.phoneNumber?.message}>
            <Input id="ph" type="tel" leftIcon={Phone} {...register('phoneNumber')} placeholder="03001234567" />
          </FormField>
          <FormField label={t('settings.cnic')} hint={t('settings.cnicHint')} htmlFor="cn" error={errors.cnic?.message}>
            <Input id="cn" leftIcon={CreditCard} {...register('cnic')} />
          </FormField>
        </FormGrid>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">{t('settings.accountType')}:</span>
            <Badge variant="primary" size="sm">{profile.userType}</Badge>
          </div>
          {profile.createdAt && (
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t('settings.memberSince')}:</span>{' '}
              <span className="font-medium text-gray-900 dark:text-gray-50">{formatDate(profile.createdAt)}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => reset()} disabled={isSubmitting || !isDirty}>
            {t('settings.discard')}
          </Button>
          <Button type="submit" loading={isSubmitting} disabled={!isDirty} leftIcon={CheckCircle2}>
            {t('settings.saveProfile')}
          </Button>
        </div>
      </form>
    </FormSection>
  );
}

function PasswordSection({ t }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data) => {
    try {
      await userService.changeMyPassword(data);
      toast.success(t('settings.passwordUpdated'));
      reset();
    } catch (err) {
      toast.error(t('settings.updateFailed'), { description: formatApiError(err) });
    }
  };

  return (
    <FormSection title={t('settings.changePassword')} icon={KeyRound} description={t('settings.securityDesc')}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label={t('settings.currentPassword')} required htmlFor="cp" error={errors.currentPassword?.message}>
          <Input id="cp" type="password" leftIcon={Lock} {...register('currentPassword')} />
        </FormField>
        <FormGrid cols={2}>
          <FormField label={t('settings.newPassword')} required htmlFor="np" error={errors.newPassword?.message}>
            <Input id="np" type="password" leftIcon={Lock} {...register('newPassword')} placeholder={t('auth.login.passwordHint')} />
          </FormField>
          <FormField label={t('settings.confirmPassword')} required htmlFor="cpw" error={errors.confirmPassword?.message}>
            <Input id="cpw" type="password" leftIcon={Lock} {...register('confirmPassword')} />
          </FormField>
        </FormGrid>
        <div className="flex justify-end pt-2">
          <Button type="submit" loading={isSubmitting} leftIcon={CheckCircle2}>
            {t('settings.changePassword')}
          </Button>
        </div>
      </form>
    </FormSection>
  );
}

function DangerZone({ t }) {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetState = () => {
    setPassword('');
    setConfirmation('');
  };

  const handleDelete = async () => {
    if (confirmation !== 'DELETE') {
      toast.error(t('settings.typeDelete'), { description: t('settings.deleteMatchExact') });
      return;
    }
    setSubmitting(true);
    try {
      await userService.deleteMyAccount({ password, confirmation });
      toast.success(t('settings.accountDeleted'));
      logout?.();
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(t('settings.deleteFailed'), { description: formatApiError(err) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormSection
      title={t('settings.deleteAccount')}
      icon={Trash2}
      description={t('settings.deleteDesc')}
      className="border-error/40"
    >
      <Alert variant="warning" className="mb-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="text-xs">
            {t('settings.deleteWarning')}
          </p>
        </div>
      </Alert>

      {!open ? (
        <Button
          type="button"
          variant="outline"
          leftIcon={Trash2}
          onClick={() => setOpen(true)}
          className="border-error/40 text-error-dark hover:bg-error-light/60"
        >
          {t('settings.deleteAccount')}
        </Button>
      ) : (
        <div className="space-y-3 border border-error/30 rounded-xl p-4 bg-error-light/30">
          <FormField label={t('settings.confirmWithPassword')} htmlFor="pw">
            <Input id="pw" type="password" leftIcon={Lock} value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormField>
          <FormField label={<>{t('settings.typeDeleteLabel')} <strong className="font-bold">DELETE</strong></>} htmlFor="conf">
            <Input id="conf" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder="DELETE" />
          </FormField>
          <div className="flex justify-end gap-2 pt-2 border-t border-error/30">
            <Button
              type="button"
              variant="outline"
              onClick={() => { resetState(); setOpen(false); }}
              disabled={submitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              leftIcon={Trash2}
              loading={submitting}
              onClick={handleDelete}
              disabled={!password || confirmation !== 'DELETE'}
            >
              {t('settings.permanentlyDelete')}
            </Button>
          </div>
        </div>
      )}
    </FormSection>
  );
}

export default function Settings() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('profile');
  const setUser = useAuthStore((s) => s.setUser);

  const TABS = TAB_IDS.map((tab) => ({ ...tab, label: t(tab.labelKey) }));

  const load = async () => {
    setLoading(true);
    try {
      const res = await userService.getMyProfile();
      setProfile(res.data?.user || null);
    } catch (err) {
      toast.error(t('settings.loadFailed'), { description: formatApiError(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  return (
    <DashboardLayout>
      <PageContainer className="max-w-4xl space-y-6">
        <PageHeader
          icon={SettingsIcon}
          accent="primary"
          title={t('settings.title')}
          description={t('settings.pageDesc')}
        />

        {loading || !profile ? (
          <SkeletonStatCard />
        ) : (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-800">
              <nav className="flex gap-1 overflow-x-auto -mb-px">
                {TABS.map((tabItem) => {
                  const Icon = tabItem.icon;
                  const active = tab === tabItem.id;
                  const isDanger = tabItem.id === 'danger';
                  return (
                    <button
                      key={tabItem.id}
                      onClick={() => setTab(tabItem.id)}
                      className={cn(
                        'relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg border-b-2 transition-colors cursor-pointer',
                        active
                          ? isDanger
                            ? 'border-error text-error-dark'
                            : 'border-primary-600 text-primary-700'
                          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {tabItem.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div>
              {tab === 'profile' && (
                <ProfileSection
                  profile={profile}
                  t={t}
                  onUpdated={(next) => {
                    setProfile(next);
                    if (typeof setUser === 'function') setUser(next);
                  }}
                />
              )}
              {tab === 'security' && <PasswordSection t={t} />}
              {tab === 'danger' && <DangerZone t={t} />}
            </div>
          </>
        )}
      </PageContainer>
    </DashboardLayout>
  );
}
