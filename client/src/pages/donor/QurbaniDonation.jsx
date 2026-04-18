import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { createQurbaniDonation } from '../../services/donationService';
import { toast } from 'sonner';
import { Heart, Loader2 } from 'lucide-react';
import FadeIn from '../../components/animations/FadeIn';

// Validation schema matching backend
const qurbaniSchema = z.object({
  animalType: z.enum(['GOAT', 'CAMEL'], {
    required_error: 'Please select an animal type',
  }),
  quantity: z.coerce
    .number()
    .int()
    .min(1, 'Quantity must be at least 1')
    .max(100, 'Maximum quantity is 100'),
  totalAmount: z.coerce.number().positive('Amount must be positive'),
  donorName: z.string().min(2, 'Name must be at least 2 characters'),
  donorPhone: z
    .string()
    .min(11, 'Phone number must be at least 11 digits')
    .max(15, 'Phone number must not exceed 15 digits'),
  donorAddress: z.string().min(10, 'Please provide a complete address'),
  deliveryDate: z.string().optional(),
  notes: z.string().optional(),
});

export default function QurbaniDonation() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(qurbaniSchema),
    defaultValues: {
      animalType: 'GOAT',
      quantity: 1,
      totalAmount: 0,
    },
  });

  // Calculate suggested amount based on animal type and quantity
  const animalType = watch('animalType');
  const quantity = watch('quantity');

  const getSuggestedPrice = () => {
    const prices = {
      GOAT: 30000,
      CAMEL: 300000,
    };
    return (prices[animalType] || 0) * (quantity || 1);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await createQurbaniDonation(data);
      toast.success('Qurbani Donation Submitted Successfully!', {
        description: 'Your donation has been recorded. May Allah accept it.',
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
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Qurbani Donation</h1>
                <p className="text-gray-600 mt-1">
                  Donate animals for Qurbani to help those in need
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Form Card */}
        <FadeIn direction="up" delay={150}>
          <Card className="shadow-medium hover:shadow-large transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Donation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Animal Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Animal Type <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['GOAT', 'CAMEL'].map((type) => (
                    <label
                      key={type}
                      className={`relative flex items-center justify-center p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-md ${
                        watch('animalType') === type
                          ? 'border-primary-500 bg-primary-50 shadow-glow-blue'
                          : 'border-gray-200 hover:border-primary-200'
                      }`}
                    >
                      <input
                        type="radio"
                        value={type}
                        {...register('animalType')}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <p className="text-3xl mb-2">
                          {type === 'GOAT' && '🐑'}
                          {type === 'CAMEL' && '🐫'}
                        </p>
                        <p className="font-semibold text-gray-900">{type}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.animalType && (
                  <p className="mt-1 text-sm text-error">{errors.animalType.message}</p>
                )}
              </div>

              {/* Quantity and Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    {...register('quantity')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                    placeholder="Enter quantity"
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-sm text-error">{errors.quantity.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount (PKR) <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    {...register('totalAmount')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                    placeholder="Enter amount"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Suggested: PKR {getSuggestedPrice().toLocaleString()}
                  </p>
                  {errors.totalAmount && (
                    <p className="mt-1 text-sm text-error">{errors.totalAmount.message}</p>
                  )}
                </div>
              </div>

              {/* Donor Information */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Donor Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('donorName')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                    {errors.donorName && (
                      <p className="mt-1 text-sm text-error">{errors.donorName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-error">*</span>
                    </label>
                    <input
                      type="tel"
                      {...register('donorPhone')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="03001234567"
                    />
                    {errors.donorPhone && (
                      <p className="mt-1 text-sm text-error">{errors.donorPhone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address <span className="text-error">*</span>
                    </label>
                    <textarea
                      {...register('donorAddress')}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="Enter your complete address"
                    />
                    {errors.donorAddress && (
                      <p className="mt-1 text-sm text-error">{errors.donorAddress.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Delivery Date (Optional)
                    </label>
                    <input
                      type="date"
                      {...register('deliveryDate')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="Any special instructions or preferences"
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
                      <Heart className="w-4 h-4 mr-2" />
                      Submit Donation
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
                  <li>• Your donation will be processed within 24-48 hours</li>
                  <li>• You will receive a confirmation call on your registered number</li>
                  <li>• Payment details will be shared after verification</li>
                  <li>• Delivery dates are subject to availability</li>
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
