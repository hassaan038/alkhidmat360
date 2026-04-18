import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { createSkinCollection } from '../../services/donationService';
import { toast } from 'sonner';
import { Scissors, Loader2 } from 'lucide-react';
import FadeIn from '../../components/animations/FadeIn';

// Validation schema matching backend.
// NOTE: This is a free pickup service — donor is donating the skin
// itself. No money changes hands either way; we collect the skin and
// process it ourselves.
const skinCollectionSchema = z.object({
  animalType: z
    .string()
    .min(2, 'Animal type must be at least 2 characters')
    .max(50, 'Animal type must not exceed 50 characters'),
  numberOfSkins: z.coerce
    .number()
    .int()
    .min(1, 'Number of skins must be at least 1')
    .max(100, 'Maximum quantity is 100'),
  donorName: z.string().min(2, 'Name must be at least 2 characters'),
  donorPhone: z
    .string()
    .min(11, 'Phone number must be at least 11 digits')
    .max(15, 'Phone number must not exceed 15 digits'),
  collectionAddress: z.string().min(10, 'Please provide a complete address'),
  preferredDate: z.string().min(1, 'Please select a preferred pickup date'),
  notes: z.string().optional(),
});

const skinTypes = [
  { id: 'goat', name: 'Goat Skin', emoji: '🐑' },
  { id: 'cow', name: 'Cow Skin', emoji: '🐄' },
  { id: 'camel', name: 'Camel Skin', emoji: '🐫' },
];

export default function SkinCollection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSkin, setSelectedSkin] = useState('');
  const [customMode, setCustomMode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(skinCollectionSchema),
    defaultValues: {
      numberOfSkins: 1,
    },
  });

  const handleSkinSelect = (skin) => {
    setSelectedSkin(skin.id);
    setCustomMode(false);
    setValue('animalType', skin.name, { shouldValidate: true });
  };

  const enableCustom = () => {
    setSelectedSkin('');
    setCustomMode(true);
    setValue('animalType', '', { shouldValidate: false });
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await createSkinCollection(data);
      toast.success('Skin Collection Request Submitted!', {
        description: 'Our team will contact you to schedule the pickup. Thank you for donating.',
      });
      reset();
      setSelectedSkin('');
      setCustomMode(false);
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
                <Scissors className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Skin Collection</h1>
                <p className="text-gray-600 mt-1">
                  Donate your Qurbani animal skin — we collect it free of cost.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Form Card */}
        <FadeIn direction="up" delay={150}>
          <Card className="shadow-medium hover:shadow-large transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Collection Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Animal Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Animal Type <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {skinTypes.map((skin) => (
                    <label
                      key={skin.id}
                      className={`relative flex flex-col items-center justify-center p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-md ${
                        selectedSkin === skin.id
                          ? 'border-primary-500 bg-primary-50 shadow-glow-blue'
                          : 'border-gray-200 hover:border-primary-200'
                      }`}
                      onClick={() => handleSkinSelect(skin)}
                    >
                      <input
                        type="radio"
                        value={skin.name}
                        {...register('animalType')}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <p className="text-2xl mb-2">{skin.emoji}</p>
                        <p className="font-medium text-gray-900">{skin.name}</p>
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
                    Don't see your animal? Enter a custom type instead
                  </button>
                )}
                {customMode && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Custom animal type
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomMode(false);
                          setValue('animalType', '', { shouldValidate: false });
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Use one of the options above instead
                      </button>
                    </div>
                    <input
                      type="text"
                      {...register('animalType')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="e.g., Mixed Animal Skins"
                      autoFocus
                    />
                  </div>
                )}
                {errors.animalType && (
                  <p className="mt-1 text-sm text-error">{errors.animalType.message}</p>
                )}
              </div>

              {/* Number of Skins */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Skins <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  {...register('numberOfSkins')}
                  className="w-full sm:w-48 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                  placeholder="Enter number of skins"
                />
                {errors.numberOfSkins && (
                  <p className="mt-1 text-sm text-error">{errors.numberOfSkins.message}</p>
                )}
              </div>

              {/* Donor Information */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Pickup Information
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
                      Collection Address <span className="text-error">*</span>
                    </label>
                    <textarea
                      {...register('collectionAddress')}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="Enter complete pickup address with landmarks"
                    />
                    {errors.collectionAddress && (
                      <p className="mt-1 text-sm text-error">{errors.collectionAddress.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Pickup Date <span className="text-error">*</span>
                    </label>
                    <input
                      type="date"
                      {...register('preferredDate')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                    />
                    {errors.preferredDate && (
                      <p className="mt-1 text-sm text-error">{errors.preferredDate.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Pickup should be within 1-2 days of Qurbani
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:scale-[1.01] transition-all duration-200"
                      placeholder="Special instructions for pickup team"
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
                      <Scissors className="w-4 h-4 mr-2" />
                      Schedule Pickup
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setSelectedSkin('');
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
                <span className="text-lg">ℹ️</span>
              </div>
              <div>
                <h4 className="font-semibold text-primary-900 mb-1">How Skin Collection Works</h4>
                <ul className="text-sm text-primary-800 space-y-1">
                  <li>• You're donating the skin itself — there's no payment either way</li>
                  <li>• Please salt and dry the skin before our team arrives</li>
                  <li>• We collect, process, and the proceeds fund Alkhidmat welfare programs</li>
                  <li>• Pickup is free of charge — our team will call before arriving</li>
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
