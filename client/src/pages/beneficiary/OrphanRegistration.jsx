import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { createOrphanRegistration } from '../../services/applicationService';
import { toast } from 'sonner';
import { Baby, Loader2 } from 'lucide-react';
import FadeIn from '../../components/animations/FadeIn';

// Validation schema matching backend
const orphanRegistrationSchema = z.object({
  orphanName: z.string().min(2, 'Name must be at least 2 characters'),
  orphanAge: z.coerce.number().int().min(0).max(18, 'Orphan must be 18 or younger'),
  orphanGender: z.enum(['MALE', 'FEMALE'], {
    required_error: 'Please select gender',
  }),
  guardianRelation: z.string().min(2).max(50, 'Please specify relation'),
  guardianName: z.string().min(2, 'Name must be at least 2 characters'),
  guardianPhone: z
    .string()
    .min(11, 'Phone number must be at least 11 digits')
    .max(15, 'Phone number must not exceed 15 digits'),
  guardianCNIC: z.string().length(13, 'CNIC must be exactly 13 digits'),
  guardianAddress: z.string().min(10, 'Please provide a complete address'),
  monthlyIncome: z.coerce.number().nonnegative('Monthly income must be non-negative'),
  familyMembers: z.coerce.number().int().min(1, 'Must have at least 1 family member'),
  educationLevel: z.string().min(2).max(50, 'Please specify education level'),
  schoolName: z.string().min(2).optional().or(z.literal('')),
  healthCondition: z.string().optional(),
  fatherStatus: z.enum(['DECEASED', 'UNKNOWN', 'ABSENT'], {
    required_error: 'Please select father status',
  }),
  motherStatus: z.enum(['DECEASED', 'ALIVE', 'UNKNOWN', 'ABSENT'], {
    required_error: 'Please select mother status',
  }),
  additionalNotes: z.string().optional(),
});

export default function OrphanRegistration() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(orphanRegistrationSchema),
    defaultValues: {
      orphanAge: 0,
      orphanGender: 'MALE',
      monthlyIncome: 0,
      familyMembers: 1,
      fatherStatus: 'DECEASED',
      motherStatus: 'ALIVE',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await createOrphanRegistration(data);
      toast.success('Registration Submitted Successfully!', {
        description: 'Our team will contact you for verification within 7 days.',
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
                <Baby className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Orphan Registration</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Register an orphan child for support and sponsorship
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Form Card */}
        <FadeIn direction="up" delay={150}>
          <Card className="shadow-medium hover:shadow-large transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Registration Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Orphan Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Orphan Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Orphan Full Name <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('orphanName')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="Enter orphan's full name"
                    />
                    {errors.orphanName && (
                      <p className="mt-1 text-sm text-error">{errors.orphanName.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age <span className="text-error">*</span>
                      </label>
                      <input
                        type="number"
                        {...register('orphanAge')}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                        placeholder="e.g., 10"
                      />
                      {errors.orphanAge && (
                        <p className="mt-1 text-sm text-error">{errors.orphanAge.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender <span className="text-error">*</span>
                      </label>
                      <select
                        {...register('orphanGender')}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </select>
                      {errors.orphanGender && (
                        <p className="mt-1 text-sm text-error">{errors.orphanGender.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Father Status <span className="text-error">*</span>
                      </label>
                      <select
                        {...register('fatherStatus')}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      >
                        <option value="DECEASED">Deceased</option>
                        <option value="UNKNOWN">Unknown</option>
                        <option value="ABSENT">Absent</option>
                      </select>
                      {errors.fatherStatus && (
                        <p className="mt-1 text-sm text-error">{errors.fatherStatus.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mother Status <span className="text-error">*</span>
                      </label>
                      <select
                        {...register('motherStatus')}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      >
                        <option value="DECEASED">Deceased</option>
                        <option value="ALIVE">Alive</option>
                        <option value="UNKNOWN">Unknown</option>
                        <option value="ABSENT">Absent</option>
                      </select>
                      {errors.motherStatus && (
                        <p className="mt-1 text-sm text-error">{errors.motherStatus.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Education Information */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Education Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Education Level <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('educationLevel')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="e.g., Grade 5, Not enrolled"
                    />
                    {errors.educationLevel && (
                      <p className="mt-1 text-sm text-error">{errors.educationLevel.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      School Name (if enrolled)
                    </label>
                    <input
                      type="text"
                      {...register('schoolName')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="Enter school name"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Health Condition (Optional)
                  </label>
                  <textarea
                    {...register('healthCondition')}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Mention any health issues, disabilities, or special needs"
                  />
                </div>
              </div>

              {/* Guardian Information */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Guardian Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guardian Name <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        {...register('guardianName')}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                        placeholder="Enter your full name"
                      />
                      {errors.guardianName && (
                        <p className="mt-1 text-sm text-error">{errors.guardianName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relation to Orphan <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        {...register('guardianRelation')}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                        placeholder="e.g., Uncle, Grandmother"
                      />
                      {errors.guardianRelation && (
                        <p className="mt-1 text-sm text-error">{errors.guardianRelation.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guardian Phone <span className="text-error">*</span>
                      </label>
                      <input
                        type="tel"
                        {...register('guardianPhone')}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                        placeholder="03001234567"
                      />
                      {errors.guardianPhone && (
                        <p className="mt-1 text-sm text-error">{errors.guardianPhone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guardian CNIC <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        {...register('guardianCNIC')}
                        maxLength={13}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                        placeholder="1234567890123"
                      />
                      {errors.guardianCNIC && (
                        <p className="mt-1 text-sm text-error">{errors.guardianCNIC.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guardian Address <span className="text-error">*</span>
                    </label>
                    <textarea
                      {...register('guardianAddress')}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="Enter complete address"
                    />
                    {errors.guardianAddress && (
                      <p className="mt-1 text-sm text-error">{errors.guardianAddress.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Household Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Income (PKR) <span className="text-error">*</span>
                    </label>
                    <input
                      type="number"
                      {...register('monthlyIncome')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="e.g., 20000"
                    />
                    {errors.monthlyIncome && (
                      <p className="mt-1 text-sm text-error">{errors.monthlyIncome.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Family Members <span className="text-error">*</span>
                    </label>
                    <input
                      type="number"
                      {...register('familyMembers')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="e.g., 6"
                    />
                    {errors.familyMembers && (
                      <p className="mt-1 text-sm text-error">{errors.familyMembers.message}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    {...register('additionalNotes')}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Any additional information about the orphan's circumstances"
                  />
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
                      <Baby className="w-4 h-4 mr-2" />
                      Submit Registration
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
                <h4 className="font-semibold text-primary-900 mb-1">Registration Process</h4>
                <ul className="text-sm text-primary-800 space-y-1">
                  <li>• Our team will verify the information within 7-10 days</li>
                  <li>• Home visit may be required for verification</li>
                  <li>• Required documents: Guardian CNIC, Birth certificate (if available)</li>
                  <li>• Approved orphans will be eligible for sponsorship and support</li>
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
