import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import DataTable from '../../components/admin/DataTable';
import { FileText } from 'lucide-react';
import * as adminService from '../../services/adminService';
import FadeIn from '../../components/animations/FadeIn';
import { SkeletonTable } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

export default function ApplicationsManagement() {
  const [activeTab, setActiveTab] = useState('loan');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const tabs = [
    { id: 'loan', label: 'Loan Applications' },
    { id: 'ration', label: 'Ramadan Ration' },
    { id: 'orphan', label: 'Orphan Registrations' },
  ];

  const columns = {
    loan: [
      { key: 'applicantName', label: 'Applicant Name' },
      { key: 'loanType', label: 'Loan Type' },
      {
        key: 'requestedAmount',
        label: 'Amount',
        render: (row) => `PKR ${parseFloat(row.requestedAmount).toLocaleString()}`
      },
      { key: 'familyMembers', label: 'Family Members' },
      { key: 'employmentStatus', label: 'Employment' },
    ],
    ration: [
      { key: 'applicantName', label: 'Applicant Name' },
      { key: 'familyMembers', label: 'Family Members' },
      {
        key: 'monthlyIncome',
        label: 'Monthly Income',
        render: (row) => `PKR ${parseFloat(row.monthlyIncome).toLocaleString()}`
      },
      {
        key: 'hasDisabledMembers',
        label: 'Has Disabled Members',
        render: (row) => row.hasDisabledMembers ? 'Yes' : 'No'
      },
    ],
    orphan: [
      { key: 'orphanName', label: 'Orphan Name' },
      { key: 'orphanAge', label: 'Age' },
      { key: 'orphanGender', label: 'Gender' },
      { key: 'guardianName', label: 'Guardian' },
      { key: 'educationLevel', label: 'Education Level' },
    ],
  };

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      let response;
      switch (tab) {
        case 'loan':
          response = await adminService.getLoanApplications();
          break;
        case 'ration':
          response = await adminService.getRamadanRationApplications();
          break;
        case 'orphan':
          response = await adminService.getOrphanRegistrations();
          break;
        default:
          response = { data: [] };
      }
      setData(response.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(activeTab);
  }, [activeTab]);

  const handleStatusUpdate = async (id, status) => {
    switch (activeTab) {
      case 'loan':
        await adminService.updateLoanApplicationStatus(id, status);
        break;
      case 'ration':
        await adminService.updateRamadanRationApplicationStatus(id, status);
        break;
      case 'orphan':
        await adminService.updateOrphanRegistrationStatus(id, status);
        break;
    }
    fetchData(activeTab); // Refresh data
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <FadeIn direction="up" delay={0}>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Applications Management</h1>
                <p className="text-sm text-gray-600">
                  Review and manage all beneficiary applications
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Tabs */}
        <FadeIn direction="up" delay={100}>
          <div className="mb-6 border-b border-gray-200">
            <nav className="flex gap-4 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-yellow-600 text-yellow-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </FadeIn>

        {/* Data Table Card */}
        <FadeIn direction="up" delay={200}>
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>
                {tabs.find((t) => t.id === activeTab)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <SkeletonTable rows={5} />
              ) : data.length === 0 ? (
                <EmptyState
                  title="No applications yet"
                  description="Submissions will appear here once users start submitting."
                />
              ) : (
                <DataTable
                  columns={columns[activeTab]}
                  data={data}
                  onStatusUpdate={handleStatusUpdate}
                  type={activeTab}
                />
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </DashboardLayout>
  );
}
