import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Scissors, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Input';
import { SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import * as qurbaniSkinPickupService from '../../services/qurbaniSkinPickupService';
import { formatDate, formatApiError } from '../../lib/utils';
import { imageUrl } from '../../lib/imageUrl';
import { useTranslation } from 'react-i18next';

const STATUS_OPTIONS = ['pending', 'scheduled', 'collected', 'cancelled'];

function osmLink(lat, lng) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`;
}

export default function QurbaniSkinPickups() {
  const { t } = useTranslation();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await qurbaniSkinPickupService.adminListSkinPickups();
      setPickups(res.data?.pickups || []);
    } catch (err) {
      toast.error('Failed to load pickup requests', { description: formatApiError(err) });
      setPickups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await qurbaniSkinPickupService.adminUpdateSkinPickupStatus(id, status);
      const email = pickups.find((r) => r.id === id)?.user?.email;
      toast.success(
        'Status updated',
        email ? { description: `Notification email sent to ${email}` } : undefined,
      );
      load();
    } catch (err) {
      toast.error('Update failed', { description: formatApiError(err) });
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleExpand = (id) => setExpanded(expanded === id ? null : id);

  return (
    <DashboardLayout>
      <PageContainer className="space-y-6">
        <PageHeader
          icon={Scissors}
          accent="qurbani"
          title={t('adminSkinPickups.title')}
          description="Schedule, mark collected, or cancel skin collection requests."
        />

          <Card className="overflow-hidden">
              {loading ? (
                <div className="p-5 space-y-2">
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </div>
              ) : pickups.length === 0 ? (
                <EmptyState
                  icon={Scissors}
                  tone="qurbani"
                  title="No pickup requests yet"
                  description="Requests submitted by users will appear here."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur border-b border-gray-200 dark:border-gray-800">
                      <tr>
                        <Th>#</Th><Th>User</Th><Th>Phone</Th><Th>Skins</Th>
                        <Th>Address / Map</Th><Th>Preferred</Th><Th>Status</Th><Th></Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pickups.map((p) => {
                        const lat = p.latitude != null ? Number(p.latitude) : null;
                        const lng = p.longitude != null ? Number(p.longitude) : null;
                        const hasCoords = lat != null && lng != null;
                        return (
                          <>
                            <tr key={p.id} className="transition-colors hover:bg-qurbani-50/40 align-top">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-50">#{p.id}</td>
                              <td className="px-4 py-3 text-sm">
                                <div className="font-medium text-gray-900 dark:text-gray-50">
                                  {p.user?.fullName || '—'}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{p.user?.email}</div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                {p.contactPhone}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-50">
                                {p.numberOfSkins}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs">
                                <p className="line-clamp-2">{p.address}</p>
                                {hasCoords && (
                                  <a
                                    href={osmLink(lat, lng)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary-600 hover:text-primary-700 underline mt-0.5 inline-flex items-center gap-1"
                                  >
                                    <MapPin className="w-3 h-3" />
                                    view on map
                                  </a>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                {p.preferredDate ? formatDate(p.preferredDate) : '—'}
                              </td>
                              <td className="px-4 py-3">
                                <Select
                                  value={p.status}
                                  onChange={(e) => handleStatusChange(p.id, e.target.value)}
                                  disabled={updatingId === p.id}
                                  className="h-8 text-xs capitalize w-[130px]"
                                >
                                  {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s} className="capitalize">
                                      {s}
                                    </option>
                                  ))}
                                </Select>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(p.id)}
                                  className="rounded-md p-1 text-gray-400 dark:text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
                                  aria-label={expanded === p.id ? 'Collapse row' : 'Expand row'}
                                >
                                  {expanded === p.id ? (
                                    <ChevronUp className="w-5 h-5" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5" />
                                  )}
                                </button>
                              </td>
                            </tr>
                            {expanded === p.id && (
                              <tr key={`${p.id}-details`}>
                                <td colSpan={8} className="px-4 py-4 bg-gray-50 dark:bg-gray-900">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1 text-sm text-gray-800 dark:text-gray-100">
                                      <div>
                                        <span className="text-gray-500 dark:text-gray-400">Coordinates:</span>{' '}
                                        {hasCoords
                                          ? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
                                          : 'Not provided'}
                                      </div>
                                      <div>
                                        <span className="text-gray-500 dark:text-gray-400">Notes:</span>{' '}
                                        {p.additionalDetails || '—'}
                                      </div>
                                      <div>
                                        <span className="text-gray-500 dark:text-gray-400">Submitted:</span>{' '}
                                        {p.createdAt
                                          ? new Date(p.createdAt).toLocaleString()
                                          : '—'}
                                      </div>
                                    </div>
                                    {p.housePhotoUrl && (
                                      <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">House photo</p>
                                        <a
                                          href={imageUrl(p.housePhotoUrl)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <img
                                            src={imageUrl(p.housePhotoUrl)}
                                            alt="House"
                                            className="w-full max-w-xs h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-800 hover:opacity-90 transition"
                                          />
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
          </Card>
      </PageContainer>
    </DashboardLayout>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  );
}
