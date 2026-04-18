import { MapPin, Calendar } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import { imageUrl } from '../../lib/imageUrl';
import AnimatedBull from './AnimatedBull';

/**
 * ListingCard — shows a qurbani animal listing with hissa availability grid.
 */
export default function ListingCard({ listing, onBook }) {
  const img = imageUrl(listing.photoUrl);
  const total = listing.totalHissas || 7;
  const booked = listing.hissasBooked ?? 0;
  const available = listing.hissasAvailable ?? Math.max(0, total - booked);
  const percent = total > 0 ? Math.round((booked / total) * 100) : 0;
  const soldOut = available === 0;

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover flex flex-col">
      <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-qurbani-50 to-qurbani-100 flex items-center justify-center overflow-hidden">
        {img ? (
          <img src={img} alt={listing.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <AnimatedBull />
        )}
        {soldOut ? (
          <Badge variant="error" size="sm" className="absolute top-3 right-3 shadow-sm">
            Sold out
          </Badge>
        ) : available <= 2 ? (
          <Badge variant="warning" size="sm" className="absolute top-3 right-3 shadow-sm">
            Only {available} left
          </Badge>
        ) : null}
      </div>

      <CardContent className="pt-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight">{listing.name}</h3>
          {listing.weightKg && (
            <Badge variant="qurbani" size="sm" className="whitespace-nowrap">{listing.weightKg} kg</Badge>
          )}
        </div>

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

        <div className="mb-3">
          <div className="flex items-center justify-between text-xs font-medium text-gray-600 mb-2">
            <span>Hissas</span>
            <span className="tabular-nums">{booked} / {total} booked</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {Array.from({ length: total }).map((_, i) => {
              const isBooked = i < booked;
              return (
                <div
                  key={i}
                  className={cn(
                    'w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-semibold transition-colors',
                    isBooked
                      ? 'bg-qurbani-600 border-qurbani-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  )}
                  title={isBooked ? `Hissa ${i + 1} booked` : `Hissa ${i + 1} available`}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-qurbani-500 to-qurbani-700 transition-all duration-500" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500">Per hissa</p>
            <p className="text-lg font-bold text-qurbani-700 tabular-nums">
              {formatCurrency(listing.pricePerHissa)}
            </p>
          </div>
          <Button
            onClick={() => onBook?.(listing)}
            disabled={soldOut}
            variant={soldOut ? 'outline' : 'default'}
            className={soldOut ? '' : 'bg-qurbani-600 hover:bg-qurbani-700 text-white'}
          >
            {soldOut ? 'Sold out' : 'Book hissa'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
