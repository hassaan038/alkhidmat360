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
import { Scissors, Bot, Beef, Mountain, Info, User, Phone, Calendar, RotateCcw, ArrowRight } from 'lucide-react';
import { createSkinCollection } from '../../services/donationService';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';

const skinCollectionSchema = z.object({
  animalType: z.string().min(2).max(50),
  numberOfSkins: z.coerce.number().int().min(1).max(100),
  donorName: z.string().min(2, 'Name must be at least 2 characters'),
  donorPhone: z.string().min(11).max(15),
  collectionAddress: z.string().min(10, 'Please provide a complete address'),
  preferredDate: z.string().min(1, 'Please select a preferred pickup date'),
  notes: z.string().optional(),
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

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: zodResolver(skinCollectionSchema),
    defaultValues: { numberOfSkins: 1 },
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
      toast.success(t('skinCollection.pickupRequestSubmitted'), {
        description: t('skinCollection.pickupRequestSubmittedDesc'),
      });
      reset();
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
                <Input id="ns" type="number" min={1} {...register('numberOfSkins')} />
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection title={t('skinCollection.pickupInformation')} icon={User}>
            <FormGrid cols={2}>
              <FormField label={t('form.fullName')} required htmlFor="dn" error={errors.donorName?.message}>
                <Input id="dn" leftIcon={User} {...register('donorName')} placeholder={t('form.yourFullName')} />
              </FormField>
              <FormField label={t('form.phoneNumber')} required htmlFor="dp" error={errors.donorPhone?.message}>
                <Input id="dp" type="tel" leftIcon={Phone} {...register('donorPhone')} placeholder={t('form.phonePlaceholder')} />
              </FormField>
              <FormField wide label={t('skinCollection.collectionAddress')} required htmlFor="ca" error={errors.collectionAddress?.message}>
                <Textarea id="ca" rows={3} {...register('collectionAddress')} placeholder={t('skinCollection.pickupAddressPlaceholder')} />
              </FormField>
              <FormField label={t('skinCollection.preferredDate')} required htmlFor="pd" error={errors.preferredDate?.message} hint={t('skinCollection.preferredDateHint')}>
                <Input id="pd" type="date" leftIcon={Calendar} {...register('preferredDate')} />
              </FormField>
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
