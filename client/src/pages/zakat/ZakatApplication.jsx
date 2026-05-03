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
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeading from '../../components/ui/SectionHeading';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonStatCard } from '../../components/ui/Skeleton';
import * as zakatService from '../../services/zakatService';
import { formatCurrency, formatDate, formatApiError } from '../../lib/utils';
import { imageUrl } from '../../lib/imageUrl';
import { useTranslation } from 'react-i18next';

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

const EMPLOYMENT_KEYS = ['employed', 'self-employed', 'unemployed', 'student', 'retired', 'other'];
const HOUSING_KEYS = ['own', 'rent', 'family', 'other'];

function ApplicationCard({ application }) {
  const { t } = useTranslation();
  const cnicDoc = imageUrl(application.cnicDocumentUrl);
  return (
    <Card className="shadow-soft hover:shadow-medium transition-shadow duration-300">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('sadqa.donationNo')}{application.id}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">{application.applicantName}</p>
          </div>
          <StatusBadge status={application.status} size="sm" />
        </div>

        <div className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span>{application.applicantPhone}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span>{application.applicantCNIC}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span>{application.familyMembers} · {formatCurrency(application.monthlyIncome)}</span>
          </div>
          {application.amountRequested && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {t('zakatApplication.amountRequested')}: {formatCurrency(application.amountRequested)}
            </div>
          )}
          {application.createdAt && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-1">
              <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span>{formatDate(application.createdAt)}</span>
            </div>
          )}
          {cnicDoc && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
              <a href={cnicDoc} target="_blank" rel="noopener noreferrer">
                <img
                  src={cnicDoc}
                  alt="CNIC document"
                  className="w-full h-32 object-cover rounded-md border border-gray-200 dark:border-gray-800 hover:opacity-90 transition"
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
  const { t } = useTranslation();
  const EMPLOYMENT_OPTIONS = EMPLOYMENT_KEYS.map((value) => ({
    value,
    label: t(`zakatApplication.${value === 'self-employed' ? 'selfEmployed' : value}`),
  }));
  const HOUSING_OPTIONS = HOUSING_KEYS.map((value) => ({
    value,
    label: t(`zakatApplication.${value}`),
  }));
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
      toast.error(t('zakatApplication.failedToLoad'), { description: formatApiError(err) });
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
      toast.success(t('zakatApplication.submitted'), {
        description: t('zakatApplication.submittedDesc'),
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
      toast.error(t('common.submissionFailed'), { description: formatApiError(err) });
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent';

  return (
    <DashboardLayout>
      <PageContainer className="max-w-4xl space-y-6">
        <PageHeader
          icon={Coins}
          accent="zakat"
          title={t('zakatApplication.title')}
          description={t('zakatApplication.description')}
        />

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>{t('zakatApplication.applicantInformation')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Identity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('zakatApplication.applicantName')} <span className="text-error">*</span>
                    </label>
                    <input {...register('applicantName')} className={inputClass} />
                    {errors.applicantName && (
                      <p className="mt-1 text-xs text-error">{errors.applicantName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('zakatApplication.applicantPhone')} <span className="text-error">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder={t('form.phonePlaceholder')}
                      {...register('applicantPhone')}
                      className={inputClass}
                    />
                    {errors.applicantPhone && (
                      <p className="mt-1 text-xs text-error">{errors.applicantPhone.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('zakatApplication.applicantCNIC')} <span className="text-error">*</span>
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('zakatApplication.familyMembers')} <span className="text-error">*</span>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('zakatApplication.applicantAddress')} <span className="text-error">*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder={t('form.completeAddress')}
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('zakatApplication.monthlyIncome')} <span className="text-error">*</span>
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('zakatApplication.employmentStatus')} <span className="text-error">*</span>
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('zakatApplication.housingStatus')} <span className="text-error">*</span>
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('zakatApplication.amountRequested')} ({t('common.optional')})
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder={t('zakatApplication.amountRequested')}
                      {...register('amountRequested')}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Disability */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      {...register('hasDisabledMembers')}
                      className="rounded border-gray-300 dark:border-gray-700 text-primary-600 focus:ring-primary-500"
                    />
                    {t('zakatApplication.hasDisabledMembers')}
                  </label>
                  {hasDisabled && (
                    <textarea
                      rows={2}
                      placeholder={t('zakatApplication.disabilityDetails')}
                      {...register('disabilityDetails')}
                      className={`${inputClass} mt-2`}
                    />
                  )}
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('zakatApplication.reasonForApplication')} <span className="text-error">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder={t('zakatApplication.reasonForApplication')}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('form.additionalNotes')} ({t('common.optional')})
                  </label>
                  <textarea
                    rows={2}
                    placeholder={t('form.specialInstructions')}
                    {...register('additionalNotes')}
                    className={inputClass}
                  />
                </div>

                {/* CNIC photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('zakatApplication.cnicDocument')}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {t('skinPickup.housePhotoHint')}
                  </p>
                  {docPreview ? (
                    <div className="relative">
                      <img
                        src={docPreview}
                        alt="CNIC preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-800"
                      />
                      <button
                        type="button"
                        onClick={clearDoc}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-md rounded-full p-1.5 text-gray-700 dark:text-gray-300"
                        aria-label="Remove photo"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="cnic-doc"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 transition"
                    >
                      <Camera className="w-6 h-6 text-gray-400 dark:text-gray-500 mb-1" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t('skinPickup.tapToTakePhoto')}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{t('skinPickup.photoSizeLimit')}</span>
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

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      reset();
                      clearDoc();
                    }}
                    disabled={isSubmitting}
                  >
                    {t('common.reset')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('common.submitting')}
                      </>
                    ) : (
                      t('common.submitApplication')
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

        {/* Past applications */}
        <div>
          <SectionHeading title={t('zakatApplication.myApplications')} description={t('zakatApplication.yourApplicationHistory')} size="md" />
          {loadingPast ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SkeletonStatCard />
              <SkeletonStatCard />
            </div>
          ) : past.length === 0 ? (
            <EmptyState
              icon={Coins}
              tone="zakat"
              title={t('zakatApplication.noApplications')}
              description={t('zakatApplication.noApplicationsDesc')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {past.map((a) => (<ApplicationCard key={a.id} application={a} />))}
            </div>
          )}
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
