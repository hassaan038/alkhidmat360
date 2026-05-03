import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonStatCard } from '../../components/ui/Skeleton';
import {
  HandHeart, Mail, Phone, CreditCard, Calendar, CheckCircle, XCircle,
  Briefcase, Users, Search,
} from 'lucide-react';
import * as adminService from '../../services/adminService';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';

function initials(name) {
  if (!name) return 'V';
  return name.split(' ').map((n) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function VolunteersManagement() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [volunteers, setVolunteers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const response = await adminService.getVolunteers();
        setVolunteers(response.data || []);
      } catch (error) {
        console.error('Error fetching volunteers:', error);
        setVolunteers([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return volunteers.filter((v) => {
      const matchesSearch =
        !searchTerm ||
        v.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.phoneNumber.includes(searchTerm);
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && v.isActive) ||
        (filterStatus === 'inactive' && !v.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [volunteers, searchTerm, filterStatus]);

  const stats = [
    { label: t('roles.VOLUNTEER'), value: volunteers.length, icon: Users, tone: 'volunteer' },
    { label: t('adminUsers.active'), value: volunteers.filter((v) => v.isActive).length, icon: CheckCircle, tone: 'success' },
    { label: t('adminUsers.inactive'), value: volunteers.filter((v) => !v.isActive).length, icon: XCircle, tone: 'neutral' },
    { label: t('volunteer.taskCategory'), value: volunteers.filter((v) => v.volunteerTasks?.length).length, icon: Briefcase, tone: 'sadqa' },
  ];

  const filterChips = [
    { id: 'all', label: t('common.all') },
    { id: 'active', label: t('adminUsers.active') },
    { id: 'inactive', label: t('adminUsers.inactive') },
  ];

  return (
    <DashboardLayout>
      <PageContainer className="space-y-6">
        <PageHeader
          icon={HandHeart}
          accent="volunteer"
          title={t('adminVolunteers.title')}
          description={t('adminVolunteers.description')}
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => <StatCard key={s.label} {...s} />)}
          </div>
        )}

        <Card className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-xs">
              <Input
                leftIcon={Search}
                placeholder={t('common.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label={t('common.search')}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {filterChips.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFilterStatus(c.id)}
                  className={cn(
                    'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer',
                    filterStatus === c.id
                      ? 'bg-volunteer-600 text-white shadow-sm'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={HandHeart}
              tone="volunteer"
              title={searchTerm || filterStatus !== 'all' ? t('table.noMatchingRecords') : t('table.noData')}
              description={
                searchTerm || filterStatus !== 'all'
                  ? t('table.adjustFilters')
                  : t('empty.description')
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <Th>{t('roles.VOLUNTEER')}</Th>
                    <Th>{t('common.phone')}</Th>
                    <Th>{t('settings.cnic')}</Th>
                    <Th>{t('volunteer.taskCategory')}</Th>
                    <Th>{t('common.status')}</Th>
                    <Th>{t('adminUsers.joinDate')}</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((v) => (
                    <tr key={v.id} className="transition-colors hover:bg-volunteer-50/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-volunteer-100 dark:bg-volunteer-500/15 text-volunteer-700 dark:text-volunteer-200 text-xs font-semibold">
                            {initials(v.fullName)}
                          </span>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-50 truncate">{v.fullName}</div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Mail className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{v.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                          {v.phoneNumber}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {v.cnic ? (
                          <div className="flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                            {v.cnic}
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 italic">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="sadqa" size="sm" icon={Briefcase}>
                          {v.volunteerTasks?.length || 0}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={v.isActive ? 'success' : 'neutral'} size="sm" dot>
                          {v.isActive ? t('adminUsers.active') : t('adminUsers.inactive')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                          {formatDate(v.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
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
