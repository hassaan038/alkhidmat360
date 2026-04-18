import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  Image as ImageIcon,
  ListChecks,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import * as qurbaniModuleService from '../../services/qurbaniModuleService';
import { cn, formatCurrency, formatDate, formatApiError } from '../../lib/utils';
import { imageUrl } from '../../lib/imageUrl';

const STATUSES = ['DRAFT', 'ACTIVE', 'FULL', 'CLOSED'];
const HISSAS_PER_BULL = 7;

const statusBadgeClass = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-success-light text-success-dark border-success';
    case 'DRAFT':
      return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700';
    case 'FULL':
      return 'bg-info-light text-info-dark border-info';
    case 'CLOSED':
      return 'bg-warning-light text-warning-dark border-warning';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700';
  }
};

const listingSchema = z.object({
  weightKg: z.coerce.number().positive('Weight must be positive'),
  bullPrice: z.coerce.number().positive('Estimated bull price must be greater than 0'),
  pickupDate: z.string().min(1, 'Pickup date is required'),
  pickupLocation: z.string().min(5, 'Pickup location must be at least 5 characters'),
  description: z.string().optional().default(''),
});

function ListingForm({ mode, initial, onCancel, onSaved }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      weightKg: initial?.weightKg ?? '',
      bullPrice: initial?.pricePerHissa ? Number(initial.pricePerHissa) * HISSAS_PER_BULL : '',
      pickupDate: initial?.pickupDate ? initial.pickupDate.slice(0, 10) : '',
      pickupLocation: initial?.pickupLocation || '',
      description: initial?.description || '',
    },
  });

  const [photo, setPhoto] = useState(null);
  const bullPriceWatch = Number(watch('bullPrice')) || 0;
  const derivedPerHissa = bullPriceWatch > 0 ? bullPriceWatch / HISSAS_PER_BULL : 0;

  const onSubmit = async (data) => {
    const pricePerHissa = data.bullPrice / HISSAS_PER_BULL;
    const fd = new FormData();
    fd.append('weightKg', String(data.weightKg));
    fd.append('totalHissas', String(HISSAS_PER_BULL));
    fd.append('pricePerHissa', pricePerHissa.toFixed(2));
    fd.append('pickupDate', new Date(data.pickupDate).toISOString());
    fd.append('pickupLocation', data.pickupLocation);
    if (data.description) fd.append('description', data.description);
    if (photo) fd.append('photo', photo);

    try {
      if (mode === 'create') {
        await qurbaniModuleService.adminCreateListing(fd);
        toast.success('Listing created', { description: 'Auto-named based on listing count.' });
      } else {
        await qurbaniModuleService.adminUpdateListing(initial.id, fd);
        toast.success('Listing updated');
      }
      onSaved();
    } catch (error) {
      toast.error(mode === 'create' ? 'Create failed' : 'Update failed', {
        description: formatApiError(error),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Weight (kg) <span className="text-error">*</span>
          </label>
          <input
            type="number"
            step="0.1"
            {...register('weightKg')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.weightKg && <p className="mt-1 text-xs text-error">{errors.weightKg.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Estimated Bull Price (PKR) <span className="text-error">*</span>
          </label>
          <input
            type="number"
            {...register('bullPrice')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g. 210000"
          />
          {errors.bullPrice && (
            <p className="mt-1 text-xs text-error">{errors.bullPrice.message}</p>
          )}
          {derivedPerHissa > 0 && (
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              ≈ {formatCurrency(derivedPerHissa)} per hissa ({HISSAS_PER_BULL} hissas)
            </p>
          )}
        </div>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Pickup Date <span className="text-error">*</span>
          </label>
          <input
            type="date"
            {...register('pickupDate')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.pickupDate && (
            <p className="mt-1 text-xs text-error">{errors.pickupDate.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Pickup Location <span className="text-error">*</span>
          </label>
          <input
            {...register('pickupLocation')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {errors.pickupLocation && (
            <p className="mt-1 text-xs text-error">{errors.pickupLocation.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <textarea
          rows={3}
          {...register('description')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Photo {mode === 'edit' && <span className="text-xs text-gray-500 dark:text-gray-400">(leave empty to keep current)</span>}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-primary-600 hover:bg-primary-700 text-white">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : mode === 'create' ? (
            'Create Listing'
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
}

export default function QurbaniListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [editing, setEditing] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await qurbaniModuleService.adminListListings();
      setListings(res.data?.listings || []);
    } catch (error) {
      toast.error('Failed to load listings', { description: formatApiError(error) });
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const handleDelete = async (listing) => {
    if (!window.confirm(`Delete listing "${listing.name}"? This cannot be undone.`)) return;
    try {
      await qurbaniModuleService.adminDeleteListing(listing.id);
      toast.success('Listing deleted');
      load();
    } catch (error) {
      toast.error('Delete failed', {
        description: formatApiError(error) || 'Listings with bookings cannot be deleted.',
      });
    }
  };

  const handleStatusChange = async (listing, status) => {
    if (status === listing.status) return;
    setStatusUpdatingId(listing.id);
    try {
      await qurbaniModuleService.adminUpdateListingStatus(listing.id, status);
      toast.success('Status updated');
      load();
    } catch (error) {
      toast.error('Status update failed', { description: formatApiError(error) });
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setModalMode('create');
  };

  const openEdit = (listing) => {
    setEditing(listing);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditing(null);
  };

  return (
    <DashboardLayout>
      <PageContainer className="space-y-6">
        <PageHeader
          icon={ListChecks}
          accent="qurbani"
          title="Qurbani Listings"
          description="Manage animal listings available for hissa booking."
          actions={
            <Button leftIcon={Plus} onClick={openCreate}>
              Create listing
            </Button>
          }
        />

          <Card className="overflow-hidden">
              {loading ? (
                <div className="p-5 space-y-2">
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </div>
              ) : listings.length === 0 ? (
                <EmptyState
                  icon={ListChecks}
                  tone="qurbani"
                  title="No listings yet"
                  description="Create your first listing to start accepting hissa bookings."
                  action={{ label: 'Create Listing', onClick: openCreate }}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Photo</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Weight</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price / Hissa</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Booked</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pickup</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200">
                      {listings.map((listing) => {
                        const img = imageUrl(listing.photoUrl);
                        const total = listing.totalHissas || 7;
                        const booked = listing.hissasBooked ?? 0;
                        return (
                          <tr key={listing.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center">
                                {img ? (
                                  <img src={img} alt={listing.name} className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-50">{listing.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                              {listing.weightKg ? `${listing.weightKg} kg` : '—'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                              {formatCurrency(listing.pricePerHissa)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                              {booked} / {total}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                              {listing.pickupDate ? formatDate(listing.pickupDate) : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={listing.status}
                                onChange={(e) => handleStatusChange(listing, e.target.value)}
                                disabled={statusUpdatingId === listing.id}
                                className={cn(
                                  'px-2 py-1 rounded-md border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500',
                                  statusBadgeClass(listing.status)
                                )}
                              >
                                {STATUSES.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="inline-flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEdit(listing)}
                                  className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                                >
                                  <Edit2 className="w-3 h-3 mr-1" /> Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(listing)}
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" /> Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
          </Card>
      </PageContainer>

      {/* Create / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-large w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                {modalMode === 'create' ? 'Create Listing' : 'Edit Listing'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 dark:text-gray-400"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <ListingForm
                mode={modalMode}
                initial={editing}
                onCancel={closeModal}
                onSaved={() => {
                  closeModal();
                  load();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
