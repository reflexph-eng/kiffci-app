import Link from 'next/link';
import { Experience } from '@/types';
import { Clock, MapPin, Star } from 'lucide-react';
import FavoriteButton from './FavoriteButton';

interface Props {
  e: Experience;
}

export default function ExperienceCard({ e }: Props) {
  return (
    <div className="group bg-white rounded-4xl overflow-hidden shadow-card hover:shadow-soft hover:-translate-y-1 transition-all duration-200 flex flex-col relative">
      {/* Favorite button */}
      <div className="absolute top-3 right-3 z-10">
        <FavoriteButton experienceId={e.id} />
      </div>

      <Link href={`/experiences/${e.id}`} className="flex flex-col flex-1">
        {/* Image */}
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
            style={{ backgroundImage: `url(${e.images[0] ?? ''})` }}
          />
          <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
            {e.isPremium && (
              <span className="bg-solar text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Star size={11} fill="currentColor" /> Premium
              </span>
            )}
            {e.isFree && (
              <span className="bg-tropical text-white text-xs font-bold px-2.5 py-1 rounded-full">Gratuit</span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <span className="text-xs font-bold text-solar bg-solar/10 px-3 py-1 rounded-full self-start mb-2">
            {e.category}
          </span>
          <h3 className="font-display font-bold text-base leading-snug group-hover:text-solar transition-colors line-clamp-2">
            {e.title}
          </h3>
          <p className="mt-2 text-sm text-gray-500 line-clamp-2 flex-1">{e.description}</p>
          <div className="mt-4 flex items-end justify-between">
            <div className="flex flex-col gap-1 text-xs text-gray-500">
              <span className="flex items-center gap-1"><MapPin size={12} className="text-solar" />{e.district}</span>
              <span className="flex items-center gap-1"><Clock size={12} className="text-solar" />{e.duration}</span>
            </div>
            <span className="text-sm font-bold text-tropical">{e.priceText}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
