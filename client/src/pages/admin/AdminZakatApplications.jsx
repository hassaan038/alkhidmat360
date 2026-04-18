import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Coins, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FadeIn from '../../components/animations/FadeIn';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { SkeletonTable } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import * as zakatService from '../../services/zakatService';
import { cn, formatCurrency, getStatusColor, formatApiError } from '../../lib/utils';
import { imageUrl } from '../../lib/imageUrl';

const STATUS_OPTIONS = ['pending', 'under_review', 'approved', 'rejected'];

export default function AdminZakatApplications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await zakatService.adminListZakatApplications();
      setItems(res.data?.applications || []);
    } catch (err) {
      toast.error('Failed to load applications', { description: formatApiError(err) });
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const handleStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await zakatService.adminUpdateZakatApplicationStatus(id, status);
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
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Zakat Applications</h1>
              <p className="text-sm text-gray-600">
                Review beneficiary applications and move them through pending → under review →
                approved or rejected.
              </p>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={100}>
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">All Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <SkeletonTable rows={5} />
              ) : items.length === 0 ? (
                <EmptyState
                  title="No zakat applications yet"
                  description="Beneficiary submissions will appear here."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNIC</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Family</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((a) => {
                        const cnicDoc = imageUrl(a.cnicDocumentUrl);
                        return (
                          <>
                            <tr key={a.id} className="hover:bg-gray-50 align-top">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">#{a.id}</td>
                              <td className="px-4 py-3 text-sm">
                                <div className="font-medium text-gray-900">{a.applicantName}</div>
                                <div className="text-xs text-gray-500">{a.applicantPhone}</div>
                                <div className="text-xs text-gray-500">{a.user?.email}</div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {a.applicantCNIC}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{a.familyMembers}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {formatCurrency(a.monthlyIncome)}
                                <div className="text-xs text-gray-500 capitalize">
                                  {a.employmentStatus.replace('-', ' ')}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <select
                                  value={a.status}
                                  onChange={(e) => handleStatus(a.id, e.target.value)}
                                  disabled={updatingId === a.id}
                                  className={cn(
                                    'text-xs font-medium px-2.5 py-1 rounded-full border bg-white capitalize cursor-pointer',
                                    getStatusColor(a.status)
                                  )}
                                >
                                  {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s} className="capitalize">
                                      {s.replace('_', ' ')}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(a.id)}
                                  className="text-gray-400 hover:text-gray-600"
                                  aria-label="Expand row"
                                >
                                  {expanded === a.id ? (
                                    <ChevronUp className="w-5 h-5" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5" />
                                  )}
                                </button>
                              </td>
                            </tr>
                            {expanded === a.id && (
                              <tr key={`${a.id}-details`}>
                                <td colSpan={7} className="px-4 py-4 bg-gray-50">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1 text-gray-800">
                                      <div>
                                        <span className="text-gray-500">Address:</span>{' '}
                                        {a.applicantAddress}
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Housing:</span>{' '}
                                        <span className="capitalize">{a.housingStatus}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Disability:</span>{' '}
                                        {a.hasDisabledMembers
                                          ? `Yes — ${a.disabilityDetails || 'no detail provided'}`
                                          : 'No'}
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Amount requested:</span>{' '}
                                        {a.amountRequested
                                          ? formatCurrency(a.amountRequested)
                                          : '—'}
                                      </div>
                                      <div className="pt-2 border-t border-gray-200">
                                        <div className="text-gray-500 mb-0.5">Reason:</div>
                                        <p className="text-gray-800">{a.reasonForApplication}</p>
                                      </div>
                                      {a.additionalNotes && (
                                        <div>
                                          <span className="text-gray-500">Notes:</span>{' '}
                                          {a.additionalNotes}
                                        </div>
                                      )}
                                      <div className="text-xs text-gray-500 pt-1">
                                        Submitted{' '}
                                        {a.createdAt
                                          ? new Date(a.createdAt).toLocaleString()
                                          : '—'}
                                      </div>
                                    </div>
                                    {cnicDoc && (
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">CNIC document</p>
                                        <a href={cnicDoc} target="_blank" rel="noopener noreferrer">
                                          <img
                                            src={cnicDoc}
                                            alt="CNIC"
                                            className="w-full max-w-sm h-48 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition"
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
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </DashboardLayout>
  );
}
