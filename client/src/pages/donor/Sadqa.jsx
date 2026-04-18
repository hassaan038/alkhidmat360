import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Heart, Loader2, Calendar, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FadeIn from '../../components/animations/FadeIn';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/Skeleton';
import PaymentConfirmModal from '../../components/payments/PaymentConfirmModal';
import * as extraDonationService from '../../services/extraDonationService';
import {
  cn,
  formatCurrency,
  formatDate,
  formatApiError,
  getStatusColor,
} from '../../lib/utils';

const sadqaSchema = z.object({
  donorName: z.string().min(2, 'Name must be at least 2 characters'),
  donorPhone: z.string().min(10, 'Please enter a valid phone number').max(20),
  donorEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  purpose: z.string().max(200).optional(),
  notes: z.string().optional(),
});

const QUICK_AMOUNTS = [500, 1000, 2500, 5000, 10000, 25000];
const SUGGESTED_PURPOSES = [
  'General Sadqa',
  'Education',
  'Healthcare',
  'Orphan Care',
  'Mosque',
  'Water Supply',
];

function SadqaCard({ sadqa }) {
  return (
    <Card className="shadow-soft hover:shadow-medium transition-shadow duration-300">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <p className="text-xs text-gray-500">Donation #{sadqa.id}</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(sadqa.amount)}
            </p>
            {sadqa.purpose && (
              <p className="text-xs text-gray-500 mt-0.5">{sadqa.purpose}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {sadqa.paymentMarked && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium bg-info-light text-info-dark border-info">
                <CheckCircle2 className="w-3 h-3" /> Paid
              </span>
            )}
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium capitalize',
                getStatusColor(sadqa.status)
              )}
            >
              {sadqa.status}
            </span>
          </div>
        </div>
        {sadqa.createdAt && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{formatDate(sadqa.createdAt)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Sadqa() {
  const [past, setPast] = useState([]);
  const [loadingPast, setLoadingPast] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(sadqaSchema),
    defaultValues: { amount: '' },
  });

  const watchAmount = watch('amount');
  const watchPurpose = watch('purpose');

  const loadPast = async () => {
    setLoadingPast(true);
    try {
      const res = await extraDonationService.getMySadqas();
      setPast(res.data?.sadqas || []);
    } catch (err) {
      toast.error('Failed to load past donations', { description: formatApiError(err) });
      setPast([]);
    } finally {
      setLoadingPast(false);
    }
  };

  useEffect(() => {
    loadPast();
  }, []);

  const onSubmit = (data) => {
    setPendingPayload(data);
    setPaymentOpen(true);
  };

  const handleConfirmed = async ({ paymentMarked, paymentScreenshot }) => {
    const fd = new FormData();
    Object.entries(pendingPayload || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') fd.append(k, String(v));
    });
    fd.append('paymentMarked', String(paymentMarked));
    if (paymentScreenshot) fd.append('paymentScreenshot', paymentScreenshot);
    await extraDonationService.createSadqa(fd);
    reset({ amount: '' });
    setPendingPayload(null);
    loadPast();
  };

  const inputClass =
    'w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent';

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <FadeIn direction="down" delay={0}>
          <div className="mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sadqa / Donation</h1>
              <p className="text-gray-600 mt-1">
                Give a donation of any amount, optionally for a specific cause.
                100% of your contribution supports Alkhidmat's welfare programs.
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={100}>
          <Card className="shadow-medium mb-8">
            <CardHeader>
              <CardTitle>New Donation</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Amount with quick buttons */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (PKR) <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    {...register('amount')}
                    placeholder="Enter amount"
                    className={inputClass}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {QUICK_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setValue('amount', amt, { shouldValidate: true })}
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-medium border transition',
                          Number(watchAmount) === amt
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                        )}
                      >
                        {formatCurrency(amt)}
                      </button>
                    ))}
                  </div>
                  {errors.amount && (
                    <p className="mt-1 text-xs text-error">{errors.amount.message}</p>
                  )}
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose (Optional)
                  </label>
                  <input
                    type="text"
                    {...register('purpose')}
                    placeholder="e.g. for orphan education, in memory of…"
                    className={inputClass}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {SUGGESTED_PURPOSES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setValue('purpose', p, { shouldValidate: true })}
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-medium border transition',
                          watchPurpose === p
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Donor info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-error">*</span>
                    </label>
                    <input {...register('donorName')} className={inputClass} />
                    {errors.donorName && (
                      <p className="mt-1 text-xs text-error">{errors.donorName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-error">*</span>
                    </label>
                    <input
                      type="tel"
                      {...register('donorPhone')}
                      placeholder="03001234567"
                      className={inputClass}
                    />
                    {errors.donorPhone && (
                      <p className="mt-1 text-xs text-error">{errors.donorPhone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    {...register('donorEmail')}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                  {errors.donorEmail && (
                    <p className="mt-1 text-xs text-error">{errors.donorEmail.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    {...register('notes')}
                    placeholder="Anything you'd like us to know"
                    className={inputClass}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => reset({ amount: '' })}
                    disabled={isSubmitting}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Working…
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 mr-2" />
                        Continue to Payment
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-gray-500">
                  Nothing is recorded until you mark the payment as done in the next step.
                </p>
              </form>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn direction="up" delay={150}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Donations</h2>
          {loadingPast ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : past.length === 0 ? (
            <EmptyState
              title="No donations yet"
              description="Once you complete a donation, it will appear here."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {past.map((s) => (
                <SadqaCard key={s.id} sadqa={s} />
              ))}
            </div>
          )}
        </FadeIn>
      </div>

      <PaymentConfirmModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        title="Complete Sadqa Payment"
        totalAmount={Number(pendingPayload?.amount) || 0}
        summaryLabel="Donation Amount"
        summaryHint={pendingPayload?.purpose ? `For: ${pendingPayload.purpose}` : undefined}
        onConfirmedSubmit={handleConfirmed}
        successMessage="Donation recorded"
        successDescription="Thank you for your generosity. You will be notified once admin confirms."
      />
    </DashboardLayout>
  );
}
