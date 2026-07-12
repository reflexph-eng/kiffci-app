'use client';
/** /establishments/[id] — fiche publique d'un établissement (Sprint 1). */
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, MapPin, Phone, MessageCircle, Globe, Navigation, Star,
} from 'lucide-react';
import {
  getEstablishmentById, trackEstablishmentView, trackWhatsappClick, trackPhoneClick,
} from '@/lib/partner-firestore';
import AdSlot from '@/components/AdSlot';
import ShareButton from '@/components/ShareButton';
import Reviews from '@/components/Reviews';
import VerifiedBadge from '@/components/VerifiedBadge';
import { Establishment, Experience } from '@/types';
import { getExperiences } from '@/lib/firestore';
import ExperienceCard from '@/components/ExperienceCard';

export default function EstablishmentDetailClient() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem]       = useState<Establishment | null>(null);
  const [loading, setLoading] = useState(true);
  const [experiences, setExperiences] = useState<Experience[]>([]);

  useEffect(() => {
    if (!id) return;
    getEstablishmentById(id)
      .then(e => {
        setItem(e);
        if (e) {
          trackEstablishmentView(e.id).catch(() => {});
          getExperiences()
            .then(items => setExperiences(items.filter(exp => exp.linkedEstablishmentId === e.id)))
            .catch(() => {});
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="h-72 bg-gray-100 rounded-4xl animate-pulse mb-6" />
        <div className="h-6 bg-gray-100 rounded-full w-1/2 animate-pulse mb-3" />
        <div className="h-4 bg-gray-100 rounded-full w-full animate-pulse" />
      </main>
    );
  }

  if (!item) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">🏝️</p>
        <h1 className="font-display font-bold text-2xl text-anthracite mb-2">Créateur introuvable</h1>
        <Link href="/establishments" className="inline-block mt-4 bg-solar text-white font-medium px-6 py-3 rounded-2xl hover:bg-orange-600 transition">
          Voir tous les créateurs
        </Link>
      </main>
    );
  }

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <Link href="/establishments" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-solar transition mb-6">
        <ArrowLeft size={16} aria-hidden /> Tous les créateurs
      </Link>

      {/* Galerie */}
      <div className="relative rounded-4xl overflow-hidden mb-8 h-72 md:h-96 bg-gray-100">
        {item.images[0] ? (
          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-sand to-orange-100 flex items-center justify-center">
            <img src="/logo.png" alt="" aria-hidden width={90} className="opacity-30" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
          {item.isSponsored && (
            <span className="bg-solar text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
              <Star size={12} fill="currentColor" aria-hidden /> Sponsorisé
            </span>
          )}
          {item.isVerified && <VerifiedBadge />}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <span className="text-xs font-bold text-lagoon bg-lagoon/10 px-3 py-1 rounded-full">{item.category}</span>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-solar">Créateur d’expériences</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display font-bold text-3xl md:text-4xl text-anthracite">{item.name}</h1>
            {item.isVerified && <span className="bg-tropical/10 text-tropical text-xs font-bold px-3 py-1.5 rounded-full">Partenaire KIFFCI</span>}
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
            <MapPin size={14} className="text-solar" aria-hidden />
            {item.address}, {item.district}, {item.city}
          </p>
          <p className="mt-6 text-gray-700 leading-relaxed whitespace-pre-line">{item.description}</p>

          {item.images.length > 1 && (
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {item.images.slice(1).map((img, i) => (
                <img key={i} src={img} alt={`${item.name} — photo ${i + 2}`} loading="lazy"
                  className="rounded-2xl h-32 w-full object-cover" />
              ))}
            </div>
          )}
        </div>

        {/* Panneau contact */}
        <aside className="bg-white rounded-4xl shadow-card p-6 h-fit md:sticky md:top-24 space-y-3">
          <h2 className="font-display font-bold text-lg text-anthracite mb-1">Contacter le créateur</h2>
          {item.whatsapp && (
            <a href={`https://wa.me/${item.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
              onClick={() => trackWhatsappClick(item.id, 'establishment').catch(() => {})}
              className="flex items-center justify-center gap-2 w-full bg-tropical text-white font-medium py-3 rounded-2xl hover:opacity-90 transition">
              <MessageCircle size={17} aria-hidden /> WhatsApp
            </a>
          )}
          {item.phone && (
            <a href={`tel:${item.phone}`}
              onClick={() => trackPhoneClick(item.id, 'establishment').catch(() => {})}
              className="flex items-center justify-center gap-2 w-full bg-anthracite text-white font-medium py-3 rounded-2xl hover:opacity-90 transition">
              <Phone size={17} aria-hidden /> Appeler
            </a>
          )}
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-lagoon/10 text-lagoon font-medium py-3 rounded-2xl hover:bg-lagoon/20 transition">
            <Navigation size={17} aria-hidden /> Itinéraire
          </a>
          {item.website && (
            <a href={item.website} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-2xl hover:bg-gray-200 transition">
              <Globe size={17} aria-hidden /> Site web
            </a>
          )}

          <ShareButton title={item.name} />

          <AdSlot slotId="detail-sidebar" variant="sidebar" />
        </aside>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-solar">Son univers</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-anthracite">Expériences proposées par {item.name}</h2>
        </div>
        {experiences.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {experiences.map(exp => <ExperienceCard key={exp.id} e={exp} compact />)}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Ce créateur n’a pas encore publié d’expérience.</p>
        )}
      </section>

      <Reviews targetType="establishment" targetId={item.id} targetName={item.name} />
    </main>
  );
}
