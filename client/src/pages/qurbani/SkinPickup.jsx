import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Scissors,
  MapPin,
  Loader2,
  Crosshair,
  X as XIcon,
  Calendar,
  Phone,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { imageUrl } from '../../lib/imageUrl';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeading from '../../components/ui/SectionHeading';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonStatCard } from '../../components/ui/Skeleton';
import * as qurbaniSkinPickupService from '../../services/qurbaniSkinPickupService';
import useQurbaniModuleStore from '../../store/qurbaniModuleStore';
import { formatDate, formatApiError } from '../../lib/utils';
import { useTranslation } from 'react-i18next';
import { pakistanPhoneSchema } from '../../lib/validators';

const skinPickupSchema = z.object({
  contactPhone: pakistanPhoneSchema,
  address: z.string().optional(),
  numberOfSkins: z.coerce.number().int().min(1, 'At least 1').max(50),
  preferredDate: z.string().optional(),
  additionalDetails: z.string().optional(),
});

function osmEmbedUrl(lat, lng) {
  const d = 0.005;
  const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}

function osmLink(lat, lng) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`;
}

function PickupCard({ pickup }) {
  const { t } = useTranslation();
  const lat = pickup.latitude != null ? Number(pickup.latitude) : null;
  const lng = pickup.longitude != null ? Number(pickup.longitude) : null;
  const hasCoords = lat != null && lng != null;
  const photo = imageUrl(pickup.housePhotoUrl);

  return (
    <Card className="shadow-soft hover:shadow-medium transition-shadow duration-300">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('skinPickup.requestNo')}{pickup.id}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              {pickup.numberOfSkins} {pickup.numberOfSkins > 1 ? t('skinPickup.skins') : t('skinPickup.skin')}
            </p>
          </div>
          <StatusBadge status={pickup.status} size="sm" />
        </div>

        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p>{pickup.address}</p>
              {hasCoords && (
                <a
                  href={osmLink(lat, lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-600 hover:text-primary-700 underline mt-0.5 inline-block"
                >
                  <MapPin className="inline w-3 h-3 mr-0.5 -mt-0.5" />
                  {lat.toFixed(5)}, {lng.toFixed(5)} — {t('skinPickup.viewOnMap')}
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span>{pickup.contactPhone}</span>
          </div>

          {pickup.preferredDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span>{t('skinPickup.preferredDateLabel')} {formatDate(pickup.preferredDate)}</span>
            </div>
          )}

          {pickup.additionalDetails && (
            <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
              {pickup.additionalDetails}
            </p>
          )}

          {photo && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <a href={photo} target="_blank" rel="noopener noreferrer">
                <img
                  src={photo}
                  alt="House"
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

export default function SkinPickup() {
  const { t } = useTranslation();
  const { moduleEnabled, fetchFlag } = useQurbaniModuleStore();
  const [pickups, setPickups] = useState([]);
  const [loadingPickups, setLoadingPickups] = useState(true);
  const [coords, setCoords] = useState(null); // { lat, lng }
  const [locating, setLocating] = useState(false);
  const [housePhoto, setHousePhoto] = useState(null);
  const [housePhotoPreview, setHousePhotoPreview] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(skinPickupSchema),
    defaultValues: { numberOfSkins: 1 },
  });

  useEffect(() => {
    if (moduleEnabled === null) {
      fetchFlag();
    }
  }, [moduleEnabled, fetchFlag]);

  const loadPickups = async () => {
    setLoadingPickups(true);
    try {
      const res = await qurbaniSkinPickupService.getMySkinPickups();
      setPickups(res.data?.pickups || []);
    } catch (err) {
      toast.error(t('skinPickup.failedToLoad'), { description: formatApiError(err) });
      setPickups([]);
    } finally {
      setLoadingPickups(false);
    }
  };

  useEffect(() => {
    if (moduleEnabled === true) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadPickups();
    } else if (moduleEnabled === false) {
      setLoadingPickups(false);
    }
  }, [moduleEnabled]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t('skinPickup.locationNotSupported'), {
        description: t('skinPickup.locationNotSupportedDesc'),
      });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        toast.success(t('skinPickup.locationCaptured'), {
          description: t('skinPickup.locationCapturedDesc'),
        });
      },
      (err) => {
        setLocating(false);
        toast.error(t('skinPickup.couldNotGetLocation'), {
          description: err?.message || t('skinPickup.couldNotGetLocationDesc'),
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setHousePhoto(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setHousePhotoPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } else {
      setHousePhotoPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
  };

  const clearPhoto = () => {
    setHousePhoto(null);
    setHousePhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const onSubmit = async (data) => {
    const trimmedAddress = (data.address || '').trim();
    const hasCoords = coords != null;

    if (!hasCoords && trimmedAddress.length < 5) {
      setError('address', {
        type: 'manual',
        message:
          'Please provide a complete address, or click "Use My Location" to capture coordinates instead.',
      });
      return;
    }
    clearErrors('address');

    const fd = new FormData();
    fd.append('contactPhone', data.contactPhone);
    if (trimmedAddress) fd.append('address', trimmedAddress);
    fd.append('numberOfSkins', String(data.numberOfSkins));
    if (coords?.lat != null) fd.append('latitude', String(coords.lat));
    if (coords?.lng != null) fd.append('longitude', String(coords.lng));
    if (data.preferredDate) fd.append('preferredDate', data.preferredDate);
    if (data.additionalDetails) fd.append('additionalDetails', data.additionalDetails);
    if (housePhoto) fd.append('housePhoto', housePhoto);

    try {
      await qurbaniSkinPickupService.createSkinPickup(fd);
      toast.success(t('skinPickup.requestSubmitted'), {
        description: t('skinPickup.requestSubmittedDesc'),
      });
      reset({ numberOfSkins: 1 });
      setCoords(null);
      clearPhoto();
      loadPickups();
    } catch (err) {
      toast.error(t('common.submissionFailed'), { description: formatApiError(err) });
    }
  };

  const flagLoading = moduleEnabled === null;

  return (
    <DashboardLayout>
      <PageContainer className="max-w-4xl space-y-6">
        <PageHeader
          icon={Scissors}
          accent="qurbani"
          title={t('skinPickup.title')}
          description={t('skinPickup.description')}
        />

        {flagLoading ? (
          <SkeletonStatCard />
        ) : moduleEnabled === false ? (
          <EmptyState
            icon={Scissors}
            tone="qurbani"
            title={t('skinPickup.moduleClosed')}
            description={t('skinPickup.moduleClosedDesc')}
          />
        ) : (
          <>
            {/* Form */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>{t('skinPickup.newPickupRequest')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('skinPickup.contactPhone')} <span className="text-error">*</span>
                        </label>
                        <input
                          type="tel"
                          {...register('contactPhone')}
                          placeholder="03001234567"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        {errors.contactPhone && (
                          <p className="mt-1 text-xs text-error">
                            {errors.contactPhone.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('skinPickup.numberOfSkins')} <span className="text-error">*</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          {...register('numberOfSkins')}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        {errors.numberOfSkins && (
                          <p className="mt-1 text-xs text-error">
                            {errors.numberOfSkins.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('skinPickup.address')}{' '}
                          {coords ? (
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                              {t('skinPickup.addressOptional')}
                            </span>
                          ) : (
                            <span className="text-error">*</span>
                          )}
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleUseMyLocation}
                          disabled={locating}
                          className="text-xs"
                        >
                          {locating ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                              {t('skinPickup.locating')}
                            </>
                          ) : (
                            <>
                              <Crosshair className="w-3 h-3 mr-1.5" />
                              {t('skinPickup.useLocation')}
                            </>
                          )}
                        </Button>
                      </div>
                      <textarea
                        rows={2}
                        {...register('address')}
                        placeholder={
                          coords
                            ? 'You can leave this blank or add a landmark / flat number'
                            : 'House #, street, area, city'
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      {errors.address && (
                        <p className="mt-1 text-xs text-error">{errors.address.message}</p>
                      )}
                    </div>

                    {coords && (
                      <div className="border border-primary-200 bg-primary-50/50 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 text-xs">
                          <span className="text-primary-900 font-medium inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {t('skinPickup.captured')} {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCoords(null)}
                            className="text-primary-700 hover:text-primary-900"
                            aria-label="Clear location"
                          >
                            <XIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <iframe
                          title="Pickup location preview"
                          src={osmEmbedUrl(coords.lat, coords.lng)}
                          className="w-full h-48 border-0"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('skinPickup.preferredDate')}
                      </label>
                      <input
                        type="date"
                        {...register('preferredDate')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('skinPickup.additionalDetails')}
                      </label>
                      <textarea
                        rows={2}
                        {...register('additionalDetails')}
                        placeholder={t('form.specialInstructions')}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('skinPickup.housePhoto')}
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {t('skinPickup.housePhotoHint')}
                      </p>
                      {housePhotoPreview ? (
                        <div className="relative">
                          <img
                            src={housePhotoPreview}
                            alt="House preview"
                            className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-800"
                          />
                          <button
                            type="button"
                            onClick={clearPhoto}
                            className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-md rounded-full p-1.5 text-gray-700 dark:text-gray-300"
                            aria-label="Remove photo"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="house-photo"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 transition"
                        >
                          <Camera className="w-6 h-6 text-gray-400 dark:text-gray-500 mb-1" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {t('skinPickup.tapToTakePhoto')}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {t('skinPickup.photoSizeLimit')}
                          </span>
                          <input
                            id="house-photo"
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handlePhotoChange}
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
                          reset({ numberOfSkins: 1 });
                          setCoords(null);
                          clearPhoto();
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
                          t('skinPickup.submitRequest')
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

            <div>
              <SectionHeading title={t('skinPickup.myPickups')} description={t('skinPickup.yourPickupHistory')} size="md" />
              {loadingPickups ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SkeletonStatCard />
                  <SkeletonStatCard />
                </div>
              ) : pickups.length === 0 ? (
                <EmptyState
                  icon={Scissors}
                  tone="qurbani"
                  title={t('skinPickup.noPickups')}
                  description={t('skinPickup.noPickupsDesc')}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pickups.map((p) => (<PickupCard key={p.id} pickup={p} />))}
                </div>
              )}
            </div>
          </>
        )}
      </PageContainer>
    </DashboardLayout>
  );
}
