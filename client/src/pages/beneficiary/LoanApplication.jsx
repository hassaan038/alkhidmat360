import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { createLoanApplication } from '../../services/applicationService';
import { toast } from 'sonner';
import { DollarSign, Loader2 } from 'lucide-react';
import FadeIn from '../../components/animations/FadeIn';

// Validation schema matching backend
const loanApplicationSchema = z.object({
  loanType: z.enum(['BUSINESS', 'EDUCATION', 'MEDICAL', 'HOUSING', 'MARRIAGE', 'OTHER'], {
    required_error: 'Please select a loan type',
  }),
  requestedAmount: z.coerce.number().positive('Requested amount must be positive'),
  monthlyIncome: z.coerce.number().nonnegative('Monthly income must be non-negative'),
  familyMembers: z.coerce.number().int().min(1, 'Must have at least 1 family member'),
  employmentStatus: z.string().min(2).max(50, 'Employment status is required'),
  purposeDescription: z
    .string()
    .min(10, 'Purpose description must be at least 10 characters'),
  applicantName: z.string().min(2, 'Name must be at least 2 characters'),
  applicantPhone: z
    .string()
    .min(11, 'Phone number must be at least 11 digits')
    .max(15, 'Phone number must not exceed 15 digits'),
  applicantCNIC: z.string().length(13, 'CNIC must be exactly 13 digits'),
  applicantAddress: z.string().min(10, 'Please provide a complete address'),
  guarantorName: z.string().min(2).optional().or(z.literal('')),
  guarantorPhone: z.string().min(11).max(15).optional().or(z.literal('')),
  guarantorCNIC: z.string().length(13).optional().or(z.literal('')),
  guarantorAddress: z.string().min(10).optional().or(z.literal('')),
  additionalNotes: z.string().optional(),
});

const loanTypes = [
  { value: 'BUSINESS', label: 'Business Loan', icon: '💼' },
  { value: 'EDUCATION', label: 'Education Loan', icon: '🎓' },
  { value: 'MEDICAL', label: 'Medical Loan', icon: '🏥' },
  { value: 'HOUSING', label: 'Housing Loan', icon: '🏠' },
  { value: 'MARRIAGE', label: 'Marriage Loan', icon: '💒' },
  { value: 'OTHER', label: 'Other', icon: '📄' },
];

export default function LoanApplication() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: {
      loanType: 'BUSINESS',
      familyMembers: 1,
      monthlyIncome: 0,
      requestedAmount: 0,
    },
  });

  const selectedLoanType = watch('loanType');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await createLoanApplication(data);
      toast.success('Loan Application Submitted Successfully!', {
        description: 'Your application will be reviewed within 7-10 business days.',
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
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Loan Application</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Apply for interest-free loan assistance
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
              {/* Loan Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Loan Type <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {loanTypes.map((type) => (
                    <label
                      key={type.value}
                      className={`relative flex flex-col items-center justify-center p-5 border-2 rounded-xl cursor-pointer hover:scale-105 hover:shadow-md transition-all duration-300 ${
                        selectedLoanType === type.value
                          ? 'border-primary-500 bg-primary-50 shadow-glow-blue'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        value={type.value}
                        {...register('loanType')}
                        className="sr-only"
                      />
                      <span className="text-2xl mb-2">{type.icon}</span>
                      <span className="text-sm font-medium text-center">{type.label}</span>
                    </label>
                  ))}
                </div>
                {errors.loanType && (
                  <p className="mt-1 text-sm text-error">{errors.loanType.message}</p>
                )}
              </div>

              {/* Financial Information */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Financial Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Requested Amount (PKR) <span className="text-error">*</span>
                    </label>
                    <input
                      type="number"
                      {...register('requestedAmount')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="e.g., 50000"
                    />
                    {errors.requestedAmount && (
                      <p className="mt-1 text-sm text-error">{errors.requestedAmount.message}</p>
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
                      placeholder="e.g., 30000"
                    />
                    {errors.monthlyIncome && (
                      <p className="mt-1 text-sm text-error">{errors.monthlyIncome.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Family Members <span className="text-error">*</span>
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
                      Employment Status <span className="text-error">*</span>
                    </label>
                    <select
                      {...register('employmentStatus')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                    >
                      <option value="">Select status</option>
                      <option value="Employed">Employed</option>
                      <option value="Self-Employed">Self-Employed</option>
                      <option value="Unemployed">Unemployed</option>
                      <option value="Daily Wage">Daily Wage</option>
                      <option value="Retired">Retired</option>
                      <option value="Student">Student</option>
                    </select>
                    {errors.employmentStatus && (
                      <p className="mt-1 text-sm text-error">{errors.employmentStatus.message}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose Description <span className="text-error">*</span>
                  </label>
                  <textarea
                    {...register('purposeDescription')}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Please explain in detail why you need this loan and how it will be used"
                  />
                  {errors.purposeDescription && (
                    <p className="mt-1 text-sm text-error">{errors.purposeDescription.message}</p>
                  )}
                </div>
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
                      placeholder="Enter your complete address"
                    />
                    {errors.applicantAddress && (
                      <p className="mt-1 text-sm text-error">{errors.applicantAddress.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Guarantor Information (Optional) */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Guarantor Information (Optional)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Providing a guarantor can improve your application chances
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guarantor Name
                    </label>
                    <input
                      type="text"
                      {...register('guarantorName')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="Enter guarantor's full name"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guarantor Phone
                      </label>
                      <input
                        type="tel"
                        {...register('guarantorPhone')}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                        placeholder="03001234567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guarantor CNIC
                      </label>
                      <input
                        type="text"
                        {...register('guarantorCNIC')}
                        maxLength={13}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                        placeholder="1234567890123"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guarantor Address
                    </label>
                    <textarea
                      {...register('guarantorAddress')}
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="Enter guarantor's complete address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
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
                      <DollarSign className="w-4 h-4 mr-2" />
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
                <h4 className="font-semibold text-primary-900 mb-1">Important Information</h4>
                <ul className="text-sm text-primary-800 space-y-1">
                  <li>• All loans are interest-free (Qarz-e-Hasna)</li>
                  <li>• Applications are reviewed within 7-10 business days</li>
                  <li>• Document verification will be required</li>
                  <li>• Loan repayment terms will be discussed during approval</li>
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
