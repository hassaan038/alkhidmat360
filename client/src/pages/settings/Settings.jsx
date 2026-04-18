import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Settings as SettingsIcon,
  User,
  KeyRound,
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FadeIn from '../../components/animations/FadeIn';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { SkeletonCard } from '../../components/common/Skeleton';
import * as userService from '../../services/userService';
import useAuthStore from '../../store/authStore';
import { formatApiError, formatDate } from '../../lib/utils';

// ============================================
// SCHEMAS
// ============================================

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phoneNumber: z
    .string()
    .min(10, 'Phone must be at least 10 digits')
    .max(20, 'Phone is too long'),
  cnic: z
    .string()
    .min(13, 'CNIC must be at least 13 digits')
    .max(15, 'CNIC is too long')
    .optional()
    .or(z.literal('')),
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

const inputClass =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent';

// ============================================
// PROFILE SECTION
// ============================================

function ProfileSection({ profile, onUpdated }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
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
      toast.success('Profile updated');
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
      toast.error('Update failed', { description: formatApiError(err) });
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary-600" />
          Profile
        </CardTitle>
        <CardDescription>
          Your account details. Updates take effect immediately.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-error">*</span>
              </label>
              <input {...register('fullName')} className={inputClass} />
              {errors.fullName && (
                <p className="mt-1 text-xs text-error">{errors.fullName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-error">*</span>
              </label>
              <input type="email" {...register('email')} className={inputClass} />
              {errors.email && (
                <p className="mt-1 text-xs text-error">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-error">*</span>
              </label>
              <input
                type="tel"
                {...register('phoneNumber')}
                className={inputClass}
                placeholder="03001234567"
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-xs text-error">{errors.phoneNumber.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNIC (Optional)
              </label>
              <input
                {...register('cnic')}
                className={inputClass}
                placeholder="13 digits, no dashes"
              />
              {errors.cnic && (
                <p className="mt-1 text-xs text-error">{errors.cnic.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
            <div>
              <span className="text-gray-500">Account type:</span>{' '}
              <span className="font-medium text-gray-900">{profile.userType}</span>
            </div>
            {profile.createdAt && (
              <div>
                <span className="text-gray-500">Member since:</span>{' '}
                <span className="font-medium text-gray-900">
                  {formatDate(profile.createdAt)}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isSubmitting || !isDirty}
            >
              Discard
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================
// PASSWORD SECTION
// ============================================

function PasswordSection() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data) => {
    try {
      await userService.changeMyPassword(data);
      toast.success('Password updated');
      reset();
    } catch (err) {
      toast.error('Update failed', { description: formatApiError(err) });
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-primary-600" />
          Change Password
        </CardTitle>
        <CardDescription>
          Keep your account secure by using a strong password you don't reuse elsewhere.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password <span className="text-error">*</span>
            </label>
            <input
              type="password"
              {...register('currentPassword')}
              className={inputClass}
            />
            {errors.currentPassword && (
              <p className="mt-1 text-xs text-error">
                {errors.currentPassword.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password <span className="text-error">*</span>
              </label>
              <input
                type="password"
                {...register('newPassword')}
                className={inputClass}
              />
              {errors.newPassword && (
                <p className="mt-1 text-xs text-error">{errors.newPassword.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password <span className="text-error">*</span>
              </label>
              <input
                type="password"
                {...register('confirmPassword')}
                className={inputClass}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-error">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-200">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating…
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================
// DANGER ZONE
// ============================================

function DangerZone() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setPassword('');
    setConfirmation('');
  };

  const handleDelete = async () => {
    if (confirmation !== 'DELETE') {
      toast.error('Type DELETE to confirm', {
        description: 'The confirmation text must match exactly.',
      });
      return;
    }
    setSubmitting(true);
    try {
      await userService.deleteMyAccount({ password, confirmation });
      toast.success('Account deleted');
      // Server cleared the session; clear client state too and bounce.
      logout?.();
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error('Could not delete account', { description: formatApiError(err) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="shadow-soft border-error/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-error-dark">
          <Trash2 className="w-5 h-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>
          Permanently delete your account and all of your data. This action can't be undone.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="warning" className="mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-xs">
              Deleting your account also removes every donation, application, booking,
              and submission tied to it. There is no recovery.
            </p>
          </div>
        </Alert>

        {!open ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(true)}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete My Account
          </Button>
        ) : (
          <div className="space-y-3 border border-error/30 rounded-lg p-4 bg-error-light/30">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm with your password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <strong>DELETE</strong> to confirm
              </label>
              <input
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                className={inputClass}
                placeholder="DELETE"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-error/30">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  setOpen(false);
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                disabled={submitting || !password || confirmation !== 'DELETE'}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Permanently delete
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// PAGE
// ============================================

export default function Settings() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const setUser = useAuthStore((s) => s.setUser);

  const load = async () => {
    setLoading(true);
    try {
      const res = await userService.getMyProfile();
      setProfile(res.data?.user || null);
    } catch (err) {
      toast.error('Failed to load profile', { description: formatApiError(err) });
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
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        <FadeIn direction="down" delay={0}>
          <div className="mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
              <SettingsIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">
                Manage your profile, password and account.
              </p>
            </div>
          </div>
        </FadeIn>

        {loading || !profile ? (
          <SkeletonCard />
        ) : (
          <FadeIn direction="up" delay={100}>
            <div className="space-y-6">
              <ProfileSection
                profile={profile}
                onUpdated={(next) => {
                  setProfile(next);
                  // Keep auth store + sidebar header in sync with renamed fields.
                  if (typeof setUser === 'function') {
                    setUser(next);
                  }
                }}
              />
              <PasswordSection />
              <DangerZone />
            </div>
          </FadeIn>
        )}
      </div>
    </DashboardLayout>
  );
}
