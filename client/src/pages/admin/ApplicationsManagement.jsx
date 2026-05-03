import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/admin/DataTable';
import { FileText } from 'lucide-react';
import * as adminService from '../../services/adminService';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';

export default function ApplicationsManagement() {
  const { t } = useTranslation();
  const tabs = [
    { id: 'loan', label: t('sidebar.loanApplication') },
    { id: 'ration', label: t('sidebar.ramadanRation') },
    { id: 'orphan', label: t('sidebar.orphanRegistration') },
  ];
  const columns = {
    loan: [
      { key: 'applicantName', label: t('loanApplication.applicantName') },
      { key: 'loanType', label: t('loanApplication.loanType') },
      { key: 'requestedAmount', label: t('common.amount'), render: (row) => `PKR ${parseFloat(row.requestedAmount).toLocaleString()}` },
      { key: 'familyMembers', label: t('loanApplication.familyMembers') },
      { key: 'employmentStatus', label: t('loanApplication.employmentStatus') },
    ],
    ration: [
      { key: 'applicantName', label: t('loanApplication.applicantName') },
      { key: 'familyMembers', label: t('ramadanRation.familyMembers') },
      { key: 'monthlyIncome', label: t('ramadanRation.monthlyIncome'), render: (row) => `PKR ${parseFloat(row.monthlyIncome).toLocaleString()}` },
      { key: 'hasDisabledMembers', label: t('ramadanRation.hasDisabledMembers'), render: (row) => (row.hasDisabledMembers ? t('common.yes') : t('common.no')) },
    ],
    orphan: [
      { key: 'orphanName', label: t('orphanReg.orphanName') },
      { key: 'orphanAge', label: t('orphanReg.orphanAge') },
      { key: 'orphanGender', label: t('orphanReg.orphanGender') },
      { key: 'guardianName', label: t('orphanReg.guardianName') },
      { key: 'educationLevel', label: t('orphanReg.educationLevel') },
    ],
  };
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
          title={t('adminApplications.title')}
          description={t('adminApplications.description')}
        />

        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="flex gap-1 overflow-x-auto -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg border-b-2 transition-colors cursor-pointer',
                  activeTab === tab.id
                    ? 'border-loan-600 text-loan-700 dark:text-loan-200'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 hover:bg-gray-50'
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
          actionLabels={{ approve: t('common.approve'), reject: t('common.reject'), approveStatus: 'approved', rejectStatus: 'rejected' }}
          emptyTitle={t('table.noData')}
          emptyDescription={t('empty.description')}
        />
      </PageContainer>
    </DashboardLayout>
  );
}
