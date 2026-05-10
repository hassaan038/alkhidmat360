import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import FormSection, { FormGrid, FormField } from '../../components/ui/FormSection';
import Input, { Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { toast } from 'sonner';
import { Scissors, Bot, Beef, Mountain, Info, User, Calendar, RotateCcw, ArrowRight, Moon } from 'lucide-react';
import { createSkinCollection } from '../../services/donationService';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';

const todayIso = () => new Date().toISOString().slice(0, 10);

const EID_DAYS = [
  { value: 'DAY_1', label: 'Eid Day 1' },
  { value: 'DAY_2', label: 'Eid Day 2' },
  { value: 'DAY_3', label: 'Eid Day 3' },
  { value: 'DAY_4', label: 'Eid Day 4' },
  { value: 'DAY_5', label: 'Eid Day 5' },
];

const skinCollectionSchema = z
  .object({
    animalType: z.string().min(2).max(50),
    numberOfSkins: z.coerce.number().int().min(1, 'Number of skins must be at least 1').max(50, 'Number of skins cannot exceed 50'),
    donorName: z.string().min(2, 'Name must be at least 2 characters'),
    collectionAddress: z.string().min(10, 'Please provide a complete address'),
    forEidQurbani: z.boolean(),
    preferredDate: z.string().optional(),
    eidDay: z.enum(['DAY_1', 'DAY_2', 'DAY_3', 'DAY_4', 'DAY_5']).optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.forEidQurbani) {
      if (!data.eidDay) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['eidDay'], message: 'Please pick one of the 5 Eid days' });
      }
    } else {
      if (!data.preferredDate) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['preferredDate'], message: 'Please select a preferred pickup date' });
        return;
      }
      const picked = new Date(data.preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (picked < today) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['preferredDate'], message: 'Pickup date cannot be in the past' });
      }
    }
  });

export default function SkinCollection() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSkin, setSelectedSkin] = useState('');
  const [customMode, setCustomMode] = useState(false);

  const skinTypes = useMemo(() => [
    { id: 'goat', name: t('skinCollection.goatSkin'), icon: Bot },
    { id: 'cow', name: t('skinCollection.cowSkin'), icon: Beef },
    { id: 'camel', name: t('skinCollection.camelSkin'), icon: Mountain },
  ], [t]);

  const infoPoints = useMemo(() => [
    t('skinCollection.info1'),
    t('skinCollection.info2'),
    t('skinCollection.info3'),
    t('skinCollection.info4'),
  ], [t]);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    resolver: zodResolver(skinCollectionSchema),
    defaultValues: { numberOfSkins: 1, forEidQurbani: false, eidDay: undefined, preferredDate: '' },
  });
  const forEidQurbani = watch('forEidQurbani');
  const eidDay = watch('eidDay');

  const toggleEidMode = (next) => {
    setValue('forEidQurbani', next, { shouldValidate: false });
    if (next) {
      setValue('preferredDate', '', { shouldValidate: false });
    } else {
      setValue('eidDay', undefined, { shouldValidate: false });
    }
  };

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
      const { forEidQurbani: _eid, ...rest } = data;
      const payload = forEidQurbani
        ? { ...rest, preferredDate: undefined }
        : { ...rest, eidDay: undefined };
      await createSkinCollection(payload);
      toast.success(t('skinCollection.pickupRequestSubmitted'), {
        description: t('skinCollection.pickupRequestSubmittedDesc'),
      });
      reset({ numberOfSkins: 1, forEidQurbani: false, eidDay: undefined, preferredDate: '' });
      setSelectedSkin('');
      setCustomMode(false);
    } catch (error) {
      toast.error(t('common.submissionFailed'), {
        description: error.response?.data?.message || t('common.tryAgainLater'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <PageContainer className="max-w-4xl space-y-6">
        <PageHeader
          icon={Scissors}
          accent="qurbani"
          title={t('skinCollection.title')}
          description={t('skinCollection.description')}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title={t('skinCollection.whatAreYouDonating')} icon={Scissors}>
            <FormField label={t('skinCollection.animalType')} required error={errors.animalType?.message}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {skinTypes.map((skin) => {
                  const SkinIcon = skin.icon;
                  const selected = selectedSkin === skin.id;
                  return (
                    <label
                      key={skin.id}
                      className={cn(
                        'relative flex cursor-pointer flex-col items-center justify-center rounded-xl border p-4 transition-colors duration-200',
                        selected
                          ? 'border-qurbani-500 bg-qurbani-50 dark:bg-qurbani-500/10 ring-1 ring-inset ring-qurbani-200 dark:ring-qurbani-700/40'
                          : 'border-gray-200 dark:border-gray-800 hover:border-qurbani-300 hover:bg-gray-50'
                      )}
                      onClick={() => handleSkinSelect(skin)}
                    >
                      <input type="radio" value={skin.name} {...register('animalType')} className="sr-only" />
                      <span
                        className={cn(
                          'flex h-11 w-11 items-center justify-center rounded-xl mb-2 transition-colors',
                          selected ? 'bg-qurbani-100 dark:bg-qurbani-500/15 text-qurbani-700 dark:text-qurbani-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        )}
                      >
                        <SkinIcon className="h-5 w-5" />
                      </span>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{skin.name}</p>
                    </label>
                  );
                })}
              </div>
            </FormField>

            {!customMode ? (
              <button
                type="button"
                onClick={enableCustom}
                className="mt-3 text-sm font-medium text-qurbani-600 hover:text-qurbani-700 underline-offset-2 hover:underline cursor-pointer"
              >
                {t('skinCollection.noneFitCustom')}
              </button>
            ) : (
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('skinCollection.customAnimalType')}</label>
                  <button
                    type="button"
                    onClick={() => { setCustomMode(false); setValue('animalType', '', { shouldValidate: false }); }}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 cursor-pointer"
                  >
                    {t('skinCollection.usePresetInstead')}
                  </button>
                </div>
                <Input {...register('animalType')} placeholder={t('skinCollection.customAnimalPlaceholder')} autoFocus />
              </div>
            )}

            <FormGrid cols={2} className="mt-5">
              <FormField label={t('skinCollection.numberOfSkins')} required htmlFor="ns" error={errors.numberOfSkins?.message}>
                <Input id="ns" type="number" min={1} max={50} {...register('numberOfSkins')} />
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection title={t('skinCollection.pickupInformation')} icon={User}>
            <FormGrid cols={2}>
              <FormField wide label={t('form.fullName')} required htmlFor="dn" error={errors.donorName?.message}>
                <Input id="dn" leftIcon={User} {...register('donorName')} placeholder={t('form.yourFullName')} />
              </FormField>
              <FormField wide label={t('skinCollection.collectionAddress')} required htmlFor="ca" error={errors.collectionAddress?.message}>
                <Textarea id="ca" rows={3} {...register('collectionAddress')} placeholder={t('skinCollection.pickupAddressPlaceholder')} />
              </FormField>
            </FormGrid>

            <div className="mt-5 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-50 flex items-center gap-2">
                    <Moon className="h-4 w-4 text-qurbani-600" />
                    Skin from Eid Qurbani animal?
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Toggle on if this skin is from an animal sacrificed on one of the Eid days.
                    We&apos;ll schedule pickup for that Eid day instead of asking for a calendar date.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={forEidQurbani}
                  onClick={() => toggleEidMode(!forEidQurbani)}
                  className={cn(
                    'relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors cursor-pointer',
                    forEidQurbani ? 'bg-qurbani-600' : 'bg-gray-300 dark:bg-gray-700'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                      forEidQurbani ? 'translate-x-5' : 'translate-x-0.5'
                    )}
                  />
                </button>
              </div>

              {forEidQurbani ? (
                <div className="mt-4">
                  <FormField label="Eid day" required error={errors.eidDay?.message}>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {EID_DAYS.map((d) => {
                        const selected = eidDay === d.value;
                        return (
                          <label
                            key={d.value}
                            className={cn(
                              'cursor-pointer rounded-lg border p-3 text-center text-sm font-medium transition-colors',
                              selected
                                ? 'border-qurbani-500 bg-qurbani-50 dark:bg-qurbani-500/10 text-qurbani-700 dark:text-qurbani-200 ring-1 ring-inset ring-qurbani-200 dark:ring-qurbani-700/40'
                                : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-qurbani-300 hover:bg-gray-50'
                            )}
                          >
                            <input type="radio" value={d.value} {...register('eidDay')} className="sr-only" />
                            {d.label}
                          </label>
                        );
                      })}
                    </div>
                  </FormField>
                </div>
              ) : (
                <div className="mt-4">
                  <FormField label={t('skinCollection.preferredDate')} required htmlFor="pd" error={errors.preferredDate?.message} hint={t('skinCollection.preferredDateHint')}>
                    <Input id="pd" type="date" leftIcon={Calendar} min={todayIso()} {...register('preferredDate')} />
                  </FormField>
                </div>
              )}
            </div>

            <FormGrid cols={1} className="mt-5">
              <FormField wide label={t('form.additionalNotes')} htmlFor="nt">
                <Textarea id="nt" rows={2} {...register('notes')} placeholder={t('skinCollection.specialInstructionsPlaceholder')} />
              </FormField>
            </FormGrid>
          </FormSection>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" leftIcon={RotateCcw} onClick={() => { reset(); setSelectedSkin(''); setCustomMode(false); }} disabled={isSubmitting}>
              {t('common.reset')}
            </Button>
            <Button type="submit" size="lg" loading={isSubmitting} rightIcon={ArrowRight}>
              {t('skinCollection.schedulePickup')}
            </Button>
          </div>
        </form>

        <div className="rounded-2xl border border-qurbani-100 dark:border-qurbani-700/40 bg-qurbani-50/60 dark:bg-qurbani-500/10 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-qurbani-100 dark:bg-qurbani-500/15 text-qurbani-700 dark:text-qurbani-200">
              <Info className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-qurbani-700 dark:text-qurbani-200">{t('skinCollection.howItWorks')}</h4>
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
    </DashboardLayout>
  );
}
