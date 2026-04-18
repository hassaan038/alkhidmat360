import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { createRationDonation } from '../../services/donationService';
import { Package, Loader2 } from 'lucide-react';
import FadeIn from '../../components/animations/FadeIn';
import PaymentConfirmModal from '../../components/payments/PaymentConfirmModal';

// Validation schema matching backend
const rationSchema = z.object({
  packageType: z
    .string()
    .min(2, 'Package type must be at least 2 characters')
    .max(50, 'Package type must not exceed 50 characters'),
  quantity: z.coerce
    .number()
    .int()
    .min(1, 'Quantity must be at least 1')
    .max(1000, 'Maximum quantity is 1000'),
  amount: z.coerce.number().positive('Amount must be positive'),
  donorName: z.string().min(2, 'Name must be at least 2 characters'),
  donorEmail: z.string().email('Please enter a valid email address'),
  donorPhone: z
    .string()
    .min(11, 'Phone number must be at least 11 digits')
    .max(15, 'Phone number must not exceed 15 digits'),
  donorAddress: z.string().min(10, 'Please provide a complete address'),
  deliveryDate: z.string().optional(),
  notes: z.string().optional(),
});

const packageTypes = [
  { id: 'basic', name: 'Basic Package', price: 3000, items: 'Rice, flour, oil, sugar, lentils' },
  { id: 'standard', name: 'Standard Package', price: 5000, items: 'Basic items + tea, milk powder, dates' },
  { id: 'premium', name: 'Premium Package', price: 8000, items: 'Standard items + ghee, nuts, honey' },
];

export default function RationDonation() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('');
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
    resolver: zodResolver(rationSchema),
    defaultValues: {
      quantity: 1,
      amount: 0,
    },
  });

  const quantity = watch('quantity');

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg.id);
    setCustomMode(false);
    setValue('packageType', pkg.name, { shouldValidate: true });
    setValue('amount', pkg.price * (quantity || 1));
  };

  const enableCustom = () => {
    setSelectedPackage('');
    setCustomMode(true);
    setValue('packageType', '', { shouldValidate: false });
  };

  // Stage payload locally; actual submission happens when user clicks
  // "I've Paid" in the payment modal.
  const onSubmit = (data) => {
    const rationData = {
      donorName: data.donorName,
      donorEmail: data.donorEmail,
      donorPhone: data.donorPhone,
      amount: data.amount,
      rationItems: JSON.stringify({
        packageType: data.packageType,
        quantity: data.quantity,
        address: data.donorAddress,
        deliveryDate: data.deliveryDate,
      }),
      notes: data.notes,
    };
    setPendingPayload(rationData);
    setPaymentOpen(true);
  };

  const handlePaymentConfirmed = async ({ paymentMarked, paymentScreenshot }) => {
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(pendingPayload || {}).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') fd.append(k, String(v));
      });
      fd.append('paymentMarked', String(paymentMarked));
      if (paymentScreenshot) fd.append('paymentScreenshot', paymentScreenshot);
      await createRationDonation(fd);
      reset();
      setSelectedPackage('');
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
                <Package className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Ration Donation</h1>
                <p className="text-gray-600 mt-1">
                  Donate ration packages to support families in need
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
              {/* Package Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Package Type <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {packageTypes.map((pkg) => (
                    <label
                      key={pkg.id}
                      className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                        selectedPackage === pkg.id
                          ? 'border-primary-500 bg-primary-50 shadow-glow-blue'
                          : 'border-gray-200 hover:border-primary-200'
                      }`}
                      onClick={() => handlePackageSelect(pkg)}
                    >
                      <input
                        type="radio"
                        value={pkg.name}
                        {...register('packageType')}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-900">{pkg.name}</p>
                          <p className="text-lg font-bold text-primary-600">
                            PKR {pkg.price.toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600">{pkg.items}</p>
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
                    None of these fit? Enter a custom package instead
                  </button>
                )}
                {customMode && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Custom package type
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomMode(false);
                          setValue('packageType', '', { shouldValidate: false });
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Use one of the packages above instead
                      </button>
                    </div>
                    <input
                      type="text"
                      {...register('packageType')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., Ramadan Special Package"
                      autoFocus
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      You'll set the amount yourself in the next field.
                    </p>
                  </div>
                )}
                {errors.packageType && (
                  <p className="mt-1 text-sm text-error">{errors.packageType.message}</p>
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
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
                    {...register('amount')}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter amount"
                  />
                  {errors.amount && (
                    <p className="mt-1 text-sm text-error">{errors.amount.message}</p>
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                    {errors.donorName && (
                      <p className="mt-1 text-sm text-error">{errors.donorName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-error">*</span>
                    </label>
                    <input
                      type="email"
                      {...register('donorEmail')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="your.email@example.com"
                    />
                    {errors.donorEmail && (
                      <p className="mt-1 text-sm text-error">{errors.donorEmail.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-error">*</span>
                    </label>
                    <input
                      type="tel"
                      {...register('donorPhone')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
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
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 mr-2" />
                      Continue to Payment
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setSelectedPackage('');
                    setCustomMode(false);
                  }}
                  disabled={isSubmitting}
                  className="transition-colors duration-200"
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
                  <li>• Ration packages will be distributed to verified families</li>
                  <li>• You will receive updates about your donation distribution</li>
                  <li>• Delivery schedule depends on your selected date and area</li>
                  <li>• Tax exemption certificate will be provided upon request</li>
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
        title="Complete Ration Donation Payment"
        totalAmount={Number(pendingPayload?.amount) || 0}
        summaryLabel="Total Donation"
        onConfirmedSubmit={handlePaymentConfirmed}
        successMessage="Donation recorded"
        successDescription="Thank you for your generosity. You will be notified once admin confirms."
      />
    </DashboardLayout>
  );
}
