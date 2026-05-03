import { useEffect, useState } from 'react';
import { Drumstick } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/ui/PageContainer';
import PageHeader from '../../components/ui/PageHeader';
import ListingCard from '../../components/qurbani/ListingCard';
import HissaSelector from '../../components/qurbani/HissaSelector';
import { SkeletonStatCard } from '../../components/ui/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import useQurbaniModuleStore from '../../store/qurbaniModuleStore';
import { useTranslation } from 'react-i18next';

export default function QurbaniModule() {
  const { t } = useTranslation();
  const { moduleEnabled, listings, loading, fetchFlag, fetchListings } = useQurbaniModuleStore();
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchFlag(); }, [fetchFlag]);

  useEffect(() => {
    if (moduleEnabled === true) {
      fetchListings();
    }
  }, [moduleEnabled, fetchListings]);

  const flagLoading = moduleEnabled === null;

  return (
    <DashboardLayout>
      <PageContainer className="space-y-6">
        <PageHeader
          icon={Drumstick}
          accent="qurbani"
          title={t('qurbaniModule.title')}
          description={t('qurbaniModule.description')}
        />

        {flagLoading || (moduleEnabled === true && loading) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (<SkeletonStatCard key={i} />))}
          </div>
        ) : moduleEnabled === false ? (
          <EmptyState
            icon={Drumstick}
            tone="qurbani"
            title={t('skinPickup.moduleClosed')}
            description={t('skinPickup.moduleClosedDesc')}
          />
        ) : listings.length === 0 ? (
          <EmptyState
            icon={Drumstick}
            tone="qurbani"
            title={t('qurbaniModule.noActiveListings')}
            description={t('qurbaniModule.noActiveListingsDesc')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} onBook={setSelected} />
            ))}
          </div>
        )}

        <HissaSelector
          listing={selected}
          open={!!selected}
          onClose={() => { setSelected(null); fetchListings(); }}
          onSubmitted={() => { fetchListings(); }}
        />
      </PageContainer>
    </DashboardLayout>
  );
}
