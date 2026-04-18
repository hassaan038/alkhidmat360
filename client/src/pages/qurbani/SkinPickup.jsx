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
import FadeIn from '../../components/animations/FadeIn';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/Skeleton';
import * as qurbaniSkinPickupService from '../../services/qurbaniSkinPickupService';
import useQurbaniModuleStore from '../../store/qurbaniModuleStore';
import { cn, formatDate, formatApiError } from '../../lib/utils';

const skinPickupSchema = z.object({
  contactPhone: z
    .string()
    .min(10, 'Please enter a valid phone number')
    .max(20, 'Phone number is too long'),
  address: z.string().optional(),
  numberOfSkins: z.coerce.number().int().min(1, 'At least 1').max(50),
  preferredDate: z.string().optional(),
  additionalDetails: z.string().optional(),
});

const STATUS_LABELS = {
  pending: 'Pending',
  scheduled: 'Scheduled',
  collected: 'Collected',
  cancelled: 'Cancelled',
};

const STATUS_BADGE_CLASS = (status) => {
  switch (status) {
    case 'scheduled':
      return 'bg-info-light text-info-dark border-info';
    case 'collected':
      return 'bg-success-light text-success-dark border-success';
    case 'cancelled':
      return 'bg-error-light text-error-dark border-error';
    case 'pending':
    default:
      return 'bg-warning-light text-warning-dark border-warning';
  }
};

function osmEmbedUrl(lat, lng) {
  const d = 0.005;
  const bbox = `${lng - d},${lat - d},${lng + d},${lat + d}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}

function osmLink(lat, lng) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`;
}

function PickupCard({ pickup }) {
  const lat = pickup.latitude != null ? Number(pickup.latitude) : null;
  const lng = pickup.longitude != null ? Number(pickup.longitude) : null;
  const hasCoords = lat != null && lng != null;
  const photo = imageUrl(pickup.housePhotoUrl);

  return (
    <Card className="shadow-soft hover:shadow-medium transition-shadow duration-300">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <p className="text-sm text-gray-500">Request #{pickup.id}</p>
            <p className="text-lg font-semibold text-gray-900">
              {pickup.numberOfSkins} skin{pickup.numberOfSkins > 1 ? 's' : ''}
            </p>
          </div>
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium',
              STATUS_BADGE_CLASS(pickup.status)
            )}
          >
            {STATUS_LABELS[pickup.status] || pickup.status}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p>{pickup.address}</p>
              {hasCoords && (
                <a
                  href={osmLink(lat, lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-600 hover:text-primary-700 underline mt-0.5 inline-block"
                >
                  📍 {lat.toFixed(5)}, {lng.toFixed(5)} — view on map
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{pickup.contactPhone}</span>
          </div>

          {pickup.preferredDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Preferred: {formatDate(pickup.preferredDate)}</span>
            </div>
          )}

          {pickup.additionalDetails && (
            <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
              {pickup.additionalDetails}
            </p>
          )}

          {photo && (
            <div className="pt-2 border-t border-gray-100">
              <a href={photo} target="_blank" rel="noopener noreferrer">
                <img
                  src={photo}
                  alt="House"
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

export default function SkinPickup() {
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
      toast.error('Failed to load your requests', { description: formatApiError(err) });
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
      toast.error('Location not supported', {
        description: 'Your browser does not support geolocation.',
      });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        toast.success('Location captured', {
          description: 'Your coordinates will be sent with the request.',
        });
      },
      (err) => {
        setLocating(false);
        toast.error('Could not get location', {
          description:
            err?.message ||
            'Please allow location access in your browser, or skip this step.',
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
      toast.success('Request submitted', {
        description: 'Our team will reach out to schedule the pickup.',
      });
      reset({ numberOfSkins: 1 });
      setCoords(null);
      clearPhoto();
      loadPickups();
    } catch (err) {
      toast.error('Submission failed', { description: formatApiError(err) });
    }
  };

  const flagLoading = moduleEnabled === null;

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <FadeIn direction="down" delay={0}>
          <div className="mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
              <Scissors className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Qurbani Skin Pickup</h1>
              <p className="text-gray-600 mt-1">
                Request a free pickup of your qurbani animal skin — proceeds support
                Alkhidmat's relief work.
              </p>
            </div>
          </div>
        </FadeIn>

        {flagLoading ? (
          <SkeletonCard />
        ) : moduleEnabled === false ? (
          <FadeIn direction="up" delay={100}>
            <EmptyState
              title="Skin collection is currently closed"
              description="Skin collection requests open during Eid-ul-Adha season. Please check back closer to the date."
            />
          </FadeIn>
        ) : (
          <>
            {/* Form */}
            <FadeIn direction="up" delay={100}>
              <Card className="shadow-medium mb-8">
                <CardHeader>
                  <CardTitle>New Pickup Request</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contact Phone <span className="text-error">*</span>
                        </label>
                        <input
                          type="tel"
                          {...register('contactPhone')}
                          placeholder="03001234567"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        {errors.contactPhone && (
                          <p className="mt-1 text-xs text-error">
                            {errors.contactPhone.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Skins <span className="text-error">*</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          {...register('numberOfSkins')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                        <label className="block text-sm font-medium text-gray-700">
                          Pickup Address{' '}
                          {coords ? (
                            <span className="text-xs text-gray-500 font-normal">
                              (optional — location captured)
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
                              Locating…
                            </>
                          ) : (
                            <>
                              <Crosshair className="w-3 h-3 mr-1.5" />
                              Use My Location
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      {errors.address && (
                        <p className="mt-1 text-xs text-error">{errors.address.message}</p>
                      )}
                    </div>

                    {coords && (
                      <div className="border border-primary-200 bg-primary-50/50 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 text-xs">
                          <span className="text-primary-900 font-medium">
                            📍 Captured: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Pickup Date (Optional)
                      </label>
                      <input
                        type="date"
                        {...register('preferredDate')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Landmark / Additional Details (Optional)
                      </label>
                      <textarea
                        rows={2}
                        {...register('additionalDetails')}
                        placeholder="e.g. Near central mosque, ground-floor flat, ring the bell twice"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Photo of House (Optional)
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Helps our pickup team find your address quickly.
                      </p>
                      {housePhotoPreview ? (
                        <div className="relative">
                          <img
                            src={housePhotoPreview}
                            alt="House preview"
                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={clearPhoto}
                            className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-md rounded-full p-1.5 text-gray-700"
                            aria-label="Remove photo"
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="house-photo"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                        >
                          <Camera className="w-6 h-6 text-gray-400 mb-1" />
                          <span className="text-sm text-gray-600">
                            Tap to take or choose a photo
                          </span>
                          <span className="text-xs text-gray-400 mt-0.5">
                            JPG / PNG, up to 5 MB
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

                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
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
                          'Submit Request'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </FadeIn>

            {/* My pickups */}
            <FadeIn direction="up" delay={150}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                My Pickup Requests
              </h2>
              {loadingPickups ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : pickups.length === 0 ? (
                <EmptyState
                  title="No pickup requests yet"
                  description="Once you submit a request, it will appear here."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pickups.map((p) => (
                    <PickupCard key={p.id} pickup={p} />
                  ))}
                </div>
              )}
            </FadeIn>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
