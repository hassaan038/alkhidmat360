import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { createRamadanRationApplication } from '../../services/applicationService';
import { toast } from 'sonner';
import { Apple, Loader2 } from 'lucide-react';
import FadeIn from '../../components/animations/FadeIn';

// Validation schema matching backend
const ramadanRationSchema = z.object({
  familyMembers: z.coerce.number().int().min(1, 'Must have at least 1 family member'),
  monthlyIncome: z.coerce.number().nonnegative('Monthly income must be non-negative'),
  hasDisabledMembers: z.boolean(),
  disabilityDetails: z.string().optional(),
  applicantName: z.string().min(2, 'Name must be at least 2 characters'),
  applicantPhone: z
    .string()
    .min(11, 'Phone number must be at least 11 digits')
    .max(15, 'Phone number must not exceed 15 digits'),
  applicantCNIC: z.string().length(13, 'CNIC must be exactly 13 digits'),
  applicantAddress: z.string().min(10, 'Please provide a complete address'),
  reasonForApplication: z
    .string()
    .min(10, 'Reason must be at least 10 characters'),
  previouslyReceived: z.boolean(),
  additionalNotes: z.string().optional(),
});

export default function RamadanRationApplication() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(ramadanRationSchema),
    defaultValues: {
      familyMembers: 1,
      monthlyIncome: 0,
      hasDisabledMembers: false,
      previouslyReceived: false,
    },
  });

  const hasDisabledMembers = watch('hasDisabledMembers');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await createRamadanRationApplication(data);
      toast.success('Application Submitted Successfully!', {
        description: 'Your application will be reviewed shortly.',
      });
      reset();
    } catch (error) {
      toast.error('Submission Failed', {
        description: error.response?.data?.message || 'Please try again later',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Page Header */}
        <FadeIn direction="down" delay={0}>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-md flex items-center justify-center">
                <Apple className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Ramadan Ration Application</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Apply for Ramadan ration package assistance
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Form Card */}
        <FadeIn direction="up" delay={150}>
          <Card className="shadow-medium hover:shadow-large transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Family Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Family Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Family Members <span className="text-error">*</span>
                    </label>
                    <input
                      type="number"
                      {...register('familyMembers')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="e.g., 5"
                    />
                    {errors.familyMembers && (
                      <p className="mt-1 text-sm text-error">{errors.familyMembers.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Income (PKR) <span className="text-error">*</span>
                    </label>
                    <input
                      type="number"
                      {...register('monthlyIncome')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="e.g., 15000"
                    />
                    {errors.monthlyIncome && (
                      <p className="mt-1 text-sm text-error">{errors.monthlyIncome.message}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('hasDisabledMembers')}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      My family has disabled or special needs members
                    </span>
                  </label>
                </div>

                {hasDisabledMembers && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Disability Details
                    </label>
                    <textarea
                      {...register('disabilityDetails')}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="Please describe the condition and special needs"
                    />
                  </div>
                )}
              </div>

              {/* Applicant Information */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Applicant Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('applicantName')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                    {errors.applicantName && (
                      <p className="mt-1 text-sm text-error">{errors.applicantName.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-error">*</span>
                      </label>
                      <input
                        type="tel"
                        {...register('applicantPhone')}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                        placeholder="03001234567"
                      />
                      {errors.applicantPhone && (
                        <p className="mt-1 text-sm text-error">{errors.applicantPhone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CNIC (13 digits) <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        {...register('applicantCNIC')}
                        maxLength={13}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                        placeholder="1234567890123"
                      />
                      {errors.applicantCNIC && (
                        <p className="mt-1 text-sm text-error">{errors.applicantCNIC.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address <span className="text-error">*</span>
                    </label>
                    <textarea
                      {...register('applicantAddress')}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="Enter your complete address with area and landmarks"
                    />
                    {errors.applicantAddress && (
                      <p className="mt-1 text-sm text-error">{errors.applicantAddress.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Application Reason */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Application Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Application <span className="text-error">*</span>
                    </label>
                    <textarea
                      {...register('reasonForApplication')}
                      rows={4}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="Please explain why you need the ration package and your current circumstances"
                    />
                    {errors.reasonForApplication && (
                      <p className="mt-1 text-sm text-error">
                        {errors.reasonForApplication.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        {...register('previouslyReceived')}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        I have previously received ration from Alkhidmat
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      {...register('additionalNotes')}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="Any additional information you'd like to share"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white hover:scale-105 hover:shadow-md transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Apple className="w-4 h-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                  disabled={isSubmitting}
                  className="hover:scale-105 transition-all duration-200"
                >
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        </FadeIn>

        {/* Info Card */}
        <FadeIn delay={300}>
          <Card className="mt-6 bg-primary-50 border-primary-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg">ℹ️</span>
              </div>
              <div>
                <h4 className="font-semibold text-primary-900 mb-1">Distribution Information</h4>
                <ul className="text-sm text-primary-800 space-y-1">
                  <li>• Applications are reviewed based on need and eligibility</li>
                  <li>• Distribution centers will be announced before Ramadan</li>
                  <li>• You will be notified via phone if approved</li>
                  <li>• CNIC verification is mandatory for collection</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        </FadeIn>
      </div>
    </DashboardLayout>
  );
}
