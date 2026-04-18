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
import { toast } from 'sonner';
import { Scissors, Bot, Beef, Mountain, Info, User, Phone, Calendar, RotateCcw, ArrowRight } from 'lucide-react';
import { createSkinCollection } from '../../services/donationService';
import { cn } from '../../lib/utils';

const skinCollectionSchema = z.object({
  animalType: z.string().min(2).max(50),
  numberOfSkins: z.coerce.number().int().min(1).max(100),
  donorName: z.string().min(2, 'Name must be at least 2 characters'),
  donorPhone: z.string().min(11).max(15),
  collectionAddress: z.string().min(10, 'Please provide a complete address'),
  preferredDate: z.string().min(1, 'Please select a preferred pickup date'),
  notes: z.string().optional(),
});

const skinTypes = [
  { id: 'goat', name: 'Goat Skin', icon: Bot },
  { id: 'cow', name: 'Cow Skin', icon: Beef },
  { id: 'camel', name: 'Camel Skin', icon: Mountain },
];

const infoPoints = [
  "You're donating the skin itself — there's no payment either way.",
  'Please salt and dry the skin before our team arrives.',
  'Proceeds fund Alkhidmat welfare programs.',
  'Pickup is free — our team will call before arriving.',
];

export default function SkinCollection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSkin, setSelectedSkin] = useState('');
  const [customMode, setCustomMode] = useState(false);

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
      toast.success('Pickup request submitted', {
        description: 'Our team will contact you to schedule the pickup. Thank you for donating.',
      });
      reset();
      setSelectedSkin('');
      setCustomMode(false);
    } catch (error) {
      toast.error('Submission failed', {
        description: error.response?.data?.message || 'Please try again later',
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
          title="Skin Collection"
          description="Donate your Qurbani animal skin — we collect it free of cost."
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormSection title="What are you donating?" icon={Scissors}>
            <FormField label="Animal type" required error={errors.animalType?.message}>
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
                          ? 'border-qurbani-500 bg-qurbani-50 ring-1 ring-inset ring-qurbani-200'
                          : 'border-gray-200 hover:border-qurbani-300 hover:bg-gray-50'
                      )}
                      onClick={() => handleSkinSelect(skin)}
                    >
                      <input type="radio" value={skin.name} {...register('animalType')} className="sr-only" />
                      <span
                        className={cn(
                          'flex h-11 w-11 items-center justify-center rounded-xl mb-2 transition-colors',
                          selected ? 'bg-qurbani-100 text-qurbani-700' : 'bg-gray-100 text-gray-500'
                        )}
                      >
                        <SkinIcon className="h-5 w-5" />
                      </span>
                      <p className="text-sm font-medium text-gray-900">{skin.name}</p>
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
                Don't see your animal? Enter a custom type instead.
              </button>
            ) : (
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Custom animal type</label>
                  <button
                    type="button"
                    onClick={() => { setCustomMode(false); setValue('animalType', '', { shouldValidate: false }); }}
                    className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    Use a preset instead
                  </button>
                </div>
                <Input {...register('animalType')} placeholder="e.g., Mixed Animal Skins" autoFocus />
              </div>
            )}

            <FormGrid cols={2} className="mt-5">
              <FormField label="Number of skins" required htmlFor="ns" error={errors.numberOfSkins?.message}>
                <Input id="ns" type="number" min={1} {...register('numberOfSkins')} />
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection title="Pickup information" icon={User}>
            <FormGrid cols={2}>
              <FormField label="Full name" required htmlFor="dn" error={errors.donorName?.message}>
                <Input id="dn" leftIcon={User} {...register('donorName')} placeholder="Your full name" />
              </FormField>
              <FormField label="Phone number" required htmlFor="dp" error={errors.donorPhone?.message}>
                <Input id="dp" type="tel" leftIcon={Phone} {...register('donorPhone')} placeholder="03001234567" />
              </FormField>
              <FormField wide label="Collection address" required htmlFor="ca" error={errors.collectionAddress?.message}>
                <Textarea id="ca" rows={3} {...register('collectionAddress')} placeholder="Complete pickup address with landmarks" />
              </FormField>
              <FormField label="Preferred pickup date" required htmlFor="pd" error={errors.preferredDate?.message} hint="Ideally within 1–2 days of Qurbani">
                <Input id="pd" type="date" leftIcon={Calendar} {...register('preferredDate')} />
              </FormField>
              <FormField wide label="Additional notes" htmlFor="nt">
                <Textarea id="nt" rows={2} {...register('notes')} placeholder="Special instructions for the pickup team" />
              </FormField>
            </FormGrid>
          </FormSection>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" leftIcon={RotateCcw} onClick={() => { reset(); setSelectedSkin(''); setCustomMode(false); }} disabled={isSubmitting}>
              Reset
            </Button>
            <Button type="submit" size="lg" loading={isSubmitting} rightIcon={ArrowRight}>
              Schedule pickup
            </Button>
          </div>
        </form>

        <div className="rounded-2xl border border-qurbani-100 bg-qurbani-50/60 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-qurbani-100 text-qurbani-700">
              <Info className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-semibold text-qurbani-700">How skin collection works</h4>
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
