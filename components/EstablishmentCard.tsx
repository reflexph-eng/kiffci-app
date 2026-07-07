import Link from 'next/link';
import { Establishment } from '@/types';
import { MapPin, Star } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';

export default function EstablishmentCard({ e }: { e: Establishment }) {
  return (
    <Link href={`/establishments/${e.id}`}
      className="group bg-white rounded-4xl overflow-hidden shadow-card hover:shadow-soft hover:-translate-y-1 transition-all duration-200 flex flex-col">
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {e.images[0] ? (
          <img src={e.images[0]} alt={e.name} loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-sand to-orange-100 flex items-center justify-center">
            <img src="/logo.png" alt="" aria-hidden width={56} height={56} className="opacity-30" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          {e.isSponsored && (
            <span className="bg-solar text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Star size={11} fill="currentColor" aria-hidden /> Sponsorisé
            </span>
          )}
          {e.isVerified && <VerifiedBadge />}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <span className="text-xs font-bold text-lagoon bg-lagoon/10 px-3 py-1 rounded-full self-start mb-2">{e.category}</span>
        <h3 className="font-display font-bold text-base leading-snug group-hover:text-solar transition-colors line-clamp-2">{e.name}</h3>
        <p className="mt-2 text-sm text-gray-500 line-clamp-2 flex-1">{e.description}</p>
        <div className="mt-4 flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={12} className="text-solar" aria-hidden />{e.district}, {e.city}
        </div>
      </div>
    </Link>
  );
}
