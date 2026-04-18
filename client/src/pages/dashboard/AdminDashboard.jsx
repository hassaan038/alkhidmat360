import { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import StatCard from '../../components/ui/StatCard';
import SectionHeading from '../../components/ui/SectionHeading';
import IconTile from '../../components/ui/IconTile';
import Badge from '../../components/ui/Badge';
import { SkeletonStatCard, SkeletonRow } from '../../components/ui/Skeleton';
import { Card, CardContent } from '../../components/ui/Card';
import {
  Users,
  Heart,
  FileText,
  HandHeart,
  Clock,
  Shield,
  BarChart2,
  ListChecks,
  ArrowRight,
  ShieldCheck,
  Coins,
  LifeBuoy,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import * as adminService from '../../services/adminService';
import DonationsBarChart from '../../components/charts/DonationsBarChart';
import ApplicationsPieChart from '../../components/charts/ApplicationsPieChart';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [rawStats, setRawStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await adminService.getDashboardStats();
        setRawStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const donationChartData = rawStats
    ? [
        { name: 'Qurbani', count: rawStats.donationsByType?.qurbani ?? 0 },
        { name: 'Ration', count: rawStats.donationsByType?.ration ?? 0 },
        { name: 'Skin', count: rawStats.donationsByType?.skin ?? 0 },
        { name: 'Sponsorship', count: rawStats.donationsByType?.sponsorship ?? 0 },
      ]
    : [];

  const applicationChartData = rawStats
    ? [
        { name: 'Loan', count: rawStats.applicationsByType?.loan ?? 0 },
        { name: 'Ramadan Ration', count: rawStats.applicationsByType?.ramadan ?? 0 },
        { name: 'Orphan', count: rawStats.applicationsByType?.orphan ?? 0 },
      ]
    : [];

  const totalSubmissions = rawStats
    ? (rawStats.totalDonations ?? 0) + (rawStats.totalApplications ?? 0) + (rawStats.totalVolunteers ?? 0)
    : 0;
  const pendingReview = rawStats
    ? (rawStats.pendingDonations ?? 0) + (rawStats.pendingApplications ?? 0) + (rawStats.pendingVolunteers ?? 0)
    : 0;

  const kpis = rawStats
    ? [
        { label: 'Total submissions', value: totalSubmissions, icon: BarChart2, tone: 'primary', hint: 'All categories' },
        { label: 'Donations', value: rawStats.totalDonations ?? 0, icon: Heart, tone: 'sadqa', hint: `${rawStats.pendingDonations ?? 0} pending` },
        { label: 'Applications', value: rawStats.totalApplications ?? 0, icon: FileText, tone: 'loan', hint: `${rawStats.pendingApplications ?? 0} pending` },
        { label: 'Volunteers', value: rawStats.totalVolunteers ?? 0, icon: HandHeart, tone: 'volunteer', hint: `${rawStats.pendingVolunteers ?? 0} pending` },
      ]
    : [];

  const quickActions = [
    { title: 'User Management', description: 'View & manage all users', path: '/dashboard/admin/users', icon: Users, tone: 'primary' },
    { title: 'Donations', description: 'Review donation submissions', path: '/dashboard/admin/donations', icon: Heart, tone: 'sadqa' },
    { title: 'Applications', description: 'Review beneficiary applications', path: '/dashboard/admin/applications', icon: FileText, tone: 'loan' },
    { title: 'Volunteers', description: 'Manage volunteer tasks', path: '/dashboard/admin/volunteers', icon: HandHeart, tone: 'volunteer' },
    { title: 'Zakat Payments', description: 'Confirm donor zakat', path: '/dashboard/admin/zakat-payments', icon: Coins, tone: 'zakat' },
    { title: 'Disaster Relief', description: 'Confirm campaign donations', path: '/dashboard/admin/disaster-relief', icon: LifeBuoy, tone: 'disaster' },
  ];

  const pendingItems = rawStats
    ? [
        rawStats.pendingDonations > 0 && {
          label: `${rawStats.pendingDonations} donation${rawStats.pendingDonations !== 1 ? 's' : ''}`,
          sub: 'Awaiting review',
          href: '/dashboard/admin/donations',
          icon: Heart,
          tone: 'sadqa',
        },
        rawStats.pendingApplications > 0 && {
          label: `${rawStats.pendingApplications} application${rawStats.pendingApplications !== 1 ? 's' : ''}`,
          sub: 'Awaiting review',
          href: '/dashboard/admin/applications',
          icon: FileText,
          tone: 'loan',
        },
        rawStats.pendingVolunteers > 0 && {
          label: `${rawStats.pendingVolunteers} volunteer task${rawStats.pendingVolunteers !== 1 ? 's' : ''}`,
          sub: 'Awaiting match',
          href: '/dashboard/admin/volunteers',
          icon: HandHeart,
          tone: 'volunteer',
        },
      ].filter(Boolean)
    : [];

  return (
    <DashboardLayout>
      <PageContainer className="space-y-6">
        {/* Admin hero */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-black p-6 sm:p-8 text-white shadow-large">
          <div className="absolute inset-0 opacity-50 bg-gradient-mesh pointer-events-none" aria-hidden />
          <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" aria-hidden />
          <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" aria-hidden />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-3 py-1 ring-1 ring-white/20">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="text-xs font-medium tracking-wide">ADMIN ACCESS</span>
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Operations overview
              </h1>
              <p className="mt-1 text-gray-300 text-sm leading-relaxed max-w-xl">
                Welcome back, {user?.fullName}. Here's what's happening across the platform.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="warning" size="lg" className="bg-warning-light/90 text-warning-dark">
                {pendingReview} pending
              </Badge>
            </div>
          </div>
        </section>

        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
            : kpis.map((k) => <StatCard key={k.label} {...k} />)}
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <IconTile icon={BarChart2} tone="primary" size="sm" />
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">Donations overview</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Submissions by donation type</p>
              </div>
            </div>
            <CardContent className="pt-5">
              {loading ? (
                <div className="animate-pulse space-y-3 py-2">
                  <div className="flex items-end gap-3 h-[200px]">
                    {[60, 90, 45, 75].map((h, i) => (
                      <div key={i} className="flex-1 bg-gray-200 rounded-t-md" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              ) : (
                <DonationsBarChart data={donationChartData} />
              )}
            </CardContent>
          </Card>

          <Card>
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <IconTile icon={ListChecks} tone="loan" size="sm" />
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">Applications overview</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Breakdown by request type</p>
              </div>
            </div>
            <CardContent className="pt-5">
              {loading ? (
                <div className="animate-pulse flex items-center gap-6 py-2">
                  <div className="w-[140px] h-[140px] bg-gray-200 rounded-full mx-auto" />
                  <div className="flex-1 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-200" />
                        <div className="flex-1 h-3 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <ApplicationsPieChart data={applicationChartData} />
              )}
            </CardContent>
          </Card>
        </section>

        {/* Quick actions + pending */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SectionHeading title="Quick actions" description="Jump into the most common admin tasks" size="md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <Link key={action.path} to={action.path} className="block">
                  <Card className="group h-full cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover hover:border-primary-200">
                    <CardContent className="pt-5 pb-5">
                      <IconTile icon={action.icon} tone={action.tone} size="lg" className="mb-4" />
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">{action.title}</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
                      <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary-600 transition-all group-hover:gap-2">
                        <span>Open</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <Card className="h-full overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconTile icon={Clock} tone="warning" size="sm" />
                  <div>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">Pending reviews</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Require your action</p>
                  </div>
                </div>
                <span className="text-xs font-semibold tabular-nums text-warning-dark">
                  {loading ? '…' : pendingReview}
                </span>
              </div>
              <div className="p-4">
                {loading ? (
                  <div className="space-y-2">
                    <SkeletonRow />
                    <SkeletonRow />
                  </div>
                ) : pendingItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-8">
                    <IconTile icon={ShieldCheck} tone="success" size="lg" className="mb-3" />
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50">All clear!</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[240px]">
                      No items awaiting review. New submissions will show up here.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {pendingItems.map((item) => (
                      <li key={item.href}>
                        <Link
                          to={item.href}
                          className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-gray-50 cursor-pointer"
                        >
                          <IconTile icon={item.icon} tone={item.tone} size="md" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">{item.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.sub}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          </div>
        </section>
      </PageContainer>
    </DashboardLayout>
  );
}
