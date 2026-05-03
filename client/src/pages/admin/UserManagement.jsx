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
import { useTranslation } from 'react-i18next';

const USER_TYPE_BADGE = {
  DONOR: 'primary',
  BENEFICIARY: 'success',
  VOLUNTEER: 'warning',
  ADMIN: 'error',
};

export default function UserManagement() {
  const { t } = useTranslation();
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
    { label: t('adminUsers.totalUsers'), value: counts.total, icon: Users, tone: 'primary' },
    { label: t('roles.DONOR'), value: counts.donors, icon: Heart, tone: 'sadqa' },
    { label: t('roles.BENEFICIARY'), value: counts.beneficiaries, icon: HandHeart, tone: 'success' },
    { label: t('roles.VOLUNTEER'), value: counts.volunteers, icon: HandCoins, tone: 'volunteer' },
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
          title={t('adminUsers.title')}
          description={t('adminUsers.description')}
          meta={
            <Badge variant="primary" size="sm" icon={ShieldCheck}>
              {counts.total} {t('adminUsers.totalUsers')}
            </Badge>
          }
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
          </div>
        ) : error ? (
          <EmptyState icon={Users} tone="warning" title={t('adminUsers.noUsers')} description={error} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {userStats.map((s) => <StatCard key={s.label} {...s} />)}
            </div>

            <Card className="overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="w-full sm:max-w-xs">
                  <Input
                    leftIcon={Search}
                    placeholder={t('common.search')}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label={t('common.search')}
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
                          : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      {k === 'all' ? t('common.all') : t(`roles.${k}`)}
                    </button>
                  ))}
                </div>
              </div>

              {filtered.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title={users.length === 0 ? t('adminUsers.noUsers') : t('table.noMatchingRecords')}
                  description={users.length === 0 ? t('empty.description') : t('table.adjustFilters')}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur border-b border-gray-200 dark:border-gray-800">
                      <tr>
                        <Th>{t('common.name')}</Th>
                        <Th>{t('common.email')}</Th>
                        <Th>{t('common.phone')}</Th>
                        <Th>{t('adminUsers.role')}</Th>
                        <Th>{t('common.status')}</Th>
                        <Th>{t('adminUsers.joinDate')}</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filtered.map((user) => (
                        <tr key={user.id} className="transition-colors hover:bg-primary-50/40">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-50">{user.fullName}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{user.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{user.phoneNumber || '—'}</td>
                          <td className="px-4 py-3">
                            <Badge variant={USER_TYPE_BADGE[user.userType] || 'neutral'} size="sm">
                              {user.userType}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={user.isActive ? 'success' : 'neutral'} size="sm" dot>
                              {user.isActive ? t('adminUsers.active') : t('adminUsers.inactive')}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 tabular-nums">{formatDate(user.createdAt)}</td>
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
    <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  );
}
