import { Star } from 'lucide-react';

export default function StarRating({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${value.toFixed(1)} sur 5 étoiles`}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} aria-hidden
          className={i <= Math.round(value) ? 'text-solar fill-solar' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}
