import Link from 'next/link';
import { Experience } from '@/types';
import { ArrowUpRight, Clock, MapPin } from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import RatingBadge from './RatingBadge';
import EditorialBadgePill, { EditorialBadge, computeAutoBadge } from './EditorialBadge';
import { getEditorialBadgeFromHighlight } from '@/lib/highlights';

interface Props {
  e: Experience;
  badge?: EditorialBadge;
  featured?: boolean;
}

export default function ExperienceCard({ e, badge, featured = false }: Props) {
  const resolvedBadge = badge ?? getEditorialBadgeFromHighlight(e) ?? computeAutoBadge(e.createdAt, e.isPremium || e.isSponsored);

  return (
    <article className={`group relative border-b border-gray-200 pb-6 ${featured ? 'md:col-span-2 md:grid md:grid-cols-[1.25fr_.75fr] md:gap-7' : ''}`}>
      <div className="absolute right-3 top-3 z-20"><FavoriteButton experienceId={e.id} /></div>
      <Link href={`/experiences/${e.id}`} className="contents">
        <div className={`relative overflow-hidden bg-gray-100 ${featured ? 'aspect-[16/10] md:aspect-auto md:min-h-[360px]' : 'aspect-[4/3]'}`}>
          {e.images[0] ? (
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.045]" style={{ backgroundImage: `url(${e.images[0]})` }} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sand to-orange-100">
              <img src="/logo.png" alt="" aria-hidden width={56} height={56} className="opacity-30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          <div className="absolute left-3 top-3 flex max-w-[72%] flex-wrap gap-1.5">
            <EditorialBadgePill badge={resolvedBadge} />
            {e.isFree && <span className="rounded-full bg-tropical px-3 py-1 text-xs font-bold text-white">Gratuit</span>}
          </div>
          <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-anthracite transition group-hover:bg-solar group-hover:text-white">
            <ArrowUpRight size={18} />
          </span>
        </div>

        <div className={`flex flex-col pt-4 ${featured ? 'md:justify-center md:pt-0' : ''}`}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-solar">{e.category}</span>
            <RatingBadge avgRating={e.avgRating} reviewCount={e.reviewCount} />
          </div>
          <h3 className={`font-display font-bold leading-tight text-anthracite transition-colors group-hover:text-solar ${featured ? 'text-2xl md:text-4xl' : 'text-lg'}`}>{e.title}</h3>
          <p className={`mt-3 text-gray-500 ${featured ? 'line-clamp-4 text-base leading-relaxed' : 'line-clamp-2 text-sm'}`}>{e.description}</p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 text-sm">
            <div className="flex flex-wrap items-center gap-4 text-gray-500">
              <span className="flex items-center gap-1.5"><MapPin size={14} />{e.district || e.city}</span>
              <span className="flex items-center gap-1.5"><Clock size={14} />{e.duration}</span>
            </div>
            <span className="font-bold text-anthracite">{e.priceText}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
