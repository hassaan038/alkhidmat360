import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import FormSection, { FormGrid, FormField } from '../../components/ui/FormSection';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Package, User, Phone, Mail, Calendar, Info, RotateCcw, ArrowRight } from 'lucide-react';
import { createRationDonation } from '../../services/donationService';
import PaymentConfirmModal from '../../components/payments/PaymentConfirmModal';
import { cn } from '../../lib/utils';

const rationSchema = z.object({
  packageType: z.string().min(2).max(50),
  quantity: z.coerce.number().int().min(1).max(1000),
  amount: z.coerce.number().positive('Amount must be positive'),
  donorName: z.string().min(2, 'Name must be at least 2 characters'),
  donorEmail: z.string().email('Please enter a valid email address'),
  donorPhone: z.string().min(11, 'Phone number must be at least 11 digits').max(15),
  donorAddress: z.string().min(10, 'Please provide a complete address'),
  deliveryDate: z.string().optional(),
  notes: z.string().optional(),
});

const packageTypes = [
  { id: 'basic', name: 'Basic Package', price: 3000, items: 'Rice, flour, oil, sugar, lentils' },
  { id: 'standard', name: 'Standard Package', price: 5000, items: 'Basic items + tea, milk powder, dates' },
  { id: 'premium', name: 'Premium Package', price: 8000, items: 'Standard items + ghee, nuts, honey' },
];

const infoPoints = [
  'Ration packages are distributed to vetted families.',
  'You will receive updates about your donation distribution.',
  'Delivery schedule depends on your date and area.',
  'Tax exemption certificate available on request.',
];

export default function RationDonation() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [customMode, setCustomMode] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    resolver: zodResolver(rationSchema),
    defaultValues: { quantity: 1, amount: 0 },
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
      <PageContainer className="max-w-4xl space-y-6">
        <PageHeader
          icon={Package}
          accent="ration"
          title="Ration Donation"
          description="Donate a ration package to support families through the month."
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title="Choose a package" icon={Package}>
            <div className="grid grid-cols-1 gap-3">
              {packageTypes.map((pkg) => (
                <label
                  key={pkg.id}
                  className={cn(
                    'relative flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 transition-colors duration-200',
                    selectedPackage === pkg.id
                      ? 'border-ration-500 bg-ration-50 dark:bg-ration-500/10 ring-1 ring-inset ring-ration-200 dark:ring-ration-700/40'
                      : 'border-gray-200 dark:border-gray-800 hover:border-ration-300 hover:bg-gray-50'
                  )}
                  onClick={() => handlePackageSelect(pkg)}
                >
                  <input type="radio" value={pkg.name} {...register('packageType')} className="sr-only" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">{pkg.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{pkg.items}</p>
                  </div>
                  <p className="flex-shrink-0 text-base font-bold text-ration-600 tabular-nums">
                    PKR {pkg.price.toLocaleString()}
                  </p>
                </label>
              ))}
            </div>

            {!customMode ? (
              <button
                type="button"
                onClick={enableCustom}
                className="mt-3 text-sm font-medium text-ration-600 hover:text-ration-700 underline-offset-2 hover:underline cursor-pointer"
              >
                None of these fit? Enter a custom package instead.
              </button>
            ) : (
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom package type</label>
                  <button
                    type="button"
                    onClick={() => { setCustomMode(false); setValue('packageType', '', { shouldValidate: false }); }}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    Use a preset instead
                  </button>
                </div>
                <Input {...register('packageType')} placeholder="e.g., Ramadan Special Package" autoFocus />
                <p className="text-xs text-gray-500 dark:text-gray-400">You'll set the amount in the next field.</p>
              </div>
            )}
            {errors.packageType && <p className="mt-2 text-xs text-error-dark">{errors.packageType.message}</p>}

            <FormGrid cols={2} className="mt-5">
              <FormField label="Quantity" required htmlFor="qty" error={errors.quantity?.message}>
                <Input id="qty" type="number" min={1} {...register('quantity')} />
              </FormField>
              <FormField label="Total amount (PKR)" required htmlFor="amt" error={errors.amount?.message}>
                <Input id="amt" type="number" min={0} {...register('amount')} />
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection title="Donor information" icon={User}>
            <FormGrid cols={2}>
              <FormField label="Full name" required htmlFor="dn" error={errors.donorName?.message}>
                <Input id="dn" leftIcon={User} {...register('donorName')} placeholder="Your full name" />
              </FormField>
              <FormField label="Email address" required htmlFor="de" error={errors.donorEmail?.message}>
                <Input id="de" type="email" leftIcon={Mail} {...register('donorEmail')} placeholder="you@example.com" />
              </FormField>
              <FormField label="Phone number" required htmlFor="dp" error={errors.donorPhone?.message}>
                <Input id="dp" type="tel" leftIcon={Phone} {...register('donorPhone')} placeholder="03001234567" />
              </FormField>
              <FormField label="Preferred delivery date" htmlFor="dd" hint="Optional">
                <Input id="dd" type="date" leftIcon={Calendar} {...register('deliveryDate')} />
              </FormField>
              <FormField wide label="Address" required htmlFor="da" error={errors.donorAddress?.message}>
                <Textarea id="da" rows={3} {...register('donorAddress')} placeholder="Complete delivery address" />
              </FormField>
              <FormField wide label="Additional notes" htmlFor="nt">
                <Textarea id="nt" rows={2} {...register('notes')} placeholder="Any special instructions" />
              </FormField>
            </FormGrid>
          </FormSection>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" leftIcon={RotateCcw} onClick={() => { reset(); setSelectedPackage(''); setCustomMode(false); }} disabled={isSubmitting}>
              Reset
            </Button>
            <Button type="submit" size="lg" loading={isSubmitting} rightIcon={ArrowRight}>
              Continue to payment
            </Button>
          </div>
        </form>

        <div className="rounded-2xl border border-ration-100 dark:border-ration-700/40 bg-ration-50/60 dark:bg-ration-500/10 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-ration-100 dark:bg-ration-500/15 text-ration-700 dark:text-ration-200">
              <Info className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-ration-700 dark:text-ration-200">Distribution information</h4>
              <ul className="mt-2 space-y-1 text-xs text-ration-700/90">
                {infoPoints.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-1.5 block h-1 w-1 flex-shrink-0 rounded-full bg-ration-500" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </PageContainer>

      <PaymentConfirmModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        title="Complete ration donation payment"
        totalAmount={Number(pendingPayload?.amount) || 0}
        summaryLabel="Total donation"
        onConfirmedSubmit={handlePaymentConfirmed}
        successMessage="Donation recorded"
        successDescription="Thank you for your generosity. You'll be notified once admin confirms."
      />
    </DashboardLayout>
  );
}
