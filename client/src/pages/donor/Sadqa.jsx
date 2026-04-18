import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Heart, Calendar, CheckCircle2, User, Phone, Mail, RotateCcw, ArrowRight, Coins } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import FormSection, { FormGrid, FormField } from '../../components/ui/FormSection';
import SectionHeading from '../../components/ui/SectionHeading';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge, { StatusBadge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonStatCard } from '../../components/ui/Skeleton';
import PaymentConfirmModal from '../../components/payments/PaymentConfirmModal';
import * as extraDonationService from '../../services/extraDonationService';
import { cn, formatCurrency, formatDate, formatApiError } from '../../lib/utils';

const sadqaSchema = z.object({
  donorName: z.string().min(2, 'Name must be at least 2 characters'),
  donorPhone: z.string().min(10, 'Please enter a valid phone number').max(20),
  donorEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  purpose: z.string().max(200).optional(),
  notes: z.string().optional(),
});

const QUICK_AMOUNTS = [500, 1000, 2500, 5000, 10000, 25000];
const SUGGESTED_PURPOSES = ['General Sadqa', 'Education', 'Healthcare', 'Orphan Care', 'Mosque', 'Water Supply'];

function SadqaCard({ sadqa }) {
  return (
    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Donation #{sadqa.id}</p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{formatCurrency(sadqa.amount)}</p>
            {sadqa.purpose && <p className="text-xs text-gray-500 mt-0.5 truncate">{sadqa.purpose}</p>}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {sadqa.paymentMarked && (
              <Badge variant="info" size="sm" icon={CheckCircle2}>Paid</Badge>
            )}
            <StatusBadge status={sadqa.status} size="sm" />
          </div>
        </div>
        {sadqa.createdAt && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
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
    register, handleSubmit, setValue, watch, reset,
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
  useEffect(() => { loadPast(); }, []);

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

  return (
    <DashboardLayout>
      <PageContainer className="max-w-4xl space-y-6">
        <PageHeader
          icon={Heart}
          accent="sadqa"
          title="Sadqa / Donation"
          description="Give any amount for any cause. 100% supports Alkhidmat's welfare programs."
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title="Amount" icon={Coins}>
            <FormField label="Amount (PKR)" required htmlFor="amt" error={errors.amount?.message}>
              <Input id="amt" type="number" min={1} {...register('amount')} placeholder="Enter amount" />
            </FormField>
            <div className="flex flex-wrap gap-2 mt-3">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setValue('amount', amt, { shouldValidate: true })}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium ring-1 ring-inset transition-colors cursor-pointer',
                    Number(watchAmount) === amt
                      ? 'bg-sadqa-600 text-white ring-sadqa-600'
                      : 'bg-white text-gray-700 ring-gray-200 hover:ring-sadqa-300 hover:text-sadqa-700'
                  )}
                >
                  {formatCurrency(amt)}
                </button>
              ))}
            </div>
          </FormSection>

          <FormSection title="Purpose" icon={Heart} description="Optional — tag what this donation is for.">
            <FormField label="Purpose" htmlFor="pu">
              <Input id="pu" {...register('purpose')} placeholder="e.g. for orphan education, in memory of…" />
            </FormField>
            <div className="flex flex-wrap gap-2 mt-3">
              {SUGGESTED_PURPOSES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setValue('purpose', p, { shouldValidate: true })}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium ring-1 ring-inset transition-colors cursor-pointer',
                    watchPurpose === p
                      ? 'bg-sadqa-600 text-white ring-sadqa-600'
                      : 'bg-white text-gray-700 ring-gray-200 hover:ring-sadqa-300 hover:text-sadqa-700'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </FormSection>

          <FormSection title="Your details" icon={User}>
            <FormGrid cols={2}>
              <FormField label="Full name" required htmlFor="dn" error={errors.donorName?.message}>
                <Input id="dn" leftIcon={User} {...register('donorName')} placeholder="Your full name" />
              </FormField>
              <FormField label="Phone number" required htmlFor="dp" error={errors.donorPhone?.message}>
                <Input id="dp" type="tel" leftIcon={Phone} {...register('donorPhone')} placeholder="03001234567" />
              </FormField>
              <FormField wide label="Email" htmlFor="de" error={errors.donorEmail?.message} hint="Optional">
                <Input id="de" type="email" leftIcon={Mail} {...register('donorEmail')} placeholder="you@example.com" />
              </FormField>
              <FormField wide label="Notes" htmlFor="nt">
                <Textarea id="nt" rows={2} {...register('notes')} placeholder="Anything you'd like us to know" />
              </FormField>
            </FormGrid>
          </FormSection>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">Nothing is recorded until you mark the payment as done.</p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" leftIcon={RotateCcw} onClick={() => reset({ amount: '' })} disabled={isSubmitting}>
                Reset
              </Button>
              <Button type="submit" size="lg" loading={isSubmitting} rightIcon={ArrowRight}>
                Continue to payment
              </Button>
            </div>
          </div>
        </form>

        <div>
          <SectionHeading title="My donations" description="Your donation history" size="md" />
          {loadingPast ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SkeletonStatCard />
              <SkeletonStatCard />
            </div>
          ) : past.length === 0 ? (
            <EmptyState
              icon={Heart}
              tone="sadqa"
              title="No donations yet"
              description="Once you complete a donation, it will appear here."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {past.map((s) => (<SadqaCard key={s.id} sadqa={s} />))}
            </div>
          )}
        </div>
      </PageContainer>

      <PaymentConfirmModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        title="Complete Sadqa payment"
        totalAmount={Number(pendingPayload?.amount) || 0}
        summaryLabel="Donation amount"
        summaryHint={pendingPayload?.purpose ? `For: ${pendingPayload.purpose}` : undefined}
        onConfirmedSubmit={handleConfirmed}
        successMessage="Donation recorded"
        successDescription="Thank you for your generosity. You'll be notified once admin confirms."
      />
    </DashboardLayout>
  );
}
