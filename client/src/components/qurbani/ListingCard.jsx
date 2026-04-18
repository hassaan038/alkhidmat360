import { MapPin, Calendar } from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import { imageUrl } from '../../lib/imageUrl';
import AnimatedBull from './AnimatedBull';

/**
 * ListingCard — shows a qurbani animal listing with hissa availability grid.
 *
 * Props:
 *  - listing: { id, name, weightKg, totalHissas, pricePerHissa, photoUrl,
 *               pickupDate, pickupLocation, description, hissasBooked, hissasAvailable, status }
 *  - onBook: (listing) => void
 */
export default function ListingCard({ listing, onBook }) {
  const img = imageUrl(listing.photoUrl);
  const total = listing.totalHissas || 7;
  const booked = listing.hissasBooked ?? 0;
  const available = listing.hissasAvailable ?? Math.max(0, total - booked);
  const percent = total > 0 ? Math.round((booked / total) * 100) : 0;
  const soldOut = available === 0;

  return (
    <Card className="overflow-hidden shadow-soft hover:shadow-large transition-shadow duration-300 flex flex-col">
      {/* Photo */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 flex items-center justify-center">
        {img ? (
          <img
            src={img}
            alt={listing.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <AnimatedBull />
        )}
        {soldOut && (
          <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold bg-error text-white shadow-md">
            Sold Out
          </span>
        )}
      </div>

      <CardContent className="pt-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">
            {listing.name}
          </h3>
          {listing.weightKg && (
            <span className="text-xs font-medium text-gray-600 bg-gray-100 rounded-full px-2 py-1 whitespace-nowrap">
              {listing.weightKg} kg
            </span>
          )}
        </div>

        {/* Pickup info */}
        <div className="space-y-1.5 text-sm text-gray-600 mb-4">
          {listing.pickupDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{formatDate(listing.pickupDate)}</span>
            </div>
          )}
          {listing.pickupLocation && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="line-clamp-1">{listing.pickupLocation}</span>
            </div>
          )}
        </div>

        {/* Hissa grid */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs font-medium text-gray-600 mb-2">
            <span>Hissas</span>
            <span>
              {booked} / {total} booked
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {Array.from({ length: total }).map((_, i) => {
              const isBooked = i < booked;
              return (
                <div
                  key={i}
                  className={cn(
                    'w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-semibold transition-colors',
                    isBooked
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  )}
                  title={isBooked ? `Hissa ${i + 1} booked` : `Hissa ${i + 1} available`}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Price + CTA */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">Per hissa</p>
            <p className="text-lg font-bold text-primary-700">
              {formatCurrency(listing.pricePerHissa)}
            </p>
          </div>
          <Button
            onClick={() => onBook?.(listing)}
            disabled={soldOut}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            {soldOut ? 'Sold Out' : 'Book Hissa'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
