'use client';
/** /events/[id] — fiche publique d'un événement (Sprint 1). */
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, MapPin, Phone, MessageCircle, Calendar, Ticket, Star,
} from 'lucide-react';
import {
  getEventById, trackWhatsappClick, trackPhoneClick,
} from '@/lib/partner-firestore';
import AdSlot from '@/components/AdSlot';
import { KiffEvent } from '@/types';

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return iso; }
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem]       = useState<KiffEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getEventById(id).then(setItem).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="h-72 bg-gray-100 rounded-4xl animate-pulse mb-6" />
        <div className="h-6 bg-gray-100 rounded-full w-1/2 animate-pulse" />
      </main>
    );
  }

  if (!item) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">🎉</p>
        <h1 className="font-display font-bold text-2xl text-anthracite mb-2">Événement introuvable</h1>
        <Link href="/events" className="inline-block mt-4 bg-solar text-white font-medium px-6 py-3 rounded-2xl hover:bg-orange-600 transition">
          Voir tous les événements
        </Link>
      </main>
    );
  }

  const sameDay = item.startDate.slice(0, 10) === (item.endDate || item.startDate).slice(0, 10);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <Link href="/events" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-solar transition mb-6">
        <ArrowLeft size={16} aria-hidden /> Tous les événements
      </Link>

      <div className="relative rounded-4xl overflow-hidden mb-8 h-72 md:h-96 bg-gray-100">
        {item.images[0] ? (
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-lagoon/20 to-tropical/20 flex items-center justify-center">
            <img src="/logo.png" alt="" aria-hidden width={90} className="opacity-30" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
        {item.isSponsored && (
          <span className="absolute top-4 left-4 bg-solar text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
            <Star size={12} fill="currentColor" aria-hidden /> Sponsorisé
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <h1 className="font-display font-bold text-3xl md:text-4xl text-anthracite">{item.title}</h1>
          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <Calendar size={15} className="text-solar" aria-hidden />
              {sameDay ? fmtDate(item.startDate) : `Du ${fmtDate(item.startDate)} au ${fmtDate(item.endDate)}`}
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={15} className="text-solar" aria-hidden />
              {item.location}, {item.city}
            </p>
            <p className="flex items-center gap-2">
              <Ticket size={15} className="text-solar" aria-hidden />
              <span className="font-bold text-tropical">{item.price}</span>
            </p>
          </div>
          <p className="mt-6 text-gray-700 leading-relaxed whitespace-pre-line">{item.description}</p>
        </div>

        <aside className="bg-white rounded-4xl shadow-card p-6 h-fit md:sticky md:top-24 space-y-3">
          <h2 className="font-display font-bold text-lg text-anthracite mb-1">Infos & réservation</h2>
          {item.whatsapp && (
            <a href={`https://wa.me/${item.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
              onClick={() => trackWhatsappClick(item.id, 'event').catch(() => {})}
              className="flex items-center justify-center gap-2 w-full bg-tropical text-white font-medium py-3 rounded-2xl hover:opacity-90 transition">
              <MessageCircle size={17} aria-hidden /> WhatsApp
            </a>
          )}
          {item.contactPhone && (
            <a href={`tel:${item.contactPhone}`}
              onClick={() => trackPhoneClick(item.id, 'event').catch(() => {})}
              className="flex items-center justify-center gap-2 w-full bg-anthracite text-white font-medium py-3 rounded-2xl hover:opacity-90 transition">
              <Phone size={17} aria-hidden /> Appeler
            </a>
          )}

          <AdSlot slotId="detail-sidebar" variant="sidebar" />
        </aside>
      </div>
    </main>
  );
}
