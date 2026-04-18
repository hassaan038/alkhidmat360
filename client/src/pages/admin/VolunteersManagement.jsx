import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import {
  HandHeart,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  Briefcase,
  Users,
  Search,
  Filter
} from 'lucide-react';
import * as adminService from '../../services/adminService';
import FadeIn from '../../components/animations/FadeIn';
import { SkeletonTable } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

export default function VolunteersManagement() {
  const [loading, setLoading] = useState(true);
  const [volunteers, setVolunteers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchData = async () => {
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
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  // Filter volunteers based on search and status
  const filteredVolunteers = volunteers.filter((volunteer) => {
    const matchesSearch =
      volunteer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.phoneNumber.includes(searchTerm);

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && volunteer.isActive) ||
      (filterStatus === 'inactive' && !volunteer.isActive);

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: volunteers.length,
    active: volunteers.filter(v => v.isActive).length,
    inactive: volunteers.filter(v => !v.isActive).length,
    withTasks: volunteers.filter(v => v.volunteerTasks && v.volunteerTasks.length > 0).length,
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        {/* Animated Background */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <FadeIn direction="up" delay={0}>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl shadow-xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
                  <HandHeart className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-1">Volunteer Management</h1>
                  <p className="text-gray-600">Manage and track all registered volunteers</p>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 font-medium">Total Volunteers</p>
                      <p className="text-3xl font-bold text-green-900 mt-1">{stats.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Active</p>
                      <p className="text-3xl font-bold text-blue-900 mt-1">{stats.active}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-blue-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-700 font-medium">Inactive</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.inactive}</p>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-gray-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700 font-medium">With Tasks</p>
                      <p className="text-3xl font-bold text-purple-900 mt-1">{stats.withTasks}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-purple-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
            </div>
          </FadeIn>

          {/* Search and Filter */}
          <FadeIn direction="up" delay={100}>
            <Card className="mb-6 backdrop-blur-lg bg-white/80 shadow-xl border-0">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search Bar */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:scale-[1.01] transition-all outline-none"
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="relative sm:w-48">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:scale-[1.01] transition-all outline-none appearance-none bg-white"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Volunteers Table */}
          <FadeIn direction="up" delay={200}>
            <Card className="backdrop-blur-lg bg-white/80 shadow-2xl border-0 overflow-hidden hover:shadow-3xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6">
              <h2 className="text-2xl font-bold text-white">Registered Volunteers</h2>
              <p className="text-green-50 text-sm mt-1">
                {filteredVolunteers.length} volunteer{filteredVolunteers.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <CardContent className="p-0">
              {loading ? (
                <div className="p-6">
                  <SkeletonTable rows={5} />
                </div>
              ) : filteredVolunteers.length === 0 ? (
                <EmptyState
                  title={searchTerm || filterStatus !== 'all' ? 'No volunteers found' : 'No tasks yet'}
                  description={
                    searchTerm || filterStatus !== 'all'
                      ? 'Try adjusting your search or filters.'
                      : 'Submissions will appear here once users start submitting.'
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Volunteer
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          CNIC
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Tasks
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredVolunteers.map((volunteer, index) => (
                        <tr
                          key={volunteer.id}
                          className="hover:bg-green-50 transition-all duration-200 hover:scale-[1.01]"
                          style={{
                            animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`
                          }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                                {volunteer.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">
                                  {volunteer.fullName}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Mail className="w-3 h-3" />
                                  {volunteer.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {volunteer.phoneNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {volunteer.cnic ? (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <CreditCard className="w-4 h-4 text-gray-400" />
                                {volunteer.cnic}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 italic">Not provided</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <Briefcase className="w-3 h-3 mr-1" />
                                {volunteer.volunteerTasks?.length || 0} {volunteer.volunteerTasks?.length === 1 ? 'task' : 'tasks'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {volunteer.isActive ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 transition-all duration-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 transition-all duration-200">
                                <XCircle className="w-3 h-3 mr-1" />
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {formatDate(volunteer.createdAt)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
