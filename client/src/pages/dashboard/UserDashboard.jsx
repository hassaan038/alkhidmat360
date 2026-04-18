import { useEffect, useState } from 'react';
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

const roleGreeting = {
  DONOR: { title: 'Thank you for your generosity', sub: 'Your contributions are making a real difference.' },
  BENEFICIARY: { title: 'We are here to support you', sub: 'Submit an application and our team will reach out.' },
  VOLUNTEER: { title: 'Thank you for your service', sub: 'Every hour you volunteer creates lasting impact.' },
};

function getActions(userType) {
  if (userType === 'DONOR') {
    return [
      { title: 'Qurbani Donation', description: 'Donate animals for Qurbani', path: '/dashboard/user/qurbani', icon: Heart, tone: 'qurbani' },
      { title: 'Ration Donation', description: 'Donate a ration package', path: '/dashboard/user/ration', icon: Package, tone: 'ration' },
      { title: 'Orphan Sponsorship', description: 'Sponsor an orphan child', path: '/dashboard/user/orphan-sponsorship', icon: Baby, tone: 'orphan' },
      { title: 'Pay Zakat', description: 'Calculate & pay zakat', path: '/dashboard/user/zakat-pay', icon: Coins, tone: 'zakat' },
      { title: 'Sadqa / Donation', description: 'Free-form donation', path: '/dashboard/user/sadqa', icon: Heart, tone: 'sadqa' },
      { title: 'Disaster Relief', description: 'Floods, earthquake & shelter', path: '/dashboard/user/disaster-relief', icon: LifeBuoy, tone: 'disaster' },
    ];
  }
  if (userType === 'BENEFICIARY') {
    return [
      { title: 'Loan Application', description: 'Apply for interest-free loan', path: '/dashboard/user/loan', icon: DollarSign, tone: 'loan' },
      { title: 'Ramadan Ration', description: 'Apply for Ramadan ration', path: '/dashboard/user/ramadan-ration', icon: Apple, tone: 'ration' },
      { title: 'Orphan Registration', description: 'Register as a guardian', path: '/dashboard/user/orphan', icon: Baby, tone: 'orphan' },
      { title: 'Apply for Zakat', description: 'Request zakat assistance', path: '/dashboard/user/zakat-apply', icon: Coins, tone: 'zakat' },
    ];
  }
  if (userType === 'VOLUNTEER') {
    return [
      { title: 'Register for Tasks', description: 'Sign up for volunteering', path: '/dashboard/user/volunteer-task', icon: HandHeart, tone: 'volunteer' },
      { title: 'My Activity', description: 'Track contributions', path: '/dashboard/user', icon: BarChart3, tone: 'primary' },
    ];
  }
  return [];
}

function qurbaniShortcuts() {
  return [
    { title: 'Qurbani Booking', path: '/dashboard/user/qurbani-module', icon: Drumstick, tone: 'qurbani' },
    { title: 'My Hissas', path: '/dashboard/user/qurbani-bookings', icon: BookOpen, tone: 'qurbani' },
    { title: 'Skin Pickup', path: '/dashboard/user/qurbani-skin-pickup', icon: Scissors, tone: 'qurbani' },
    { title: 'Fitrana', path: '/dashboard/user/fitrana', icon: HandCoins, tone: 'zakat' },
  ];
}

export default function UserDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState(null);
  const [loading, setLoading] = useState(true);

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
        { label: 'Total submissions', value: stats.totalSubmissions, icon: Activity, tone: 'primary', hint: 'All time' },
        { label: 'Pending', value: stats.pending, icon: Clock, tone: 'warning', hint: 'Awaiting review' },
        { label: 'Approved', value: stats.approved, icon: CheckCircle, tone: 'success', hint: 'Confirmed' },
        { label: 'Rejected', value: stats.rejected, icon: XCircle, tone: 'error', hint: 'Not approved' },
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
                <span className="text-xs font-medium">Welcome back</span>
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">
                Hello, {user?.fullName?.split(' ')[0] || 'friend'} 👋
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
              title="Qurbani & Fitrana"
              description="Seasonal religious actions — active when enabled by admin"
              icon={Drumstick}
              size="sm"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {qurbaniShortcuts().map((s) => (
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
            title={user?.userType === 'DONOR' ? 'Make a donation' : user?.userType === 'BENEFICIARY' ? 'Apply for support' : 'Get started'}
            description="Jump directly into the most-used flows"
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
                      <span>Get started</span>
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
                  <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">Recent activity</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Your latest submissions and updates</p>
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
                  title="No activity yet"
                  description="Your submissions will show up here once you start interacting with the platform."
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
