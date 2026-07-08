'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import ExperienceCard from '@/components/ExperienceCard';
import { getExperiences } from '@/lib/firestore';
import { getApprovedEstablishments, getApprovedEvents } from '@/lib/partner-firestore';
import { Experience, Establishment, KiffEvent } from '@/types';
import { ArrowRight, MapPin, Trophy, BookOpen, Store, Calendar, Shuffle, X } from 'lucide-react';
import { experiences as localExps } from '@/data/experiences';
import { useCms } from '@/context/CmsContext';
import AdSlot from '@/components/AdSlot';
import DynamicSections from '@/components/DynamicSections';
import OnboardingModal from '@/components/OnboardingModal';
import SearchBar from '@/components/SearchBar';
import CategoryChips from '@/components/CategoryChips';

export default function Home() {
  const { settings, banners, categories, campaigns, loading: cmsLoading } = useCms();

  const [exps,    setExps]    = useState<Experience[]>([]);
  const [ests,    setEsts]    = useState<Establishment[]>([]);
  const [events,  setEvents]  = useState<KiffEvent[]>([]);
  const [rec,     setRec]     = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getExperiences(),
      getApprovedEstablishments(),
      getApprovedEvents(),
    ]).then(([e, est, ev]) => {
      setExps(e); setEsts(est); setEvents(ev);
    }).finally(() => setLoading(false));
  }, []);

  function handleSurprise() {
    const pool = exps.length > 0 ? exps : localExps;
    setRec(pool[Math.floor(Math.random() * pool.length)]);
  }

  // Expériences mises en avant (IDs depuis CMS, sinon premium)
  const featured = settings.featuredExperienceIds.length > 0
    ? exps.filter(e => settings.featuredExperienceIds.includes(e.id)).slice(0, 6)
    : exps.filter(e => e.isPremium || e.isSponsored).slice(0, 6);

  // Établissements mis en avant
  const featuredEsts = settings.featuredEstablishmentIds.length > 0
    ? ests.filter(e => settings.featuredEstablishmentIds.includes(e.id)).slice(0, 3)
    : ests.slice(0, 3);

  // Événements mis en avant
  const featuredEvts = settings.featuredEventIds.length > 0
    ? events.filter(e => settings.featuredEventIds.includes(e.id)).slice(0, 3)
    : events.slice(0, 3);

  // Mode maintenance
  if (settings.maintenanceMode) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🔧</div>
          <h1 className="font-display font-bold text-3xl text-anthracite mb-4">Maintenance en cours</h1>
          <p className="text-gray-500">Kiffci est en cours de mise à jour. Reviens dans quelques minutes.</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <OnboardingModal />

      {/* ── Hero dynamique depuis CMS ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ivory via-white to-orange-50">
        {/* Image hero depuis CMS */}
        {settings.heroImageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{ backgroundImage: `url(${settings.heroImageUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(249,115,22,0.12)_0%,_transparent_60%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center relative">
          <div className="animate-fadeUp">
            <div className="inline-flex items-center gap-2 bg-solar/10 text-solar rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-solar rounded-full animate-pulse" />
              {settings.slogan}
            </div>
            {/* Titre depuis CMS */}
            <h1 className="font-display font-bold text-5xl md:text-7xl leading-[0.95] tracking-tight text-anthracite">
              {settings.heroTitle.split(' ').map((word, i) => (
                <span key={i}>
                  {i === 2 ? <span className="text-solar">{word}</span> : word}{' '}
                </span>
              ))}
            </h1>
            {/* Sous-titre depuis CMS */}
            <p className="mt-6 text-lg text-gray-600 max-w-md">{settings.heroSubtitle}</p>

            {/* Recherche centrale — accès direct sans passer par une carte de catégories */}
            <div className="mt-7">
              <SearchBar />
            </div>

            <div className="mt-5 flex gap-2.5 flex-wrap items-center">
              <Link
                href={settings.heroButtonLink || '/experiences'}
                className="bg-solar text-white text-sm px-5 py-2.5 rounded-xl font-semibold flex items-center gap-1.5 hover:bg-orange-600 transition"
              >
                {settings.heroButtonText || 'Explorer'} <ArrowRight size={15} />
              </Link>
              <button
                onClick={handleSurprise}
                className="text-sm text-anthracite border border-gray-200 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-1.5 hover:border-anthracite/40 hover:bg-gray-50 transition"
              >
                <Shuffle size={15} /> Surprends-moi
              </button>
            </div>

            {/* Catégories rapides en chips, sous les CTA — accès direct sans scroller */}
            <div className="mt-7">
              <CategoryChips categories={categories} />
            </div>

            <div className="mt-10 flex gap-6">
              {[
                { value: '25+', label: 'Expériences', icon: MapPin },
                { value: '5',   label: 'Défis',       icon: Trophy },
                { value: '8',   label: 'Catégories',  icon: BookOpen },
              ].map(({ value, label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-solar/10 flex items-center justify-center">
                    <Icon size={16} className="text-solar" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-lg leading-none">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visuel immersif — remplace l'ancienne carte mockup qui dupliquait les catégories */}
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-soft animate-fadeUp h-[420px] md:h-[520px]" style={{ animationDelay: '0.1s' }}>
            <div className="absolute inset-0 bg-cover bg-center scale-105"
              style={{ backgroundImage: `url(${settings.heroImageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'})` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            <div className="absolute top-5 left-5 flex items-center gap-2.5 bg-white/95 backdrop-blur rounded-2xl px-3.5 py-2 shadow-sm">
              <img src="/logo.png" alt="Kiffci" width={28} height={28} style={{ objectFit: 'contain' }} />
              <p className="font-display font-bold text-sm leading-none text-anthracite">kiffci</p>
            </div>

            <div className="absolute bottom-0 inset-x-0 p-6 text-white">
              <p className="font-display font-bold text-2xl">Côte d'Ivoire</p>
              <p className="text-sm text-white/80 mt-1">Abidjan, Bassam, Yamoussoukro et bien plus à explorer</p>
              <div className="mt-4 flex gap-2 flex-wrap">
                {['🌿 Nature', '🎭 Culture', '🍜 Food'].map(tag => (
                  <span key={tag} className="bg-white/15 backdrop-blur text-xs font-medium px-3 py-1.5 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        <AdSlot slotId="home-hero-bas" variant="banner" />
      </div>

      {/* ── Bannières actives depuis CMS ── */}
      {banners.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-4">
            {banners.slice(0, 2).map(banner => (
              <div key={banner.id} className="relative rounded-3xl overflow-hidden h-40 bg-anthracite">
                {banner.imageUrl && (
                  <div className="absolute inset-0 bg-cover bg-center opacity-60"
                    style={{ backgroundImage: `url(${banner.imageUrl})` }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                <div className="relative p-6 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="font-display font-bold text-white text-lg leading-tight">{banner.title}</h3>
                    {banner.subtitle && <p className="text-white/75 text-sm mt-1">{banner.subtitle}</p>}
                  </div>
                  {banner.buttonText && (
                    <Link href={banner.buttonLink || '#'}
                      className="self-start bg-solar text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-orange-600 transition">
                      {banner.buttonText} →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Campagne active ── */}
      {campaigns.length > 0 && (() => {
        const campaign = campaigns[0];
        return (
          <section className="max-w-7xl mx-auto px-4 pb-4">
            <div className="relative rounded-[2rem] overflow-hidden h-52 bg-tropical">
              {campaign.imageUrl && (
                <div className="absolute inset-0 bg-cover bg-center opacity-50"
                  style={{ backgroundImage: `url(${campaign.imageUrl})` }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-tropical/90 to-tropical/40" />
              <div className="relative p-8 h-full flex items-center">
                <div>
                  <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                    Campagne · {campaign.endDate}
                  </span>
                  <h3 className="font-display font-bold text-white text-3xl mb-2">{campaign.title}</h3>
                  <p className="text-white/80 text-sm max-w-md">{campaign.description}</p>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ── Expériences mises en avant ── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-3xl">Expériences populaires</h2>
          <Link href="/experiences" className="text-solar font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
            Tout voir <ArrowRight size={16} />
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-10 h-10 border-4 border-solar border-t-transparent rounded-full animate-spin" />
          </div>
        ) : featured.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {featured.map(e => <ExperienceCard key={e.id} e={e} />)}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p>Aucune expérience. <Link href="/admin" className="text-solar hover:underline">Injecte les données démo →</Link></p>
          </div>
        )}
      </section>

      {/* ── Établissements mis en avant ── */}
      {featuredEsts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-10">
          <h2 className="font-display font-bold text-3xl mb-6">Établissements à découvrir</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredEsts.map(est => (
              <div key={est.id} className="bg-white rounded-4xl shadow-card overflow-hidden hover:shadow-soft hover:-translate-y-1 transition-all">
                {est.images[0] && (
                  <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${est.images[0]})` }} />
                )}
                <div className="p-5">
                  <span className="text-xs font-bold text-solar bg-solar/10 px-3 py-1 rounded-full">{est.category}</span>
                  <h3 className="font-display font-bold text-lg mt-2">{est.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">📍 {est.district}, {est.city}</p>
                  <a href={`https://wa.me/${est.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-2 text-tropical font-semibold text-sm hover:underline">
                    💬 Contacter
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA passeport ── */}
      {/* ── Rubriques dynamiques (admin) ── */}
      <DynamicSections />

      <div className="max-w-7xl mx-auto px-4">
        <AdSlot slotId="home-milieu" variant="banner" />
      </div>

      {/* ── Section Partenaires ── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-tropical/10 to-lagoon/10 rounded-[2rem] p-8 border border-tropical/20">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-tropical/15 text-tropical rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
                🤝 Espace Partenaires
              </div>
              <h2 className="font-display font-bold text-3xl text-anthracite mb-3">Tu as un établissement ou un événement ?</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Restaurants, hôtels, bars, promoteurs — publie gratuitement sur Kiffci et touche des milliers d'utilisateurs.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/partner/create-establishment"
                className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-tropical/20 hover:border-tropical hover:shadow-soft transition group">
                <div className="w-10 h-10 bg-tropical/10 rounded-xl flex items-center justify-center group-hover:bg-tropical transition">
                  <Store size={18} className="text-tropical group-hover:text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm text-anthracite">Ajouter mon établissement</p>
                  <p className="text-xs text-gray-500">Restaurant, hôtel, bar, spa…</p>
                </div>
                <ArrowRight size={16} className="text-gray-400 ml-auto group-hover:text-tropical transition" />
              </Link>
              <Link href="/partner/create-event"
                className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-lagoon/20 hover:border-lagoon hover:shadow-soft transition group">
                <div className="w-10 h-10 bg-lagoon/10 rounded-xl flex items-center justify-center group-hover:bg-lagoon transition">
                  <Calendar size={18} className="text-lagoon group-hover:text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm text-anthracite">Publier un événement</p>
                  <p className="text-xs text-gray-500">Concert, soirée, expo, sport…</p>
                </div>
                <ArrowRight size={16} className="text-gray-400 ml-auto group-hover:text-lagoon transition" />
              </Link>
              <p className="text-xs text-center text-gray-400">Publication gratuite · Validation sous 24h</p>
            </div>
          </div>
        </div>
      </section>

      {rec && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[70] px-4 pb-4 sm:pb-4 animate-fadeUp">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 relative">
            <button onClick={() => setRec(null)} aria-label="Fermer"
              className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition z-10">
              <X size={18} />
            </button>
            <h2 className="font-display font-bold text-xl mb-4 pr-8">Notre recommandation 🎲</h2>
            <ExperienceCard e={rec} />
            <div className="mt-4 flex gap-3">
              <button onClick={handleSurprise}
                className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 text-gray-700 font-medium py-2.5 rounded-2xl text-sm hover:bg-gray-200 transition">
                <Shuffle size={14} /> Une autre
              </button>
              <button onClick={() => setRec(null)}
                className="flex-1 bg-anthracite text-white font-medium py-2.5 rounded-2xl text-sm hover:opacity-90 transition">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="bg-anthracite rounded-[2.5rem] p-10 md:p-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(249,115,22,0.2)_0%,_transparent_60%)] pointer-events-none" />
          <div className="absolute top-6 right-8 opacity-20">
            <img src="/logo.png" alt="" width={80} style={{ objectFit: 'contain', filter: 'brightness(10)' }} />
          </div>
          <div className="relative max-w-2xl">
            <h2 className="font-display font-bold text-4xl mb-4">Collecte des expériences,<br />gagne des points 🏆</h2>
            <p className="text-gray-300 mb-8">Valide chaque expérience, monte de niveau et débloque des badges exclusifs Kiffci.</p>
            <Link href="/passport" className="inline-flex items-center gap-2 bg-solar text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-orange-600 transition">
              Voir mon passeport <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
