import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import DataTable from '../../components/admin/DataTable';
import { Heart } from 'lucide-react';
import * as adminService from '../../services/adminService';
import FadeIn from '../../components/animations/FadeIn';
import { SkeletonTable } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';

export default function DonationsManagement() {
  const [activeTab, setActiveTab] = useState('qurbani');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const tabs = [
    { id: 'qurbani', label: 'Qurbani Donations' },
    { id: 'ration', label: 'Ration Donations' },
    { id: 'skin', label: 'Skin Collections' },
    { id: 'sponsorship', label: 'Orphan Sponsorships' },
  ];

  const columns = {
    qurbani: [
      { key: 'donorName', label: 'Donor Name' },
      { key: 'animalType', label: 'Animal Type' },
      { key: 'quantity', label: 'Quantity' },
      {
        key: 'totalAmount',
        label: 'Amount',
        render: (row) => `PKR ${parseFloat(row.totalAmount).toLocaleString()}`
      },
    ],
    ration: [
      { key: 'donorName', label: 'Donor Name' },
      { key: 'donorEmail', label: 'Email' },
      {
        key: 'amount',
        label: 'Amount',
        render: (row) => `PKR ${parseFloat(row.amount).toLocaleString()}`
      },
    ],
    skin: [
      { key: 'donorName', label: 'Donor Name' },
      { key: 'numberOfSkins', label: 'Number of Skins' },
      { key: 'animalType', label: 'Animal Type' },
      {
        key: 'preferredDate',
        label: 'Collection Date',
        render: (row) => new Date(row.preferredDate).toLocaleDateString()
      },
    ],
    sponsorship: [
      { key: 'sponsorName', label: 'Sponsor Name' },
      { key: 'sponsorEmail', label: 'Email' },
      {
        key: 'monthlyAmount',
        label: 'Monthly Amount',
        render: (row) => `PKR ${parseFloat(row.monthlyAmount).toLocaleString()}`
      },
      { key: 'duration', label: 'Duration (months)' },
    ],
  };

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      let response;
      switch (tab) {
        case 'qurbani':
          response = await adminService.getQurbaniDonations();
          break;
        case 'ration':
          response = await adminService.getRationDonations();
          break;
        case 'skin':
          response = await adminService.getSkinCollections();
          break;
        case 'sponsorship':
          response = await adminService.getOrphanSponsorships();
          break;
        default:
          response = { data: [] };
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
      case 'qurbani':
        await adminService.updateQurbaniDonationStatus(id, status);
        break;
      case 'ration':
        await adminService.updateRationDonationStatus(id, status);
        break;
      case 'skin':
        await adminService.updateSkinCollectionStatus(id, status);
        break;
      case 'sponsorship':
        await adminService.updateOrphanSponsorshipStatus(id, status);
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
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Donations Management</h1>
                <p className="text-sm text-gray-600">
                  Review and manage all donation submissions
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
                  className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-all duration-200 hover:scale-105 ${
                    activeTab === tab.id
                      ? 'border-red-600 text-red-600'
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
                  title="No donations yet"
                  description="Submissions will appear here once users start submitting."
                />
              ) : (
                <DataTable
                  columns={columns[activeTab]}
                  data={data}
                  // Skin collection still needs scheduling/approval. The
                  // other three are pure cash donations — admin sees them
                  // as a log only (auto-confirmed on payment).
                  onStatusUpdate={activeTab === 'skin' ? handleStatusUpdate : undefined}
                />
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </DashboardLayout>
  );
}
