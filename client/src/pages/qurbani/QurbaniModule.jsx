import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FadeIn from '../../components/animations/FadeIn';
import ListingCard from '../../components/qurbani/ListingCard';
import HissaSelector from '../../components/qurbani/HissaSelector';
import { SkeletonCard } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import useQurbaniModuleStore from '../../store/qurbaniModuleStore';

export default function QurbaniModule() {
  const {
    moduleEnabled,
    listings,
    loading,
    fetchFlag,
    fetchListings,
  } = useQurbaniModuleStore();

  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchFlag();
  }, [fetchFlag]);

  useEffect(() => {
    if (moduleEnabled === true) {
      fetchListings();
    }
  }, [moduleEnabled, fetchListings]);

  const handleBook = (listing) => setSelected(listing);
  const handleClose = () => setSelected(null);

  const flagLoading = moduleEnabled === null;

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <FadeIn direction="down" delay={0}>
          <div className="mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Qurbani Booking</h1>
              <p className="text-gray-600 mt-1">
                Book your hissas in this Eid's shared qurbani animals
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Content */}
        {flagLoading || (moduleEnabled === true && loading) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : moduleEnabled === false ? (
          <FadeIn direction="up" delay={100}>
            <EmptyState
              title="Qurbani booking is currently closed"
              description="Qurbani bookings are not open right now. Please check back closer to Eid-ul-Adha."
            />
          </FadeIn>
        ) : listings.length === 0 ? (
          <FadeIn direction="up" delay={100}>
            <EmptyState
              title="No active qurbanis"
              description="No qurbanis are open for booking right now. Check back soon."
            />
          </FadeIn>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((listing, idx) => (
              <FadeIn key={listing.id} direction="up" delay={Math.min(idx * 60, 300)}>
                <ListingCard listing={listing} onBook={handleBook} />
              </FadeIn>
            ))}
          </div>
        )}

        {/* Booking modal */}
        <HissaSelector
          listing={selected}
          open={!!selected}
          onClose={() => {
            handleClose();
            // Refresh listings to reflect updated booked count
            fetchListings();
          }}
          onSubmitted={() => {
            // Trigger background refresh so availability updates
            fetchListings();
          }}
        />
      </div>
    </DashboardLayout>
  );
}
