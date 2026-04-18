import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Coins, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Input';
import { SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import * as zakatService from '../../services/zakatService';
import { formatCurrency, formatApiError } from '../../lib/utils';
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
      <PageContainer className="space-y-6">
        <PageHeader
          icon={Coins}
          accent="zakat"
          title="Zakat Applications"
          description="Review beneficiary applications and progress them through pending → under review → approved / rejected."
        />

          <Card className="overflow-hidden">
              {loading ? (
                <div className="p-5 space-y-2">
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </div>
              ) : items.length === 0 ? (
                <EmptyState
                  icon={Coins}
                  tone="zakat"
                  title="No zakat applications yet"
                  description="Beneficiary submissions will appear here."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur border-b border-gray-200">
                      <tr>
                        <Th>#</Th><Th>Applicant</Th><Th>CNIC</Th>
                        <Th>Family</Th><Th>Income</Th><Th>Status</Th><Th></Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((a) => {
                        const cnicDoc = imageUrl(a.cnicDocumentUrl);
                        return (
                          <>
                            <tr key={a.id} className="transition-colors hover:bg-zakat-50/40 align-top">
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
                                <Select
                                  value={a.status}
                                  onChange={(e) => handleStatus(a.id, e.target.value)}
                                  disabled={updatingId === a.id}
                                  className="h-8 text-xs capitalize w-[140px]"
                                >
                                  {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s} className="capitalize">
                                      {s.replace('_', ' ')}
                                    </option>
                                  ))}
                                </Select>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(a.id)}
                                  className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
                                  aria-label={expanded === a.id ? 'Collapse row' : 'Expand row'}
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
          </Card>
      </PageContainer>
    </DashboardLayout>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  );
}
