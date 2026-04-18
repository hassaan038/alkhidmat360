import { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import {
  Users,
  Heart,
  FileText,
  HandHeart,
  Clock,
  Shield,
  Loader2,
  BarChart2,
  ListChecks,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import * as adminService from '../../services/adminService';
import CharacterProfessional from '../../components/illustrations/CharacterProfessional';
import DonationsBarChart from '../../components/charts/DonationsBarChart';
import ApplicationsPieChart from '../../components/charts/ApplicationsPieChart';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [rawStats, setRawStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminService.getDashboardStats();
        setRawStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Derived stat cards from raw API data
  const statCards = rawStats
    ? [
        {
          title: 'Total Donations',
          value: rawStats.totalDonations,
          icon: Heart,
          color: 'text-error',
          bg: 'bg-error-light',
          change: `${rawStats.pendingDonations} pending`,
        },
        {
          title: 'Applications',
          value: rawStats.totalApplications,
          icon: FileText,
          color: 'text-warning',
          bg: 'bg-warning-light',
          change: `${rawStats.pendingApplications} pending`,
        },
        {
          title: 'Volunteers',
          value: rawStats.totalVolunteers,
          icon: HandHeart,
          color: 'text-success',
          bg: 'bg-success-light',
          change: `${rawStats.pendingVolunteers} pending`,
        },
      ]
    : [];

  // Chart data built from API breakdown fields
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

  // Quick summary pills derived values
  const totalSubmissions = rawStats
    ? (rawStats.totalDonations ?? 0) + (rawStats.totalApplications ?? 0) + (rawStats.totalVolunteers ?? 0)
    : 0;
  const pendingReview = rawStats
    ? (rawStats.pendingDonations ?? 0) + (rawStats.pendingApplications ?? 0) + (rawStats.pendingVolunteers ?? 0)
    : 0;

  const summaryPills = [
    {
      label: 'Total Submissions',
      value: totalSubmissions,
      border: 'border-l-blue-500',
      valueColor: 'text-blue-600',
    },
    {
      label: 'Pending Review',
      value: pendingReview,
      border: 'border-l-amber-500',
      valueColor: 'text-amber-600',
    },
    {
      label: 'Donations',
      value: rawStats?.totalDonations ?? 0,
      border: 'border-l-rose-500',
      valueColor: 'text-rose-600',
    },
    {
      label: 'Volunteers',
      value: rawStats?.totalVolunteers ?? 0,
      border: 'border-l-emerald-500',
      valueColor: 'text-emerald-600',
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
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

          <div className="flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-8 h-8 drop-shadow-lg" />
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              </div>
              <p className="text-gray-300">Welcome back, {user?.fullName}</p>
              <p className="text-gray-400 text-sm mt-1">
                Manage and monitor all platform activities
              </p>
              <div className="mt-3 bg-error text-white px-4 py-2 rounded-lg text-sm font-semibold inline-block">
                ADMIN ACCESS
              </div>
            </div>

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
          ) : (
            statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.title}
                  className="hover:shadow-glow-blue hover:-translate-y-1 transition-all duration-300 border-transparent hover:border-blue-100"
                >
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
          )}
        </div>

        {/* Quick Summary Pills */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {summaryPills.map((pill) => (
            <div
              key={pill.label}
              className={`bg-white border border-gray-200 border-l-4 ${pill.border} rounded-lg px-4 py-3 shadow-sm`}
            >
              {loading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-5 bg-gray-200 rounded w-1/2" />
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-500 font-medium mb-1">{pill.label}</p>
                  <p className={`text-2xl font-bold ${pill.valueColor}`}>{pill.value}</p>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart A — Donations Overview */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-blue-500" />
                <CardTitle className="text-base font-semibold">Donations Overview</CardTitle>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Submissions by donation type</p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse space-y-3 py-2">
                  <div className="flex items-end gap-3 h-[200px]">
                    {[60, 90, 45, 75].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gray-200 rounded-t-md"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex-1 h-3 bg-gray-200 rounded" />
                    ))}
                  </div>
                </div>
              ) : (
                <DonationsBarChart data={donationChartData} />
              )}
            </CardContent>
          </Card>

          {/* Chart B — Applications Overview */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-emerald-500" />
                <CardTitle className="text-base font-semibold">Applications Overview</CardTitle>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Submissions by application type</p>
            </CardHeader>
            <CardContent>
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
        </div>

        {/* Main Grid — Quick Actions + Pending Reviews */}
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
                        <div
                          className={`${action.bg} p-4 rounded-xl inline-flex mb-4 transition-transform duration-300 ring-2 ring-white/50`}
                        >
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

          {/* Pending Reviews */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Pending Reviews</CardTitle>
                  <span className="text-sm text-gray-500">
                    {loading ? '…' : `${pendingReview} items`}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="animate-pulse space-y-4 py-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-200" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 bg-gray-200 rounded w-3/4" />
                          <div className="h-2 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : pendingReview === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-2">No pending reviews</p>
                    <p className="text-sm text-gray-500">
                      All submissions have been reviewed
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 py-2">
                    {rawStats.pendingDonations > 0 && (
                      <Link to="/dashboard/admin/donations">
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-rose-50 transition-colors group">
                          <div className="bg-rose-100 p-2 rounded-lg">
                            <Heart className="w-4 h-4 text-rose-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {rawStats.pendingDonations} donation{rawStats.pendingDonations !== 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-gray-500">Awaiting review</p>
                          </div>
                          <span className="text-xs text-rose-500 font-semibold bg-rose-50 px-2 py-0.5 rounded-full group-hover:bg-rose-100">
                            Review
                          </span>
                        </div>
                      </Link>
                    )}
                    {rawStats.pendingApplications > 0 && (
                      <Link to="/dashboard/admin/applications">
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-50 transition-colors group">
                          <div className="bg-amber-100 p-2 rounded-lg">
                            <FileText className="w-4 h-4 text-amber-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {rawStats.pendingApplications} application{rawStats.pendingApplications !== 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-gray-500">Awaiting review</p>
                          </div>
                          <span className="text-xs text-amber-500 font-semibold bg-amber-50 px-2 py-0.5 rounded-full group-hover:bg-amber-100">
                            Review
                          </span>
                        </div>
                      </Link>
                    )}
                    {rawStats.pendingVolunteers > 0 && (
                      <Link to="/dashboard/admin/volunteers">
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50 transition-colors group">
                          <div className="bg-emerald-100 p-2 rounded-lg">
                            <HandHeart className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {rawStats.pendingVolunteers} volunteer task{rawStats.pendingVolunteers !== 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-gray-500">Awaiting review</p>
                          </div>
                          <span className="text-xs text-emerald-500 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full group-hover:bg-emerald-100">
                            Review
                          </span>
                        </div>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
