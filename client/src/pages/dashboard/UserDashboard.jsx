import { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import {
  Heart,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Sparkles,
  Loader2,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import * as userService from '../../services/userService';
import CharacterLaptop from '../../components/illustrations/CharacterLaptop';

export default function UserDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await userService.getDashboardStats();
        const data = response.data;

        setStats([
          {
            title: 'Total Submissions',
            value: data.totalSubmissions.toString(),
            icon: Heart,
            color: 'text-primary-600',
            bg: 'bg-primary-50',
            description: 'All submissions',
          },
          {
            title: 'Pending',
            value: data.pending.toString(),
            icon: Clock,
            color: 'text-warning',
            bg: 'bg-warning-light',
            description: 'Under review',
          },
          {
            title: 'Approved',
            value: data.approved.toString(),
            icon: CheckCircle,
            color: 'text-success',
            bg: 'bg-success-light',
            description: 'Completed',
          },
          {
            title: 'Rejected',
            value: data.rejected.toString(),
            icon: XCircle,
            color: 'text-red-600',
            bg: 'bg-red-50',
            description: 'Not approved',
          },
        ]);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Get user-specific actions based on type
  const getQuickActions = () => {
    switch (user?.userType) {
      case 'DONOR':
        return [
          {
            title: 'Qurbani Donation',
            description: 'Donate animals for Qurbani',
            path: '/dashboard/user/qurbani',
            icon: '🐑',
          },
          {
            title: 'Ration Donation',
            description: 'Donate ration packages',
            path: '/dashboard/user/ration',
            icon: '📦',
          },
          {
            title: 'Orphan Sponsorship',
            description: 'Sponsor an orphan child',
            path: '/dashboard/user/orphan-sponsorship',
            icon: '👶',
          },
        ];
      case 'BENEFICIARY':
        return [
          {
            title: 'Loan Application',
            description: 'Apply for interest-free loan',
            path: '/dashboard/user/loan',
            icon: '💰',
          },
          {
            title: 'Ramadan Ration',
            description: 'Apply for Ramadan ration',
            path: '/dashboard/user/ramadan-ration',
            icon: '🍎',
          },
          {
            title: 'Orphan Registration',
            description: 'Register as orphan guardian',
            path: '/dashboard/user/orphan',
            icon: '👨‍👩‍👧',
          },
        ];
      case 'VOLUNTEER':
        return [
          {
            title: 'Browse Tasks',
            description: 'Find volunteering opportunities',
            path: '/dashboard/user/volunteer',
            icon: '🤝',
          },
          {
            title: 'My Activities',
            description: 'Track your contributions',
            path: '/dashboard/user/activities',
            icon: '📊',
          },
        ];
      default:
        return [];
    }
  };

  const quickActions = getQuickActions();

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white shadow-large relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-6">
              {/* Character on left */}
              <div className="hidden lg:block animate-slide-in-left">
                <CharacterLaptop size="default" className="animate-float" />
              </div>

              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  Welcome back, {user?.fullName}!
                </h1>
                <p className="text-primary-100">
                  {user?.userType === 'DONOR' && 'Thank you for your generosity and support'}
                  {user?.userType === 'BENEFICIARY' && 'We are here to support you'}
                  {user?.userType === 'VOLUNTEER' && 'Thank you for your service to the community'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-4 flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : stats ? (
            stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="hover:shadow-glow-blue hover:-translate-y-1 transition-all duration-300 border-transparent hover:border-blue-100">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                      </div>
                      <div className={`${stat.bg} p-4 rounded-xl ring-2 ring-white/50`}>
                        <Icon className={`w-7 h-7 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : null}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link key={action.path} to={action.path}>
                <Card className="hover:shadow-medium hover:-translate-y-2 transition-all duration-300 hover:border-primary-200 cursor-pointer h-full group">
                  <CardContent className="pt-6">
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{action.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                    <div className="flex items-center text-primary-600 text-sm font-medium group-hover:gap-3 transition-all duration-300">
                      <span>Get started</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">No activity yet</p>
              <p className="text-sm text-gray-500">
                Your submissions and activities will appear here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
