'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import ExperienceCard from '@/components/ExperienceCard';
import EstablishmentCard from '@/components/EstablishmentCard';
import EventCard from '@/components/EventCard';
import { getExperiences } from '@/lib/firestore';
import { getApprovedEstablishments, getApprovedEvents } from '@/lib/partner-firestore';
import { Experience, Establishment, KiffEvent } from '@/types';
import { ArrowRight, MapPin, Trophy, BookOpen, Store, Calendar, Shuffle, X, Heart, Users, Sparkles } from 'lucide-react';
import { experiences as localExps } from '@/data/experiences';
import { useCms } from '@/context/CmsContext';
import AdSlot from '@/components/AdSlot';
import DynamicSections from '@/components/DynamicSections';
import OnboardingModal from '@/components/OnboardingModal';
import SearchBar from '@/components/SearchBar';
import CategoryChips from '@/components/CategoryChips';
import { byHighlightRank, getEditorialBadgeFromHighlight, isHighlightActive } from '@/lib/highlights';

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

  const experiencePool = exps.length > 0 ? exps : localExps;

  // Mises en avant pilotées par l'admin, avec fallback CMS/existant.
  const activeHighlightedExperiences = experiencePool.filter(isHighlightActive).sort(byHighlightRank);
  const activeHighlightedEsts = ests.filter(isHighlightActive).sort(byHighlightRank);
  const activeHighlightedEvents = events.filter(isHighlightActive).sort(byHighlightRank);

  const sectionExperiences = (section: 'trending' | 'favorite' | 'family' | 'weekend' | 'nearby') =>
    activeHighlightedExperiences.filter(e => e.highlightSections?.includes(section)).slice(0, 6);

  const featured = activeHighlightedExperiences.length > 0
    ? activeHighlightedExperiences.slice(0, 6)
    : settings.featuredExperienceIds.length > 0
      ? experiencePool.filter(e => settings.featuredExperienceIds.includes(e.id)).slice(0, 6)
      : experiencePool.filter(e => e.isPremium || e.isSponsored).slice(0, 6);

  const editorialExperiences = featured.length > 0 ? featured : experiencePool.slice(0, 6);

  const trending = sectionExperiences('trending').length > 0
    ? sectionExperiences('trending').slice(0, 3)
    : [...experiencePool].sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0)).slice(0, 3);

  const family = sectionExperiences('family').length > 0
    ? sectionExperiences('family').slice(0, 3)
    : experiencePool.filter(e => /famille|enfant|kids|nature|culture|plage/i.test(`${e.title} ${e.category} ${e.description}`)).slice(0, 3);

  const featuredEsts = activeHighlightedEsts.length > 0
    ? activeHighlightedEsts.slice(0, 3)
    : settings.featuredEstablishmentIds.length > 0
      ? ests.filter(e => settings.featuredEstablishmentIds.includes(e.id)).slice(0, 3)
      : ests.slice(0, 3);

  const featuredEvts = activeHighlightedEvents.length > 0
    ? activeHighlightedEvents.slice(0, 3)
    : settings.featuredEventIds.length > 0
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

      {/* ── Hero premium centré — patch visuel Sprint 1.2 ── */}
      <section className="relative overflow-hidden bg-ivory min-h-[690px] md:min-h-[720px]">
        {/* Image de fond locale : remplace simplement /public/homepage/hero-bg.jpg pour changer le visuel */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: "url('/homepage/hero-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/38 via-white/22 to-white/66 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(249,115,22,0.08)_0%,_transparent_58%)] pointer-events-none" />

        <div className="relative w-full max-w-7xl mx-auto px-4 pt-14 pb-12 md:pt-16 md:pb-16 text-center animate-fadeUp">
          {/* Titre depuis CMS, affiché sur une ligne en desktop */}
          <h1 className="font-display font-bold text-[clamp(2.35rem,4.8vw,4.9rem)] leading-[0.98] tracking-tight text-anthracite md:whitespace-nowrap mx-auto max-w-[1180px]">
            {settings.heroTitle.split(' ').map((word, i) => (
              <span key={i}>
                {word.toLowerCase().includes('vivre') ? <span className="text-solar">{word}</span> : word}{' '}
              </span>
            ))}
          </h1>

          {/* Sous-titre centré */}
          <p className="mt-5 md:mt-6 text-base sm:text-lg md:text-xl font-medium text-gray-700 max-w-3xl mx-auto leading-relaxed">
            {settings.heroSubtitle}
          </p>

          {/* Recherche centrale */}
          <div className="mt-7 md:mt-8 max-w-4xl mx-auto flex justify-center">
            <SearchBar />
          </div>

          {/* CTA en liens transparents : hover uniquement */}
          <div className="mt-5 md:mt-6 flex gap-4 flex-wrap items-center justify-center">
            <Link
              href={settings.heroButtonLink || '/experiences'}
              className="group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm md:text-base font-semibold text-anthracite hover:bg-white/80 hover:shadow-sm hover:text-solar hover:-translate-y-0.5 transition-all duration-200"
            >
              {settings.heroButtonText || 'Explorer'}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <button
              onClick={handleSurprise}
              className="group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm md:text-base font-semibold text-anthracite hover:bg-white/80 hover:shadow-sm hover:text-solar hover:-translate-y-0.5 transition-all duration-200"
            >
              <Shuffle size={16} className="transition-transform group-hover:rotate-12" />
              Surprends-moi
            </button>
          </div>

          {/* Bande blanche premium : accès rapide aux catégories */}
          <div className="mt-8 md:mt-10 max-w-6xl mx-auto rounded-[1.75rem] bg-white/95 border border-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.10)] px-2.5 py-2.5 backdrop-blur">
            <CategoryChips categories={categories} />
          </div>

          <div className="mt-12 md:mt-16 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 bg-white/40 backdrop-blur-[2px] rounded-[2rem] md:bg-white/25">
            {[
              { value: '25+', label: 'Catégories', icon: BookOpen },
              { value: '5',   label: 'Villes couvertes', icon: MapPin },
              { value: '8',   label: 'Expériences uniques', icon: Sparkles },
              { value: '1000+', label: 'Sorties possibles', icon: Users },
            ].map(({ value, label, icon: Icon }, index) => (
              <div key={label} className={`flex items-center justify-center gap-3 px-4 py-4 ${index > 0 ? 'md:border-l md:border-gray-200/80' : ''}`}>
                <div className="w-11 h-11 rounded-full bg-white/70 flex items-center justify-center shadow-sm">
                  <Icon size={18} className="text-solar" />
                </div>
                <div className="text-left">
                  <p className="font-display font-bold text-xl md:text-2xl leading-none text-anthracite">{value}</p>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">{label}</p>
                </div>
              </div>
            ))}
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
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-semibold text-solar mb-1 flex items-center gap-1.5"><Sparkles size={15} /> Tendances cette semaine</p>
            <h2 className="font-display font-bold text-3xl text-anthracite">Expériences populaires</h2>
            <p className="text-gray-500 text-sm mt-1">Des idées simples pour sortir, respirer et redécouvrir la Côte d’Ivoire.</p>
          </div>
          <Link href="/experiences" className="text-anthracite font-semibold text-sm flex items-center gap-1 hover:text-solar transition">
            Tout voir <ArrowRight size={16} />
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-10 h-10 border-4 border-solar border-t-transparent rounded-full animate-spin" />
          </div>
        ) : editorialExperiences.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {editorialExperiences.slice(0, 6).map((e, index) => (
              <ExperienceCard key={e.id} e={e} badge={getEditorialBadgeFromHighlight(e) ?? (index === 0 ? 'top10' : index === 1 ? 'coupdecoeur' : index === 2 ? 'tendance' : undefined)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p>Aucune expérience. <Link href="/admin" className="text-solar hover:underline">Injecte les données démo →</Link></p>
          </div>
        )}
      </section>

      {trending.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <div className="rounded-[2rem] bg-white border border-gray-100 shadow-card p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-sm font-semibold text-lagoon mb-1 flex items-center gap-1.5"><Heart size={15} /> Coups de cœur KIFFCI</p>
                <h2 className="font-display font-bold text-2xl text-anthracite">À tester en priorité</h2>
              </div>
              <Link href="/experiences" className="hidden sm:flex text-sm font-semibold text-anthracite hover:text-solar transition items-center gap-1">Explorer <ArrowRight size={15} /></Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {trending.map((e, index) => <ExperienceCard key={e.id} e={e} badge={getEditorialBadgeFromHighlight(e) ?? (index === 0 ? 'coupdecoeur' : 'tendance')} />)}
            </div>
          </div>
        </section>
      )}

      {family.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-sm font-semibold text-tropical mb-1 flex items-center gap-1.5"><Users size={15} /> En famille</p>
              <h2 className="font-display font-bold text-3xl text-anthracite">Des sorties faciles à organiser</h2>
            </div>
            <Link href="/experiences" className="text-anthracite font-semibold text-sm flex items-center gap-1 hover:text-solar transition">Voir plus <ArrowRight size={16} /></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {family.map(e => <ExperienceCard key={e.id} e={e} badge="nouveau" />)}
          </div>
        </section>
      )}

      {/* ── Établissements mis en avant ── */}
      {featuredEsts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-sm font-semibold text-solar mb-1">Près de vous</p>
              <h2 className="font-display font-bold text-3xl text-anthracite">Établissements à découvrir</h2>
              <p className="text-gray-500 text-sm mt-1">Restaurants, hôtels, plages et lieux validés pour vos prochaines sorties.</p>
            </div>
            <Link href="/establishments" className="text-anthracite font-semibold text-sm flex items-center gap-1 hover:text-solar transition">
              Tout voir <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEsts.map((est, index) => (
              <EstablishmentCard key={est.id} e={est} badge={getEditorialBadgeFromHighlight(est) ?? (index === 0 ? 'coupdecoeur' : index === 1 ? 'tendance' : 'nouveau')} />
            ))}
          </div>
        </section>
      )}

      {/* ── Événements mis en avant ── */}
      {featuredEvts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-sm font-semibold text-lagoon mb-1">Sorties du week-end</p>
              <h2 className="font-display font-bold text-3xl text-anthracite">Événements à ne pas manquer</h2>
              <p className="text-gray-500 text-sm mt-1">Les rendez-vous qui donnent envie de réserver son agenda.</p>
            </div>
            <Link href="/events" className="text-anthracite font-semibold text-sm flex items-center gap-1 hover:text-solar transition">
              Tout voir <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvts.map((event, index) => (
              <EventCard key={event.id} e={event} badge={getEditorialBadgeFromHighlight(event) ?? (index === 0 ? 'top10' : index === 1 ? 'tendance' : 'nouveau')} />
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
