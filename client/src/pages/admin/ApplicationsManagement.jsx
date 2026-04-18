import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/admin/DataTable';
import { FileText } from 'lucide-react';
import * as adminService from '../../services/adminService';
import { cn } from '../../lib/utils';

const tabs = [
  { id: 'loan', label: 'Loan Applications' },
  { id: 'ration', label: 'Ramadan Ration' },
  { id: 'orphan', label: 'Orphan Registrations' },
];

const columns = {
  loan: [
    { key: 'applicantName', label: 'Applicant' },
    { key: 'loanType', label: 'Loan Type' },
    { key: 'requestedAmount', label: 'Amount', render: (row) => `PKR ${parseFloat(row.requestedAmount).toLocaleString()}` },
    { key: 'familyMembers', label: 'Family' },
    { key: 'employmentStatus', label: 'Employment' },
  ],
  ration: [
    { key: 'applicantName', label: 'Applicant' },
    { key: 'familyMembers', label: 'Family' },
    { key: 'monthlyIncome', label: 'Income', render: (row) => `PKR ${parseFloat(row.monthlyIncome).toLocaleString()}` },
    { key: 'hasDisabledMembers', label: 'Disabled Members', render: (row) => (row.hasDisabledMembers ? 'Yes' : 'No') },
  ],
  orphan: [
    { key: 'orphanName', label: 'Orphan' },
    { key: 'orphanAge', label: 'Age' },
    { key: 'orphanGender', label: 'Gender' },
    { key: 'guardianName', label: 'Guardian' },
    { key: 'educationLevel', label: 'Education' },
  ],
};

export default function ApplicationsManagement() {
  const [activeTab, setActiveTab] = useState('loan');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      let response;
      switch (tab) {
        case 'loan': response = await adminService.getLoanApplications(); break;
        case 'ration': response = await adminService.getRamadanRationApplications(); break;
        case 'orphan': response = await adminService.getOrphanRegistrations(); break;
        default: response = { data: [] };
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
      case 'loan': await adminService.updateLoanApplicationStatus(id, status); break;
      case 'ration': await adminService.updateRamadanRationApplicationStatus(id, status); break;
      case 'orphan': await adminService.updateOrphanRegistrationStatus(id, status); break;
    }
    fetchData(activeTab);
  };

  return (
    <DashboardLayout>
      <PageContainer className="space-y-6">
        <PageHeader
          icon={FileText}
          accent="loan"
          title="Applications Management"
          description="Review and manage all beneficiary applications."
        />

        <div className="border-b border-gray-200">
          <nav className="flex gap-1 overflow-x-auto -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg border-b-2 transition-colors cursor-pointer',
                  activeTab === tab.id
                    ? 'border-loan-600 text-loan-700'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <DataTable
          columns={columns[activeTab]}
          data={data}
          loading={loading}
          searchable
          statusFilter={['pending', 'under_review', 'approved', 'rejected']}
          onStatusUpdate={handleStatusUpdate}
          actionLabels={{ approve: 'Approve', reject: 'Reject', approveStatus: 'approved', rejectStatus: 'rejected' }}
          emptyTitle="No applications yet"
          emptyDescription="Submissions will appear here once users start submitting."
        />
      </PageContainer>
    </DashboardLayout>
  );
}
