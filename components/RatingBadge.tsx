import { Star } from 'lucide-react';

export default function RatingBadge({ avgRating, reviewCount }: { avgRating?: number; reviewCount?: number }) {
  if (!avgRating || !reviewCount) return null;
  return (
    <span className="flex items-center gap-1 text-xs font-bold text-anthracite">
      <Star size={12} className="text-solar fill-solar" aria-hidden />
      {avgRating.toFixed(1)}
      <span className="text-gray-400 font-normal">({reviewCount})</span>
    </span>
  );
}
