import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useAuthStore from '../../store/authStore';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import StatCard from '../../components/ui/StatCard';
import SectionHeading from '../../components/ui/SectionHeading';
import IconTile from '../../components/ui/IconTile';
import Badge from '../../components/ui/Badge';
import { SkeletonStatCard, SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { Card, CardContent } from '../../components/ui/Card';
import {
  Heart,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Sparkles,
  Package,
  Baby,
  DollarSign,
  Apple,
  HandHeart,
  BarChart3,
  Coins,
  Scissors,
  Drumstick,
  BookOpen,
  LifeBuoy,
  HandCoins,
  Activity,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import * as userService from '../../services/userService';
import { cn } from '../../lib/utils';


export default function UserDashboard() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState(null);
  const [loading, setLoading] = useState(true);

  const roleGreeting = {
    DONOR: { sub: t('dashboard.greet.donorSub') },
    BENEFICIARY: { sub: t('dashboard.greet.beneficiarySub') },
    VOLUNTEER: { sub: t('dashboard.greet.volunteerSub') },
  };

  function getActions(userType) {
    if (userType === 'DONOR') {
      return [
        { title: t('sidebar.qurbaniDonation'), description: t('dashboard.actions.qurbaniDesc'), path: '/dashboard/user/qurbani', icon: Heart, tone: 'qurbani' },
        { title: t('sidebar.rationDonation'), description: t('dashboard.actions.rationDesc'), path: '/dashboard/user/ration', icon: Package, tone: 'ration' },
        { title: t('sidebar.orphanSponsorship'), description: t('dashboard.actions.orphanSponsorshipDesc'), path: '/dashboard/user/orphan-sponsorship', icon: Baby, tone: 'orphan' },
        { title: t('sidebar.payZakat'), description: t('dashboard.actions.zakatDesc'), path: '/dashboard/user/zakat-pay', icon: Coins, tone: 'zakat' },
        { title: t('sidebar.sadqa'), description: t('dashboard.actions.sadqaDesc'), path: '/dashboard/user/sadqa', icon: Heart, tone: 'sadqa' },
        { title: t('sidebar.disasterRelief'), description: t('dashboard.actions.disasterDesc'), path: '/dashboard/user/disaster-relief', icon: LifeBuoy, tone: 'disaster' },
      ];
    }
    if (userType === 'BENEFICIARY') {
      return [
        { title: t('sidebar.loanApplication'), description: t('dashboard.actions.loanDesc'), path: '/dashboard/user/loan', icon: DollarSign, tone: 'loan' },
        { title: t('sidebar.ramadanRation'), description: t('dashboard.actions.ramadanDesc'), path: '/dashboard/user/ramadan-ration', icon: Apple, tone: 'ration' },
        { title: t('sidebar.orphanRegistration'), description: t('dashboard.actions.orphanRegDesc'), path: '/dashboard/user/orphan', icon: Baby, tone: 'orphan' },
        { title: t('sidebar.applyForZakat'), description: t('dashboard.actions.zakatApplyDesc'), path: '/dashboard/user/zakat-apply', icon: Coins, tone: 'zakat' },
      ];
    }
    if (userType === 'VOLUNTEER') {
      return [
        { title: t('sidebar.registerForTasks'), description: t('dashboard.actions.volunteerDesc'), path: '/dashboard/user/volunteer-task', icon: HandHeart, tone: 'volunteer' },
        { title: t('dashboard.actions.myActivity'), description: t('dashboard.actions.myActivityDesc'), path: '/dashboard/user', icon: BarChart3, tone: 'primary' },
      ];
    }
    return [];
  }

  const qurbaniShortcuts = [
    { title: t('sidebar.qurbaniBooking'), path: '/dashboard/user/qurbani-module', icon: Drumstick, tone: 'qurbani' },
    { title: t('dashboard.actions.myHissas'), path: '/dashboard/user/qurbani-bookings', icon: BookOpen, tone: 'qurbani' },
    { title: t('sidebar.skinPickup'), path: '/dashboard/user/qurbani-skin-pickup', icon: Scissors, tone: 'qurbani' },
    { title: t('sidebar.fitrana'), path: '/dashboard/user/fitrana', icon: HandCoins, tone: 'zakat' },
  ];

  useEffect(() => {
    (async () => {
      try {
        const [sRes, aRes] = await Promise.all([
          userService.getDashboardStats(),
          userService.getRecentActivities(6).catch(() => ({ data: [] })),
        ]);
        setStats(sRes.data);
        setActivities(Array.isArray(aRes.data) ? aRes.data : aRes.data?.activities || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const greet = roleGreeting[user?.userType] || roleGreeting.DONOR;
  const actions = getActions(user?.userType);

  const statCards = stats
    ? [
        { label: t('dashboard.stats.totalSubmissions'), value: stats.totalSubmissions, icon: Activity, tone: 'primary', hint: t('dashboard.stats.allTime') },
        { label: t('dashboard.stats.pending'), value: stats.pending, icon: Clock, tone: 'warning', hint: t('dashboard.stats.awaitingReview') },
        { label: t('dashboard.stats.approved'), value: stats.approved, icon: CheckCircle, tone: 'success', hint: t('dashboard.stats.confirmed') },
        { label: t('dashboard.stats.rejected'), value: stats.rejected, icon: XCircle, tone: 'error', hint: t('dashboard.stats.notApproved') },
      ]
    : [];

  return (
    <DashboardLayout>
      <PageContainer className="space-y-6">
        {/* Hero greeting */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-6 sm:p-8 text-white shadow-large">
          <div className="absolute inset-0 opacity-50 bg-gradient-mesh pointer-events-none" aria-hidden />
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3 py-1 ring-1 ring-white/25">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{t('dashboard.welcome')}</span>
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">
                {t('dashboard.welcome')}, {user?.fullName?.split(' ')[0] || ''} 👋
              </h1>
              <p className="mt-1 text-primary-100 text-sm sm:text-base leading-relaxed max-w-xl">
                {greet.sub}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary" size="lg" className="bg-white/15 text-white ring-white/30 backdrop-blur">
                {user?.userType}
              </Badge>
            </div>
          </div>
        </section>

        {/* Stat cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
            : statCards.map((s) => <StatCard key={s.label} {...s} />)}
        </section>

        {/* Qurbani quick row — DONOR/BENEFICIARY/VOLUNTEER */}
        {user?.userType !== 'ADMIN' && (
          <section>
            <SectionHeading
              title={t('dashboard.qurbaniTitle')}
              description={t('dashboard.qurbaniDesc')}
              icon={Drumstick}
              size="sm"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {qurbaniShortcuts.map((s) => (
                <Link key={s.path} to={s.path} className="block">
                  <Card className="group h-full cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
                    <CardContent className="flex items-center gap-3 py-4">
                      <IconTile icon={s.icon} tone={s.tone} size="md" />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-100 group-hover:text-gray-900 truncate">
                        {s.title}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Quick actions */}
        <section>
          <SectionHeading
            title={user?.userType === 'DONOR' ? t('dashboard.makeDonation') : user?.userType === 'BENEFICIARY' ? t('dashboard.applySupport') : t('dashboard.getStarted')}
            description={t('dashboard.quickActionsDesc')}
            size="md"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {actions.map((action) => (
              <Link key={action.path} to={action.path} className="block">
                <Card className="group h-full cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover hover:border-primary-200">
                  <CardContent className="pt-5 pb-5">
                    <IconTile icon={action.icon} tone={action.tone} size="lg" className="mb-4" />
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">{action.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary-600 transition-all group-hover:gap-2">
                      <span>{t('dashboard.getStarted')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent activity */}
        <section>
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <IconTile icon={Activity} tone="primary" size="sm" />
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">{t('dashboard.recentActivity')}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.recentActivityDesc')}</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="space-y-2">
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </div>
              ) : !activities || activities.length === 0 ? (
                <EmptyState
                  icon={Activity}
                  title={t('dashboard.noActivityTitle')}
                  description={t('dashboard.noActivityDesc')}
                />
              ) : (
                <ul className="divide-y divide-gray-100">
                  {activities.map((a, i) => (
                    <ActivityRow key={i} activity={a} />
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </section>
      </PageContainer>
    </DashboardLayout>
  );
}

function ActivityRow({ activity }) {
  const status = activity.status || 'pending';
  const typeLabel = activity.type || activity.category || 'Submission';
  return (
    <li className="flex items-center gap-4 py-3">
      <IconTile
        icon={activityIcon(activity.type)}
        tone={activityTone(activity.type)}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
          {activity.title || typeLabel}
        </p>
        {activity.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{activity.description}</p>
        )}
        {activity.createdAt && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
            {new Date(activity.createdAt).toLocaleString()}
          </p>
        )}
      </div>
      <Badge
        variant={statusToVariant(status)}
        size="sm"
        className={cn('capitalize')}
      >
        {String(status).replace(/_/g, ' ')}
      </Badge>
    </li>
  );
}

function activityIcon(type) {
  const map = {
    qurbani: Heart,
    ration: Package,
    skin: Scissors,
    sponsorship: Baby,
    loan: DollarSign,
    ramadan: Apple,
    orphan: Baby,
    volunteer: HandHeart,
    zakat: Coins,
    sadqa: Heart,
    disaster: LifeBuoy,
    fitrana: HandCoins,
  };
  return map[type] || Activity;
}

function activityTone(type) {
  const map = {
    qurbani: 'qurbani',
    ration: 'ration',
    skin: 'qurbani',
    sponsorship: 'orphan',
    loan: 'loan',
    ramadan: 'ration',
    orphan: 'orphan',
    volunteer: 'volunteer',
    zakat: 'zakat',
    sadqa: 'sadqa',
    disaster: 'disaster',
    fitrana: 'zakat',
  };
  return map[type] || 'primary';
}

function statusToVariant(status) {
  return (
    {
      pending: 'warning',
      approved: 'success',
      completed: 'success',
      confirmed: 'info',
      rejected: 'error',
      under_review: 'warning',
    }[status] || 'neutral'
  );
}
