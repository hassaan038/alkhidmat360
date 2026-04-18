import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'sonner';
import { UserPlus, Mail, Lock, User, Phone, CreditCard, CheckCircle, Sparkles } from 'lucide-react';
import api from '../../services/api';
import FadeIn from '../../components/animations/FadeIn';

// Validation schema
const createAdminSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().min(11, 'Phone number must be at least 11 digits').max(15),
  cnic: z.string().length(13, 'CNIC must be exactly 13 digits').optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function CreateAdmin() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(createAdminSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const { confirmPassword: _confirmPassword, ...adminData } = data;

      await api.post('/admin/create-admin', adminData);

      setShowSuccess(true);
      toast.success('Admin Account Created!', {
        description: `Successfully created admin account for ${data.fullName}`,
      });

      setTimeout(() => {
        setShowSuccess(false);
        reset();
      }, 3000);
    } catch (error) {
      toast.error('Failed to Create Admin', {
        description: error.response?.data?.message || 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Header Section */}
          <FadeIn direction="up" delay={0}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl shadow-xl mb-6 transform hover:scale-110 transition-transform duration-300">
                <UserPlus className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
                Create Admin Account
                <Sparkles className="w-6 h-6 text-gray-700" />
              </h1>
              <p className="text-gray-600 text-lg">
                Grant administrator privileges to a new team member
              </p>
            </div>
          </FadeIn>

          {/* Success Animation */}
          {showSuccess && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm">
              <div className="bg-white rounded-3xl p-8 shadow-2xl transform animate-bounce-in">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
                  <p className="text-gray-600">Admin account has been created</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Card */}
          <FadeIn direction="up" delay={100}>
            <Card className="backdrop-blur-lg bg-white/80 shadow-2xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-6">
                <h2 className="text-2xl font-bold text-white">Account Details</h2>
                <p className="text-gray-100 text-sm mt-1">Fill in the information below</p>
              </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
              {/* Full Name */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    {...register('fullName')}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-600 focus:border-gray-600 focus:scale-[1.01] transition-all outline-none"
                    placeholder="John Doe"
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-600 focus:border-gray-600 focus:scale-[1.01] transition-all outline-none"
                    placeholder="admin@alkhidmat360.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone and CNIC Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone Number */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                      type="tel"
                      {...register('phoneNumber')}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-600 focus:border-gray-600 focus:scale-[1.01] transition-all outline-none"
                      placeholder="03001234567"
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>

                {/* CNIC */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CNIC <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <CreditCard className="w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      {...register('cnic')}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-600 focus:border-gray-600 focus:scale-[1.01] transition-all outline-none"
                      placeholder="1234567890123"
                      maxLength={13}
                    />
                  </div>
                  {errors.cnic && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.cnic.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                      type="password"
                      {...register('password')}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-600 focus:border-gray-600 focus:scale-[1.01] transition-all outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                      type="password"
                      {...register('confirmPassword')}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-600 focus:border-gray-600 focus:scale-[1.01] transition-all outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">ℹ️</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1 text-sm">Admin Privileges</h4>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      This account will have full administrator access including user management, donation oversight, application reviews, and system configuration.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-200"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating Admin...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <UserPlus className="w-5 h-5" />
                      Create Admin Account
                    </div>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                  disabled={isSubmitting}
                  className="px-8 py-3 border-2 border-gray-300 hover:border-gray-400 hover:scale-105 rounded-xl font-semibold transition-all duration-200"
                >
                  Reset
                </Button>
              </div>
            </form>
            </Card>
          </FadeIn>

          {/* Additional Info */}
          <FadeIn direction="up" delay={200}>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Admin accounts can be managed from the User Management section
              </p>
            </div>
          </FadeIn>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </DashboardLayout>
  );
}
