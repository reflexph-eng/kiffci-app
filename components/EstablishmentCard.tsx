import Link from 'next/link';
import { Establishment } from '@/types';
import { MapPin } from 'lucide-react';
import RatingBadge from './RatingBadge';
import EditorialBadgePill, { EditorialBadge, computeAutoBadge } from './EditorialBadge';
import { getEditorialBadgeFromHighlight, isSponsoredHighlight } from '@/lib/highlights';
import VerifiedBadge from './VerifiedBadge';

interface Props {
  e: Establishment;
  badge?: EditorialBadge;
  compact?: boolean;
}

export default function EstablishmentCard({ e, badge, compact = false }: Props) {
  const resolvedBadge = badge ?? getEditorialBadgeFromHighlight(e) ?? computeAutoBadge(e.createdAt, e.isFeatured || e.isSponsored);

  return (
    <Link href={`/establishments/${e.id}`}
      className={`group bg-transparent overflow-hidden border-b border-gray-200 ${compact ? 'pb-4' : 'pb-5'} transition-colors duration-300 flex flex-col`}>
      <div className={`relative ${compact ? 'aspect-square' : 'aspect-[4/3]'} bg-gray-100 overflow-hidden`}>
        {e.images[0] ? (
          <img src={e.images[0]} alt={e.name} loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500 ease-out" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-sand to-orange-100 flex items-center justify-center">
            <img src="/logo.png" alt="" aria-hidden width={56} height={56} className="opacity-30" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap max-w-[75%]">
          <EditorialBadgePill badge={resolvedBadge} />
          {(e.isSponsored || isSponsoredHighlight(e)) && (
            <span className="bg-solar text-white text-xs font-bold px-2.5 py-1 rounded-lg">Sponsorisé</span>
          )}
        </div>
        {e.isVerified && (
          <div className="absolute bottom-3 right-3">
            <VerifiedBadge />
          </div>
        )}
      </div>
      <div className={`${compact ? 'pt-3' : 'pt-4'} flex flex-col flex-1`}>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{e.category}</span>
          <RatingBadge avgRating={e.avgRating} reviewCount={e.reviewCount} />
        </div>
        <h3 className={`font-display font-bold ${compact ? 'text-sm md:text-[15px]' : 'text-base'} leading-snug text-anthracite group-hover:text-solar transition-colors line-clamp-2`}>
          {e.name}
        </h3>
        {!compact && <p className="mt-1.5 text-sm text-gray-500 line-clamp-2 flex-1">{e.description}</p>}
        <div className={`${compact ? 'mt-2 pt-2' : 'mt-3 pt-3'} border-t border-gray-50 flex items-center gap-1 text-xs text-gray-500`}>
          <MapPin size={12} className="shrink-0" aria-hidden />{e.district}, {e.city}
        </div>
      </div>
    </Link>
  );
}
