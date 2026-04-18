import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { SkeletonStatCard } from '../../components/ui/Skeleton';
import { Card } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/common/EmptyState';
import { Users, Heart, HandHeart, HandCoins, ShieldCheck, Search, UserCog } from 'lucide-react';
import { getUsers } from '../../services/adminService';
import { formatDate, cn } from '../../lib/utils';

const USER_TYPE_BADGE = {
  DONOR: 'primary',
  BENEFICIARY: 'success',
  VOLUNTEER: 'warning',
  ADMIN: 'error',
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState({ total: 0, donors: 0, beneficiaries: 0, volunteers: 0, admins: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const result = await getUsers();
        setUsers(result.data.users);
        setCounts(result.data.counts);
      } catch (err) {
        setError(err.message || 'Failed to load users.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const userStats = [
    { label: 'Total users', value: counts.total, icon: Users, tone: 'primary' },
    { label: 'Donors', value: counts.donors, icon: Heart, tone: 'sadqa' },
    { label: 'Beneficiaries', value: counts.beneficiaries, icon: HandHeart, tone: 'success' },
    { label: 'Volunteers', value: counts.volunteers, icon: HandCoins, tone: 'volunteer' },
  ];

  const filtered = useMemo(() => {
    let rows = users;
    if (filter !== 'all') rows = rows.filter((u) => u.userType === filter);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phoneNumber?.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [users, query, filter]);

  const filterChips = ['all', 'DONOR', 'BENEFICIARY', 'VOLUNTEER', 'ADMIN'];

  return (
    <DashboardLayout>
      <PageContainer className="space-y-6">
        <PageHeader
          icon={UserCog}
          accent="primary"
          title="User Management"
          description="View and manage all platform users in one place."
          meta={
            <Badge variant="primary" size="sm" icon={ShieldCheck}>
              {counts.total} users total
            </Badge>
          }
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
          </div>
        ) : error ? (
          <EmptyState icon={Users} tone="warning" title="Couldn't load users" description={error} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {userStats.map((s) => <StatCard key={s.label} {...s} />)}
            </div>

            <Card className="overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="w-full sm:max-w-xs">
                  <Input
                    leftIcon={Search}
                    placeholder="Search by name, email, or phone…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search users"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {filterChips.map((k) => (
                    <button
                      key={k}
                      onClick={() => setFilter(k)}
                      className={cn(
                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer',
                        filter === k
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      {k === 'all' ? 'All' : k.charAt(0) + k.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {filtered.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title={users.length === 0 ? 'No users yet' : 'No matching users'}
                  description={users.length === 0 ? 'New sign-ups will appear here.' : 'Try adjusting your search or filter.'}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur border-b border-gray-200">
                      <tr>
                        <Th>Name</Th>
                        <Th>Email</Th>
                        <Th>Phone</Th>
                        <Th>Role</Th>
                        <Th>Status</Th>
                        <Th>Joined</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filtered.map((user) => (
                        <tr key={user.id} className="transition-colors hover:bg-primary-50/40">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.fullName}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{user.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{user.phoneNumber || '—'}</td>
                          <td className="px-4 py-3">
                            <Badge variant={USER_TYPE_BADGE[user.userType] || 'neutral'} size="sm">
                              {user.userType}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={user.isActive ? 'success' : 'neutral'} size="sm" dot>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 tabular-nums">{formatDate(user.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}
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
