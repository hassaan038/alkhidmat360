import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Scissors, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FadeIn from '../../components/animations/FadeIn';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { SkeletonTable } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import * as qurbaniSkinPickupService from '../../services/qurbaniSkinPickupService';
import { cn, formatDate, formatApiError } from '../../lib/utils';

const STATUS_OPTIONS = ['pending', 'scheduled', 'collected', 'cancelled'];

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

function osmLink(lat, lng) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`;
}

export default function QurbaniSkinPickups() {
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
      toast.success('Status updated');
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
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <FadeIn direction="down" delay={0}>
          <div className="mb-8 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg flex items-center justify-center">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Skin Pickup Requests</h1>
              <p className="text-sm text-gray-600">
                Schedule, mark collected, or cancel skin collection requests.
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={100}>
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">All Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <SkeletonTable rows={5} />
              ) : pickups.length === 0 ? (
                <EmptyState
                  title="No pickup requests yet"
                  description="Requests submitted by users will appear here."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skins</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address / Map</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preferred</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pickups.map((p) => {
                        const lat = p.latitude != null ? Number(p.latitude) : null;
                        const lng = p.longitude != null ? Number(p.longitude) : null;
                        const hasCoords = lat != null && lng != null;
                        return (
                          <>
                            <tr key={p.id} className="hover:bg-gray-50 align-top">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">#{p.id}</td>
                              <td className="px-4 py-3 text-sm">
                                <div className="font-medium text-gray-900">
                                  {p.user?.fullName || '—'}
                                </div>
                                <div className="text-xs text-gray-500">{p.user?.email}</div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {p.contactPhone}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {p.numberOfSkins}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                                <p className="line-clamp-2">{p.address}</p>
                                {hasCoords && (
                                  <a
                                    href={osmLink(lat, lng)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary-600 hover:text-primary-700 underline mt-0.5 inline-block"
                                  >
                                    📍 view on map
                                  </a>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {p.preferredDate ? formatDate(p.preferredDate) : '—'}
                              </td>
                              <td className="px-4 py-3">
                                <select
                                  value={p.status}
                                  onChange={(e) => handleStatusChange(p.id, e.target.value)}
                                  disabled={updatingId === p.id}
                                  className={cn(
                                    'text-xs font-medium px-2.5 py-1 rounded-full border bg-white capitalize cursor-pointer',
                                    STATUS_BADGE_CLASS(p.status)
                                  )}
                                >
                                  {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s} className="capitalize">
                                      {s}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(p.id)}
                                  className="text-gray-400 hover:text-gray-600"
                                  aria-label="Expand row"
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
                                <td colSpan={8} className="px-4 py-4 bg-gray-50">
                                  <div className="space-y-1 text-sm text-gray-800">
                                    <div>
                                      <span className="text-gray-500">Coordinates:</span>{' '}
                                      {hasCoords
                                        ? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
                                        : 'Not provided'}
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Notes:</span>{' '}
                                      {p.additionalDetails || '—'}
                                    </div>
                                    <div>
                                      <span className="text-gray-500">Submitted:</span>{' '}
                                      {p.createdAt
                                        ? new Date(p.createdAt).toLocaleString()
                                        : '—'}
                                    </div>
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
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </DashboardLayout>
  );
}
