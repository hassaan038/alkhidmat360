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
import { Heart, Bot, Mountain, Info, RotateCcw, ArrowRight, User, Phone, Calendar, FileText } from 'lucide-react';
import { createQurbaniDonation } from '../../services/donationService';
import PaymentConfirmModal from '../../components/payments/PaymentConfirmModal';
import { cn } from '../../lib/utils';

const qurbaniSchema = z.object({
  animalType: z.enum(['GOAT', 'CAMEL'], { required_error: 'Please select an animal type' }),
  quantity: z.coerce.number().int().min(1).max(100),
  totalAmount: z.coerce.number().positive('Amount must be positive'),
  donorName: z.string().min(2, 'Name must be at least 2 characters'),
  donorPhone: z.string().min(11, 'Phone number must be at least 11 digits').max(15, 'Phone number must not exceed 15 digits'),
  donorAddress: z.string().min(10, 'Please provide a complete address'),
  deliveryDate: z.string().optional(),
  notes: z.string().optional(),
});

const animals = [
  { value: 'GOAT', label: 'Goat', icon: Bot, hint: 'PKR 30,000 per head' },
  { value: 'CAMEL', label: 'Camel', icon: Mountain, hint: 'PKR 300,000 per head' },
];

const infoPoints = [
  'Your donation will be processed within 24–48 hours.',
  'A confirmation call will be made on your registered number.',
  'Payment details are shared after verification.',
  'Delivery dates are subject to availability.',
];

export default function QurbaniDonation() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: zodResolver(qurbaniSchema),
    defaultValues: { animalType: 'GOAT', quantity: 1, totalAmount: 0 },
  });

  const animalType = watch('animalType');
  const quantity = watch('quantity');
  const suggested = (animalType === 'GOAT' ? 30000 : animalType === 'CAMEL' ? 300000 : 0) * (quantity || 1);

  const onSubmit = (data) => {
    setPendingPayload(data);
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
      await createQurbaniDonation(fd);
      reset();
      setPendingPayload(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <PageContainer className="max-w-4xl space-y-6">
        <PageHeader
          icon={Heart}
          accent="qurbani"
          title="Qurbani Donation"
          description="Donate a goat or camel for Qurbani — we handle distribution to families in need."
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title="Donation details" icon={Heart}>
            <FormField label="Animal type" required error={errors.animalType?.message}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {animals.map((a) => {
                  const AIcon = a.icon;
                  const selected = animalType === a.value;
                  return (
                    <label
                      key={a.value}
                      className={cn(
                        'relative flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors duration-200',
                        selected
                          ? 'border-qurbani-500 bg-qurbani-50 ring-1 ring-inset ring-qurbani-200'
                          : 'border-gray-200 hover:border-qurbani-300 hover:bg-gray-50'
                      )}
                    >
                      <input type="radio" value={a.value} {...register('animalType')} className="sr-only" />
                      <span
                        className={cn(
                          'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-colors',
                          selected ? 'bg-qurbani-100 text-qurbani-700' : 'bg-gray-100 text-gray-500'
                        )}
                      >
                        <AIcon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{a.label}</p>
                        <p className="text-xs text-gray-500">{a.hint}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </FormField>

            <FormGrid cols={2} className="mt-5">
              <FormField label="Quantity" required htmlFor="qty" error={errors.quantity?.message}>
                <Input id="qty" type="number" min={1} {...register('quantity')} placeholder="Enter quantity" />
              </FormField>
              <FormField
                label="Total amount (PKR)"
                required
                htmlFor="total"
                error={errors.totalAmount?.message}
                hint={suggested > 0 ? `Suggested: PKR ${suggested.toLocaleString()}` : undefined}
              >
                <Input id="total" type="number" min={0} {...register('totalAmount')} placeholder="Enter amount" />
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection title="Donor information" icon={User} description="We'll use this to coordinate delivery.">
            <FormGrid cols={2}>
              <FormField label="Full name" required htmlFor="donorName" error={errors.donorName?.message}>
                <Input id="donorName" leftIcon={User} {...register('donorName')} placeholder="Your full name" />
              </FormField>
              <FormField label="Phone number" required htmlFor="donorPhone" error={errors.donorPhone?.message}>
                <Input id="donorPhone" type="tel" leftIcon={Phone} {...register('donorPhone')} placeholder="03001234567" />
              </FormField>
              <FormField wide label="Address" required htmlFor="donorAddress" error={errors.donorAddress?.message}>
                <Textarea id="donorAddress" rows={3} {...register('donorAddress')} placeholder="Complete delivery address" />
              </FormField>
              <FormField label="Preferred delivery date" htmlFor="deliveryDate" hint="Optional — subject to availability">
                <Input id="deliveryDate" type="date" leftIcon={Calendar} {...register('deliveryDate')} />
              </FormField>
              <FormField label="Notes" htmlFor="notes" hint="Any special instructions">
                <Input id="notes" leftIcon={FileText} {...register('notes')} placeholder="Optional notes" />
              </FormField>
            </FormGrid>
          </FormSection>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" leftIcon={RotateCcw} onClick={() => reset()} disabled={isSubmitting}>
              Reset
            </Button>
            <Button type="submit" size="lg" loading={isSubmitting} rightIcon={ArrowRight}>
              Continue to payment
            </Button>
          </div>
        </form>

        {/* Info panel */}
        <div className="rounded-2xl border border-qurbani-100 bg-qurbani-50/60 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-qurbani-100 text-qurbani-700">
              <Info className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-qurbani-700">Important information</h4>
              <ul className="mt-2 space-y-1 text-xs text-qurbani-700/90">
                {infoPoints.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-1.5 block h-1 w-1 flex-shrink-0 rounded-full bg-qurbani-500" />
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
        title="Complete Qurbani payment"
        totalAmount={Number(pendingPayload?.totalAmount) || 0}
        summaryLabel="Total donation"
        summaryHint={pendingPayload ? `${pendingPayload.quantity} × ${pendingPayload.animalType?.toLowerCase()}` : undefined}
        onConfirmedSubmit={handlePaymentConfirmed}
        successMessage="Donation recorded"
        successDescription="May Allah accept it. You'll be notified once admin confirms."
      />
    </DashboardLayout>
  );
}
