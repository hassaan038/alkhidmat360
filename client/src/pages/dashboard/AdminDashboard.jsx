import { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import {
  Users,
  Heart,
  FileText,
  HandHeart,
  TrendingUp,
  Clock,
  CheckCircle,
  Shield,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import * as adminService from '../../services/adminService';
import CharacterProfessional from '../../components/illustrations/CharacterProfessional';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminService.getDashboardStats();
        const data = response.data;

        setStats([
          {
            title: 'Total Donations',
            value: data.totalDonations.toString(),
            icon: Heart,
            color: 'text-error',
            bg: 'bg-error-light',
            change: `${data.pendingDonations} pending`,
          },
          {
            title: 'Applications',
            value: data.totalApplications.toString(),
            icon: FileText,
            color: 'text-warning',
            bg: 'bg-warning-light',
            change: `${data.pendingApplications} pending`,
          },
          {
            title: 'Volunteers',
            value: data.totalVolunteers.toString(),
            icon: HandHeart,
            color: 'text-success',
            bg: 'bg-success-light',
            change: `${data.pendingVolunteers} pending`,
          },
        ]);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const recentActivity = [
    {
      type: 'user',
      message: 'Admin user created',
      time: 'Today',
      icon: Users,
      color: 'text-primary-600',
    },
    {
      type: 'user',
      message: 'Test donor registered',
      time: 'Today',
      icon: Users,
      color: 'text-primary-600',
    },
    {
      type: 'user',
      message: 'Test beneficiary registered',
      time: 'Today',
      icon: Users,
      color: 'text-primary-600',
    },
  ];

  const quickActions = [
    {
      title: 'User Management',
      description: 'View and manage all users',
      path: '/dashboard/admin/users',
      icon: Users,
      color: 'text-primary-600',
      bg: 'bg-primary-50',
    },
    {
      title: 'Donations',
      description: 'Review donation submissions',
      path: '/dashboard/admin/donations',
      icon: Heart,
      color: 'text-error',
      bg: 'bg-error-light',
    },
    {
      title: 'Applications',
      description: 'Manage beneficiary applications',
      path: '/dashboard/admin/applications',
      icon: FileText,
      color: 'text-warning',
      bg: 'bg-warning-light',
    },
    {
      title: 'Volunteers',
      description: 'Manage volunteer tasks',
      path: '/dashboard/admin/volunteers',
      icon: HandHeart,
      color: 'text-success',
      bg: 'bg-success-light',
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-large relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>

          <div className="flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-8 h-8 drop-shadow-lg" />
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              </div>
              <p className="text-gray-300">
                Welcome back, {user?.fullName}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Manage and monitor all platform activities
              </p>
              <div className="mt-3 bg-error text-white px-4 py-2 rounded-lg text-sm font-semibold inline-block">
                ADMIN ACCESS
              </div>
            </div>

            {/* Character on right - professional pose */}
            <div className="hidden lg:block animate-fade-in">
              <CharacterProfessional size="default" className="opacity-90 animate-float" />
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : stats ? (
            stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="hover:shadow-glow-blue hover:-translate-y-1 transition-all duration-300 border-transparent hover:border-blue-100">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${stat.bg} p-4 rounded-xl ring-2 ring-white/50`}>
                        <Icon className={`w-7 h-7 ${stat.color}`} />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.change}</p>
                  </CardContent>
                </Card>
              );
            })
          ) : null}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.path} to={action.path}>
                    <Card className="hover:shadow-medium hover:-translate-y-2 transition-all duration-300 hover:border-primary-200 cursor-pointer h-full group">
                      <CardContent className="pt-6">
                        <div className={`${action.bg} p-4 rounded-xl inline-flex mb-4 group-hover:scale-110 transition-transform duration-300 ring-2 ring-white/50`}>
                          <Icon className={`w-7 h-7 ${action.color}`} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="flex items-start gap-3">
                        <div className="bg-gray-100 p-2 rounded-lg">
                          <Icon className={`w-4 h-4 ${activity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pending Reviews Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pending Reviews</CardTitle>
              <span className="text-sm text-gray-500">0 items</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-2">No pending reviews</p>
              <p className="text-sm text-gray-500">
                All submissions have been reviewed
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
