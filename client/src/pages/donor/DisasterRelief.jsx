import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Calendar, CheckCircle2, Waves, AlertTriangle, Home, HeartPulse, Shield, LifeBuoy,
  User, Phone, Mail, RotateCcw, ArrowRight, Coins,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import FormSection, { FormGrid, FormField } from '../../components/ui/FormSection';
import SectionHeading from '../../components/ui/SectionHeading';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge, { StatusBadge } from '../../components/ui/Badge';
import IconTile from '../../components/ui/IconTile';
import { Card, CardContent } from '../../components/ui/Card';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonStatCard } from '../../components/ui/Skeleton';
import PaymentConfirmModal from '../../components/payments/PaymentConfirmModal';
import * as extraDonationService from '../../services/extraDonationService';
import { cn, formatCurrency, formatDate, formatApiError } from '../../lib/utils';

const CAMPAIGNS = [
  { key: 'floods', label: 'Pakistan Floods Relief', icon: Waves, description: 'Rescue boats, tent cities, food, water and medical care for monsoon-flood affected families.' },
  { key: 'earthquake', label: 'Earthquake Emergency', icon: AlertTriangle, description: 'Shelter, food, clean water and medical aid for earthquake-affected regions.' },
  { key: 'shelter', label: 'Tent Villages & Shelter', icon: Home, description: 'Temporary housing for displaced families — schooling, play areas, mosques, libraries.' },
  { key: 'medical', label: 'Mobile Health Units', icon: HeartPulse, description: 'Ambulances, medical camps and mobile health units serving disaster zones.' },
  { key: 'general', label: 'General Disaster Fund', icon: Shield, description: 'Goes wherever the need is greatest right now — flexible emergency response.' },
];

const QUICK_AMOUNTS = [1000, 2500, 5000, 10000, 25000, 50000];

const schema = z.object({
  donorName: z.string().min(2, 'Name must be at least 2 characters'),
  donorPhone: z.string().min(10, 'Please enter a valid phone number').max(20),
  donorEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  notes: z.string().optional(),
});

function DonationCard({ donation }) {
  const campaign = CAMPAIGNS.find((c) => c.key === donation.campaignKey);
  const Icon = campaign?.icon || LifeBuoy;
  return (
    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            <IconTile icon={Icon} tone="disaster" size="md" />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Donation #{donation.id}</p>
              <p className="text-2xl font-bold text-gray-900 tabular-nums">{formatCurrency(donation.amount)}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{donation.campaignLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {donation.paymentMarked && <Badge variant="info" size="sm" icon={CheckCircle2}>Paid</Badge>}
            <StatusBadge status={donation.status} size="sm" />
          </div>
        </div>
        {donation.createdAt && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{formatDate(donation.createdAt)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DisasterRelief() {
  const [past, setPast] = useState([]);
  const [loadingPast, setLoadingPast] = useState(true);
  const [campaignKey, setCampaignKey] = useState('floods');
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { amount: '' },
  });
  const watchAmount = watch('amount');
  const selected = useMemo(() => CAMPAIGNS.find((c) => c.key === campaignKey), [campaignKey]);

  const loadPast = async () => {
    setLoadingPast(true);
    try {
      const res = await extraDonationService.getMyDisasterDonations();
      setPast(res.data?.donations || []);
    } catch (err) {
      toast.error('Failed to load past donations', { description: formatApiError(err) });
      setPast([]);
    } finally {
      setLoadingPast(false);
    }
  };
  useEffect(() => { loadPast(); }, []);

  const onSubmit = (data) => {
    setPendingPayload({ ...data, campaignKey, campaignLabel: selected?.label || campaignKey });
    setPaymentOpen(true);
  };

  const handleConfirmed = async ({ paymentMarked, paymentScreenshot }) => {
    const fd = new FormData();
    Object.entries(pendingPayload || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') fd.append(k, String(v));
    });
    fd.append('paymentMarked', String(paymentMarked));
    if (paymentScreenshot) fd.append('paymentScreenshot', paymentScreenshot);
    await extraDonationService.createDisasterDonation(fd);
    reset({ amount: '' });
    setPendingPayload(null);
    loadPast();
  };

  return (
    <DashboardLayout>
      <PageContainer className="max-w-5xl space-y-6">
        <PageHeader
          icon={LifeBuoy}
          accent="disaster"
          title="Disaster Relief"
          description="Support Alkhidmat's emergency response — rescue ops, tent villages, mobile health units, and food distribution."
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title="Choose a campaign" icon={LifeBuoy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CAMPAIGNS.map((c) => {
                const CIcon = c.icon;
                const active = campaignKey === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCampaignKey(c.key)}
                    className={cn(
                      'text-left p-4 rounded-xl border transition-colors duration-200 cursor-pointer',
                      active
                        ? 'border-disaster-500 bg-disaster-50 ring-1 ring-inset ring-disaster-200'
                        : 'border-gray-200 hover:border-disaster-300 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', active ? 'bg-disaster-100 text-disaster-700' : 'bg-gray-100 text-gray-500')}>
                        <CIcon className="w-4 h-4" />
                      </span>
                      <p className={cn('text-sm font-semibold', active ? 'text-disaster-700' : 'text-gray-900')}>
                        {c.label}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{c.description}</p>
                  </button>
                );
              })}
            </div>
          </FormSection>

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
                      ? 'bg-disaster-600 text-white ring-disaster-600'
                      : 'bg-white text-gray-700 ring-gray-200 hover:ring-disaster-300 hover:text-disaster-700'
                  )}
                >
                  {formatCurrency(amt)}
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
              <FormField wide label="Email" htmlFor="de" hint="Optional" error={errors.donorEmail?.message}>
                <Input id="de" type="email" leftIcon={Mail} {...register('donorEmail')} placeholder="you@example.com" />
              </FormField>
              <FormField wide label="Notes" htmlFor="nt">
                <Textarea id="nt" rows={2} {...register('notes')} placeholder="Anything you'd like us to know" />
              </FormField>
            </FormGrid>
          </FormSection>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" leftIcon={RotateCcw} onClick={() => reset({ amount: '' })} disabled={isSubmitting}>
              Reset
            </Button>
            <Button type="submit" size="lg" loading={isSubmitting} rightIcon={ArrowRight}>
              Continue to payment
            </Button>
          </div>
        </form>

        <div>
          <SectionHeading title="My disaster donations" description="Your campaign contribution history" size="md" />
          {loadingPast ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SkeletonStatCard />
              <SkeletonStatCard />
            </div>
          ) : past.length === 0 ? (
            <EmptyState
              icon={LifeBuoy}
              tone="disaster"
              title="No disaster donations yet"
              description="Once you complete one, it will appear here."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {past.map((d) => (<DonationCard key={d.id} donation={d} />))}
            </div>
          )}
        </div>
      </PageContainer>

      <PaymentConfirmModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        title="Complete disaster relief donation"
        totalAmount={Number(pendingPayload?.amount) || 0}
        summaryLabel="Donation amount"
        summaryHint={pendingPayload?.campaignLabel ? `For: ${pendingPayload.campaignLabel}` : undefined}
        onConfirmedSubmit={handleConfirmed}
        successMessage="Donation recorded"
        successDescription="Thank you for supporting relief efforts. You'll be notified once admin confirms."
      />
    </DashboardLayout>
  );
}
