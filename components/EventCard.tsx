import Link from 'next/link';
import { KiffEvent } from '@/types';
import { MapPin, Calendar, Star } from 'lucide-react';

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

export default function EventCard({ e }: { e: KiffEvent }) {
  return (
    <Link href={`/events/${e.id}`}
      className="group bg-white rounded-4xl overflow-hidden shadow-card hover:shadow-soft hover:-translate-y-1 transition-all duration-200 flex flex-col">
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {e.images[0] ? (
          <img src={e.images[0]} alt={e.title} loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-lagoon/20 to-tropical/20 flex items-center justify-center">
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
        </div>
        <span className="absolute bottom-3 left-3 bg-white/95 text-anthracite text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <Calendar size={12} className="text-solar" aria-hidden />{fmtDate(e.startDate)}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-bold text-base leading-snug group-hover:text-solar transition-colors line-clamp-2">{e.title}</h3>
        <p className="mt-2 text-sm text-gray-500 line-clamp-2 flex-1">{e.description}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1"><MapPin size={12} className="text-solar" aria-hidden />{e.city}</span>
          <span className="font-bold text-tropical">{e.price}</span>
        </div>
      </div>
    </Link>
  );
}
