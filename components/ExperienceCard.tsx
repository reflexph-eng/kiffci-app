import Link from 'next/link';
import { Experience } from '@/types';
import { Clock, MapPin } from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import RatingBadge from './RatingBadge';
import EditorialBadgePill, { EditorialBadge, computeAutoBadge } from './EditorialBadge';
import { getEditorialBadgeFromHighlight } from '@/lib/highlights';

interface Props {
  e: Experience;
  /** Badge forcé par la rubrique parente (ex: "top10" dans une section triée par popularité). */
  badge?: EditorialBadge;
}

export default function ExperienceCard({ e, badge }: Props) {
  const resolvedBadge = badge ?? getEditorialBadgeFromHighlight(e) ?? computeAutoBadge(e.createdAt, e.isPremium || e.isSponsored);

  return (
    <div className="group bg-transparent overflow-hidden border-b border-gray-200 pb-5 transition-colors duration-300 flex flex-col relative">
      <div className="absolute top-3 right-3 z-10">
        <FavoriteButton experienceId={e.id} />
      </div>

      <Link href={`/experiences/${e.id}`} className="flex flex-col flex-1">
        {/* Image — plus grande, ratio 4:3 */}
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          {e.images[0] ? (
            <div
              className="absolute inset-0 bg-cover bg-center scale-100 group-hover:scale-[1.06] transition-transform duration-500 ease-out"
              style={{ backgroundImage: `url(${e.images[0]})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-sand to-orange-100 flex items-center justify-center">
              <img src="/logo.png" alt="" aria-hidden width={56} height={56} className="opacity-30" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap max-w-[75%]">
            <EditorialBadgePill badge={resolvedBadge} />
            {e.isFree && (
              <span className="bg-tropical text-white text-xs font-bold px-2.5 py-1 rounded-lg">Gratuit</span>
            )}
          </div>
        </div>

        {/* Contenu */}
        <div className="pt-4 flex flex-col flex-1">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{e.category}</span>
            <RatingBadge avgRating={e.avgRating} reviewCount={e.reviewCount} />
          </div>
          <h3 className="font-display font-bold text-base leading-snug text-anthracite group-hover:text-solar transition-colors line-clamp-2">
            {e.title}
          </h3>
          <p className="mt-1.5 text-sm text-gray-500 line-clamp-2 flex-1">{e.description}</p>
          <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><MapPin size={12} aria-hidden />{e.district}</span>
              <span className="flex items-center gap-1"><Clock size={12} aria-hidden />{e.duration}</span>
            </div>
            <span className="text-sm font-bold text-anthracite">{e.priceText}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
