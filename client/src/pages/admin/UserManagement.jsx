import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, Shield } from 'lucide-react';
import FadeIn from '../../components/animations/FadeIn';
import { getUsers } from '../../services/adminService';
import { formatDate } from '../../lib/utils';

const USER_TYPE_BADGE = {
  DONOR: 'bg-blue-100 text-blue-800',
  BENEFICIARY: 'bg-green-100 text-green-800',
  VOLUNTEER: 'bg-orange-100 text-orange-800',
  ADMIN: 'bg-red-100 text-red-800',
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState({ total: 0, donors: 0, beneficiaries: 0, volunteers: 0, admins: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const result = await getUsers();
        setUsers(result.data.users);
        setCounts(result.data.counts);
      } catch (err) {
        setError(err.message || 'Failed to load users.');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const userStats = [
    {
      label: 'Total Users',
      value: counts.total,
      icon: Users,
      color: 'text-primary-600',
      bg: 'bg-primary-50',
    },
    {
      label: 'Donors',
      value: counts.donors,
      icon: Shield,
      color: 'text-error',
      bg: 'bg-error-light',
    },
    {
      label: 'Beneficiaries',
      value: counts.beneficiaries,
      icon: Shield,
      color: 'text-warning',
      bg: 'bg-warning-light',
    },
    {
      label: 'Volunteers',
      value: counts.volunteers,
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

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : (
          <>
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

            {/* User Table */}
            <FadeIn direction="up" delay={200}>
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                  {users.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No users found.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100 text-gray-700 text-left">
                            <th className="px-4 py-3 font-semibold">Full Name</th>
                            <th className="px-4 py-3 font-semibold">Email</th>
                            <th className="px-4 py-3 font-semibold">Phone</th>
                            <th className="px-4 py-3 font-semibold">User Type</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 font-semibold">Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id} className="border-t border-gray-100 even:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-900">{user.fullName}</td>
                              <td className="px-4 py-3 text-gray-600">{user.email}</td>
                              <td className="px-4 py-3 text-gray-600">{user.phoneNumber || '—'}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${USER_TYPE_BADGE[user.userType] ?? 'bg-gray-100 text-gray-700'}`}>
                                  {user.userType}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {user.isActive ? (
                                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Active</span>
                                ) : (
                                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Inactive</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-gray-600">{formatDate(user.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
