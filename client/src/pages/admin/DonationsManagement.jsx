import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/admin/DataTable';
import { Heart } from 'lucide-react';
import * as adminService from '../../services/adminService';
import { cn } from '../../lib/utils';

const tabs = [
  { id: 'qurbani', label: 'Qurbani Donations' },
  { id: 'ration', label: 'Ration Donations' },
  { id: 'skin', label: 'Skin Collections' },
  { id: 'sponsorship', label: 'Orphan Sponsorships' },
];

const columns = {
  qurbani: [
    { key: 'donorName', label: 'Donor' },
    { key: 'animalType', label: 'Animal' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'totalAmount', label: 'Amount', render: (row) => `PKR ${parseFloat(row.totalAmount).toLocaleString()}` },
  ],
  ration: [
    { key: 'donorName', label: 'Donor' },
    { key: 'donorEmail', label: 'Email' },
    { key: 'amount', label: 'Amount', render: (row) => `PKR ${parseFloat(row.amount).toLocaleString()}` },
  ],
  skin: [
    { key: 'donorName', label: 'Donor' },
    { key: 'numberOfSkins', label: 'Skins' },
    { key: 'animalType', label: 'Animal' },
    { key: 'preferredDate', label: 'Collection Date', render: (row) => new Date(row.preferredDate).toLocaleDateString() },
  ],
  sponsorship: [
    { key: 'sponsorName', label: 'Sponsor' },
    { key: 'sponsorEmail', label: 'Email' },
    { key: 'monthlyAmount', label: 'Monthly', render: (row) => `PKR ${parseFloat(row.monthlyAmount).toLocaleString()}` },
    { key: 'duration', label: 'Duration (mo)' },
  ],
};

export default function DonationsManagement() {
  const [activeTab, setActiveTab] = useState('qurbani');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      let response;
      switch (tab) {
        case 'qurbani': response = await adminService.getQurbaniDonations(); break;
        case 'ration': response = await adminService.getRationDonations(); break;
        case 'skin': response = await adminService.getSkinCollections(); break;
        case 'sponsorship': response = await adminService.getOrphanSponsorships(); break;
        default: response = { data: [] };
      }
      setData(response.data || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
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
      case 'qurbani': await adminService.updateQurbaniDonationStatus(id, status); break;
      case 'ration': await adminService.updateRationDonationStatus(id, status); break;
      case 'skin': await adminService.updateSkinCollectionStatus(id, status); break;
      case 'sponsorship': await adminService.updateOrphanSponsorshipStatus(id, status); break;
    }
    fetchData(activeTab);
  };

  return (
    <DashboardLayout>
      <PageContainer className="space-y-6">
        <PageHeader
          icon={Heart}
          accent="sadqa"
          title="Donations Management"
          description="Review and manage all donation submissions by type."
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
                    ? 'border-sadqa-600 text-sadqa-700'
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
          statusFilter={activeTab === 'skin' ? ['pending', 'confirmed', 'completed', 'rejected'] : undefined}
          onStatusUpdate={activeTab === 'skin' ? handleStatusUpdate : undefined}
          emptyTitle="No donations yet"
          emptyDescription="Submissions will appear here once users start submitting."
        />
      </PageContainer>
    </DashboardLayout>
  );
}
