import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { createOrphanSponsorship } from '../../services/donationService';
import { Baby, Loader2 } from 'lucide-react';
import FadeIn from '../../components/animations/FadeIn';
import PaymentConfirmModal from '../../components/payments/PaymentConfirmModal';

// Validation schema matching backend
const orphanSponsorshipSchema = z.object({
  sponsorshipType: z
    .string()
    .min(2, 'Sponsorship type must be at least 2 characters')
    .max(50, 'Sponsorship type must not exceed 50 characters'),
  monthlyAmount: z.coerce.number().positive('Monthly amount must be positive'),
  duration: z.coerce
    .number()
    .int()
    .min(1, 'Duration must be at least 1 month')
    .max(120, 'Maximum duration is 120 months (10 years)'),
  totalAmount: z.coerce.number().positive('Total amount must be positive'),
  sponsorName: z.string().min(2, 'Name must be at least 2 characters'),
  sponsorPhone: z
    .string()
    .min(11, 'Phone number must be at least 11 digits')
    .max(15, 'Phone number must not exceed 15 digits'),
  sponsorEmail: z.string().email('Invalid email address'),
  sponsorAddress: z.string().min(10, 'Please provide a complete address'),
  orphanAge: z.string().optional(),
  orphanGender: z.string().optional(),
  startDate: z.string().optional(),
  notes: z.string().optional(),
});

const sponsorshipTypes = [
  {
    id: 'basic',
    name: 'Basic Education Support',
    monthlyAmount: 5000,
    description: 'School fees, books, and basic supplies',
  },
  {
    id: 'standard',
    name: 'Standard Care Package',
    monthlyAmount: 8000,
    description: 'Education + clothing + monthly stipend',
  },
  {
    id: 'premium',
    name: 'Complete Care Support',
    monthlyAmount: 12000,
    description: 'Full support including healthcare and extras',
  },
];

export default function OrphanSponsorship() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [customMode, setCustomMode] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(orphanSponsorshipSchema),
    defaultValues: {
      monthlyAmount: 0,
      duration: 12,
      totalAmount: 0,
    },
  });

  const monthlyAmount = watch('monthlyAmount');
  const duration = watch('duration');

  const handleTypeSelect = (type) => {
    setSelectedType(type.id);
    setCustomMode(false);
    setValue('sponsorshipType', type.name, { shouldValidate: true });
    setValue('monthlyAmount', type.monthlyAmount);
    const total = type.monthlyAmount * (duration || 1);
    setValue('totalAmount', total);
  };

  const enableCustom = () => {
    setSelectedType('');
    setCustomMode(true);
    setValue('sponsorshipType', '', { shouldValidate: false });
  };

  // Auto-calculate total when duration changes
  const handleDurationChange = (e) => {
    const newDuration = parseInt(e.target.value) || 0;
    const total = (monthlyAmount || 0) * newDuration;
    setValue('totalAmount', total);
  };

  // Stage payload locally; payment modal handles the actual API call.
  const onSubmit = (data) => {
    // eslint-disable-next-line no-unused-vars
    const { sponsorshipType, totalAmount, sponsorAddress, ...sponsorshipData } = data;
    setPendingPayload({ ...sponsorshipData, _totalCommitment: totalAmount });
    setPaymentOpen(true);
  };

  const handlePaymentConfirmed = async ({ paymentMarked, paymentScreenshot }) => {
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(pendingPayload || {}).forEach(([k, v]) => {
        if (k.startsWith('_')) return;
        if (v !== undefined && v !== null && v !== '') fd.append(k, String(v));
      });
      fd.append('paymentMarked', String(paymentMarked));
      if (paymentScreenshot) fd.append('paymentScreenshot', paymentScreenshot);
      await createOrphanSponsorship(fd);
      reset();
      setSelectedType('');
      setCustomMode(false);
      setPendingPayload(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Page Header */}
        <FadeIn direction="down" delay={0}>
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
                <Baby className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Orphan Sponsorship</h1>
                <p className="text-gray-600 mt-1">
                  Sponsor an orphan child and make a lasting impact
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Form Card */}
        <FadeIn direction="up" delay={150}>
          <Card className="shadow-medium hover:shadow-large transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Sponsorship Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Sponsorship Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Sponsorship Type <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {sponsorshipTypes.map((type) => (
                    <label
                      key={type.id}
                      className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-md ${
                        selectedType === type.id
                          ? 'border-primary-500 bg-primary-50 shadow-glow-blue'
                          : 'border-gray-200 hover:border-primary-200'
                      }`}
                      onClick={() => handleTypeSelect(type)}
                    >
                      <input
                        type="radio"
                        value={type.name}
                        {...register('sponsorshipType')}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-900">{type.name}</p>
                          <p className="text-lg font-bold text-primary-600">
                            PKR {type.monthlyAmount.toLocaleString()}/month
                          </p>
                        </div>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {!customMode && (
                  <button
                    type="button"
                    onClick={enableCustom}
                    className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium underline-offset-2 hover:underline"
                  >
                    None of these fit? Enter a custom sponsorship type instead
                  </button>
                )}
                {customMode && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Custom sponsorship type
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomMode(false);
                          setValue('sponsorshipType', '', { shouldValidate: false });
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Use one of the packages above instead
                      </button>
                    </div>
                    <input
                      type="text"
                      {...register('sponsorshipType')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="e.g., Specialized Educational Support"
                      autoFocus
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      You'll set the monthly amount yourself in the next field.
                    </p>
                  </div>
                )}
                {errors.sponsorshipType && (
                  <p className="mt-1 text-sm text-error">{errors.sponsorshipType.message}</p>
                )}
              </div>

              {/* Amount and Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Amount (PKR) <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    {...register('monthlyAmount')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                    placeholder="Enter amount"
                  />
                  {errors.monthlyAmount && (
                    <p className="mt-1 text-sm text-error">{errors.monthlyAmount.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (Months) <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    {...register('duration', {
                      onChange: handleDurationChange,
                    })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                    placeholder="e.g., 12"
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-error">{errors.duration.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount (PKR) <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    {...register('totalAmount')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200 bg-gray-50"
                    placeholder="Auto-calculated"
                    readOnly
                  />
                  {errors.totalAmount && (
                    <p className="mt-1 text-sm text-error">{errors.totalAmount.message}</p>
                  )}
                </div>
              </div>

              {/* Sponsor Information */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Sponsor Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('sponsorName')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                    {errors.sponsorName && (
                      <p className="mt-1 text-sm text-error">{errors.sponsorName.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-error">*</span>
                      </label>
                      <input
                        type="tel"
                        {...register('sponsorPhone')}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                        placeholder="03001234567"
                      />
                      {errors.sponsorPhone && (
                        <p className="mt-1 text-sm text-error">{errors.sponsorPhone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-error">*</span>
                      </label>
                      <input
                        type="email"
                        {...register('sponsorEmail')}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                        placeholder="your@email.com"
                      />
                      {errors.sponsorEmail && (
                        <p className="mt-1 text-sm text-error">{errors.sponsorEmail.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address <span className="text-error">*</span>
                    </label>
                    <textarea
                      {...register('sponsorAddress')}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="Enter your complete address"
                    />
                    {errors.sponsorAddress && (
                      <p className="mt-1 text-sm text-error">{errors.sponsorAddress.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Orphan Preferences (Optional)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Preferred Age
                        </label>
                        <select
                          {...register('orphanAge')}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                        >
                          <option value="">Any Age</option>
                          <option value="0-5">0-5 years</option>
                          <option value="6-10">6-10 years</option>
                          <option value="11-15">11-15 years</option>
                          <option value="16-18">16-18 years</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Preferred Gender
                        </label>
                        <select
                          {...register('orphanGender')}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                        >
                          <option value="">Any Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          {...register('startDate')}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="Any special message or requirements"
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
                      <Baby className="w-4 h-4 mr-2" />
                      Continue to First Payment
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setSelectedType('');
                    setCustomMode(false);
                  }}
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
                <span className="text-lg">💙</span>
              </div>
              <div>
                <h4 className="font-semibold text-primary-900 mb-1">What Your Sponsorship Includes</h4>
                <ul className="text-sm text-primary-800 space-y-1">
                  <li>• Monthly progress reports and updates about the child</li>
                  <li>• Annual comprehensive report with photos</li>
                  <li>• Opportunity to write letters to the sponsored child</li>
                  <li>• Full transparency on fund utilization</li>
                  <li>• Tax exemption certificate provided</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        </FadeIn>
      </div>

      <PaymentConfirmModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        title="Complete First Month's Sponsorship"
        totalAmount={Number(pendingPayload?.monthlyAmount) || 0}
        summaryLabel="First Month's Payment"
        summaryHint={
          pendingPayload
            ? `${pendingPayload.duration}-month commitment · total ${
                Number(pendingPayload._totalCommitment || 0).toLocaleString()
              } PKR`
            : undefined
        }
        onConfirmedSubmit={handlePaymentConfirmed}
        successMessage="Sponsorship recorded"
        successDescription="Thank you for changing a life. We will reach out shortly with next steps."
      />
    </DashboardLayout>
  );
}
