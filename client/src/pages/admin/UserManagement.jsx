import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Users, Loader2, Mail, Phone, Shield } from 'lucide-react';
import FadeIn from '../../components/animations/FadeIn';

export default function UserManagement() {
  const [loading, setLoading] = useState(false);

  // Placeholder for future user management functionality
  const userStats = [
    {
      label: 'Total Users',
      value: '4',
      icon: Users,
      color: 'text-primary-600',
      bg: 'bg-primary-50',
    },
    {
      label: 'Donors',
      value: '1',
      icon: Shield,
      color: 'text-error',
      bg: 'bg-error-light',
    },
    {
      label: 'Beneficiaries',
      value: '1',
      icon: Shield,
      color: 'text-warning',
      bg: 'bg-warning-light',
    },
    {
      label: 'Volunteers',
      value: '1',
      icon: Shield,
      color: 'text-success',
      bg: 'bg-success-light',
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <FadeIn direction="up" delay={0}>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl shadow-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-600">
                  View and manage all platform users
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* User Statistics */}
        <FadeIn direction="up" delay={100}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {userStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${stat.bg} p-3 rounded-lg`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </FadeIn>

        {/* User List Card */}
        <FadeIn direction="up" delay={200}>
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-2">User Management</p>
                <p className="text-sm text-gray-500">
                  Comprehensive user management features coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Info Card */}
        <FadeIn direction="up" delay={300}>
          <Card className="mt-6 bg-primary-50 border-primary-200 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">ℹ️</span>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-900 mb-1">System Information</h4>
                  <ul className="text-sm text-primary-800 space-y-1">
                    <li>• Current users are managed through the authentication system</li>
                    <li>• User roles: Admin, Donor, Beneficiary, Volunteer</li>
                    <li>• All users have secure session-based authentication</li>
                    <li>• User data is stored securely in MySQL database</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </DashboardLayout>
  );
}
