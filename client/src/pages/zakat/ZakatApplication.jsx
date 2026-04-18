import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Coins,
  Loader2,
  Camera,
  X as XIcon,
  Calendar,
  Users,
  Phone,
  CreditCard,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FadeIn from '../../components/animations/FadeIn';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/Skeleton';
import * as zakatService from '../../services/zakatService';
import { cn, formatCurrency, formatDate, formatApiError, getStatusColor } from '../../lib/utils';
import { imageUrl } from '../../lib/imageUrl';

const applicationSchema = z.object({
  applicantName: z.string().min(2, 'Name must be at least 2 characters'),
  applicantPhone: z.string().min(10, 'Phone must be at least 10 digits').max(20),
  applicantCNIC: z
    .string()
    .regex(/^\d{13}$/, 'CNIC must be exactly 13 digits (no dashes)'),
  applicantAddress: z.string().min(10, 'Address must be at least 10 characters'),

  familyMembers: z.coerce.number().int().min(1, 'At least 1').max(50),
  monthlyIncome: z.coerce.number().nonnegative('Must be 0 or more'),
  employmentStatus: z.enum([
    'employed',
    'self-employed',
    'unemployed',
    'student',
    'retired',
    'other',
  ]),
  housingStatus: z.enum(['own', 'rent', 'family', 'other']),
  hasDisabledMembers: z.union([z.boolean(), z.string()]).transform((v) =>
    typeof v === 'string' ? v === 'true' : !!v
  ),
  disabilityDetails: z.string().optional(),
  reasonForApplication: z
    .string()
    .min(20, 'Please describe your situation in at least 20 characters'),
  amountRequested: z.union([z.string(), z.number()]).optional(),
  additionalNotes: z.string().optional(),
});

const EMPLOYMENT_OPTIONS = [
  { value: 'employed', label: 'Employed' },
  { value: 'self-employed', label: 'Self-employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
  { value: 'other', label: 'Other' },
];

const HOUSING_OPTIONS = [
  { value: 'own', label: 'Owned' },
  { value: 'rent', label: 'Rented' },
  { value: 'family', label: 'Family-owned' },
  { value: 'other', label: 'Other' },
];

function ApplicationCard({ application }) {
  const cnicDoc = imageUrl(application.cnicDocumentUrl);
  return (
    <Card className="shadow-soft hover:shadow-medium transition-shadow duration-300">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <p className="text-xs text-gray-500">Application #{application.id}</p>
            <p className="text-lg font-semibold text-gray-900">{application.applicantName}</p>
          </div>
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium capitalize',
              getStatusColor(application.status)
            )}
          >
            {application.status.replace('_', ' ')}
          </span>
        </div>

        <div className="space-y-1.5 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{application.applicantPhone}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <span>{application.applicantCNIC}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span>{application.familyMembers} members · monthly income {formatCurrency(application.monthlyIncome)}</span>
          </div>
          {application.amountRequested && (
            <div className="text-xs text-gray-500">
              Requested: {formatCurrency(application.amountRequested)}
            </div>
          )}
          {application.createdAt && (
            <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{formatDate(application.createdAt)}</span>
            </div>
          )}
          {cnicDoc && (
            <div className="pt-2 border-t border-gray-100 mt-2">
              <a href={cnicDoc} target="_blank" rel="noopener noreferrer">
                <img
                  src={cnicDoc}
                  alt="CNIC document"
                  className="w-full h-32 object-cover rounded-md border border-gray-200 hover:opacity-90 transition"
                />
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ZakatApplication() {
  const [past, setPast] = useState([]);
  const [loadingPast, setLoadingPast] = useState(true);
  const [doc, setDoc] = useState(null);
  const [docPreview, setDocPreview] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      familyMembers: 1,
      monthlyIncome: 0,
      employmentStatus: 'unemployed',
      housingStatus: 'rent',
      hasDisabledMembers: false,
    },
  });

  const hasDisabled = watch('hasDisabledMembers');

  const loadPast = async () => {
    setLoadingPast(true);
    try {
      const res = await zakatService.getMyZakatApplications();
      setPast(res.data?.applications || []);
    } catch (err) {
      toast.error('Failed to load applications', { description: formatApiError(err) });
      setPast([]);
    } finally {
      setLoadingPast(false);
    }
  };

  useEffect(() => {
    loadPast();
  }, []);

  const handleDocChange = (e) => {
    const file = e.target.files?.[0] || null;
    setDoc(file);
    setDocPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  const clearDoc = () => {
    setDoc(null);
    setDocPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const onSubmit = async (data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') fd.append(k, String(v));
    });
    if (doc) fd.append('cnicDocument', doc);

    try {
      await zakatService.createZakatApplication(fd);
      toast.success('Application submitted', {
        description: 'Our team will review your application and reach out soon.',
      });
      reset({
        familyMembers: 1,
        monthlyIncome: 0,
        employmentStatus: 'unemployed',
        housingStatus: 'rent',
        hasDisabledMembers: false,
      });
      clearDoc();
      loadPast();
    } catch (err) {
      toast.error('Submission failed', { description: formatApiError(err) });
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent';

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <FadeIn direction="down" delay={0}>
          <div className="mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
              <Coins className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Apply for Zakat</h1>
              <p className="text-gray-600 mt-1">
                Submit your application to be considered eligible for zakat assistance.
                All information stays confidential.
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={100}>
          <Card className="shadow-medium mb-8">
            <CardHeader>
              <CardTitle>New Application</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Identity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-error">*</span>
                    </label>
                    <input {...register('applicantName')} className={inputClass} />
                    {errors.applicantName && (
                      <p className="mt-1 text-xs text-error">{errors.applicantName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-error">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="03001234567"
                      {...register('applicantPhone')}
                      className={inputClass}
                    />
                    {errors.applicantPhone && (
                      <p className="mt-1 text-xs text-error">{errors.applicantPhone.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CNIC (13 digits, no dashes) <span className="text-error">*</span>
                    </label>
                    <input
                      placeholder="4210112345671"
                      {...register('applicantCNIC')}
                      className={inputClass}
                    />
                    {errors.applicantCNIC && (
                      <p className="mt-1 text-xs text-error">{errors.applicantCNIC.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Family Members <span className="text-error">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      {...register('familyMembers')}
                      className={inputClass}
                    />
                    {errors.familyMembers && (
                      <p className="mt-1 text-xs text-error">{errors.familyMembers.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-error">*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="House, street, area, city"
                    {...register('applicantAddress')}
                    className={inputClass}
                  />
                  {errors.applicantAddress && (
                    <p className="mt-1 text-xs text-error">{errors.applicantAddress.message}</p>
                  )}
                </div>

                {/* Financial situation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Income (PKR) <span className="text-error">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      {...register('monthlyIncome')}
                      className={inputClass}
                    />
                    {errors.monthlyIncome && (
                      <p className="mt-1 text-xs text-error">{errors.monthlyIncome.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employment Status <span className="text-error">*</span>
                    </label>
                    <select {...register('employmentStatus')} className={inputClass}>
                      {EMPLOYMENT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Housing Status <span className="text-error">*</span>
                    </label>
                    <select {...register('housingStatus')} className={inputClass}>
                      {HOUSING_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount Requested (Optional, PKR)
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="If you have a specific amount in mind"
                      {...register('amountRequested')}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Disability */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      {...register('hasDisabledMembers')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    Anyone in the household has a disability or chronic illness
                  </label>
                  {hasDisabled && (
                    <textarea
                      rows={2}
                      placeholder="Please describe briefly"
                      {...register('disabilityDetails')}
                      className={`${inputClass} mt-2`}
                    />
                  )}
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Application <span className="text-error">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Briefly describe your circumstances and why you are seeking zakat assistance"
                    {...register('reasonForApplication')}
                    className={inputClass}
                  />
                  {errors.reasonForApplication && (
                    <p className="mt-1 text-xs text-error">
                      {errors.reasonForApplication.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Anything else our team should know"
                    {...register('additionalNotes')}
                    className={inputClass}
                  />
                </div>

                {/* CNIC photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNIC Photo (Optional)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Attach a clear photo of your CNIC to help us verify your application faster.
                  </p>
                  {docPreview ? (
                    <div className="relative">
                      <img
                        src={docPreview}
                        alt="CNIC preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={clearDoc}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-md rounded-full p-1.5 text-gray-700"
                        aria-label="Remove photo"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="cnic-doc"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <Camera className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-sm text-gray-600">Tap to attach CNIC photo</span>
                      <span className="text-xs text-gray-400 mt-0.5">JPG / PNG, up to 5 MB</span>
                      <input
                        id="cnic-doc"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleDocChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      reset();
                      clearDoc();
                    }}
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
                        Submitting…
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Past applications */}
        <FadeIn direction="up" delay={150}>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Applications</h2>
          {loadingPast ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : past.length === 0 ? (
            <EmptyState
              title="No applications yet"
              description="Once you submit one, it will appear here with its current status."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {past.map((a) => (
                <ApplicationCard key={a.id} application={a} />
              ))}
            </div>
          )}
        </FadeIn>
      </div>
    </DashboardLayout>
  );
}
