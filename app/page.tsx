'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ExperienceCard from '@/components/ExperienceCard';
import { getExperiences } from '@/lib/firestore';
import { getApprovedEstablishments, getApprovedEvents } from '@/lib/partner-firestore';
import { Experience, Establishment, KiffEvent } from '@/types';
import { ArrowRight, Calendar, MapPin, Shuffle, Store, X } from 'lucide-react';
import { experiences as localExps } from '@/data/experiences';
import { useCms } from '@/context/CmsContext';
import AdSlot from '@/components/AdSlot';
import DynamicSections from '@/components/DynamicSections';
import HighlightSections from '@/components/HighlightSections';
import OnboardingModal from '@/components/OnboardingModal';
import SearchBar from '@/components/SearchBar';
import CategoryChips from '@/components/CategoryChips';
import VerifiedBadge from '@/components/VerifiedBadge';

const RAIL_ITEM_CLASS = 'shrink-0 snap-start w-[68%] sm:w-[38%] md:w-[28%] lg:w-[20%] xl:w-[14.8%]';

function HeroTitle({ title }: { title: string }) {
  const normalized = title.trim() || "Que veux-tu vivre aujourd'hui ?";
  const todayMatch = normalized.match(/\s+(aujourd[’']hui\s*\??)$/i);
  const firstLine = todayMatch ? normalized.slice(0, todayMatch.index).trim() : normalized;
  const secondLine = todayMatch ? todayMatch[1] : '';

  const highlightVivre = (text: string) => {
    const parts = text.split(/(vivre)/i);
    return parts.map((part, index) =>
      part.toLowerCase() === 'vivre'
        ? <span key={index} className="text-solar">{part}</span>
        : <span key={index}>{part}</span>
    );
  };

  return (
    <h1 className="mx-auto max-w-5xl font-display text-[clamp(2.65rem,6.1vw,6.4rem)] font-bold leading-[0.94] tracking-[-0.055em]">
      <span className="block whitespace-normal md:whitespace-nowrap">{highlightVivre(firstLine)}</span>
      {secondLine && <span className="mt-1 block">{secondLine}</span>}
    </h1>
  );
}

export default function Home() {
  const { settings, banners, categories, campaigns } = useCms();
  const [exps, setExps] = useState<Experience[]>([]);
  const [ests, setEsts] = useState<Establishment[]>([]);
  const [events, setEvents] = useState<KiffEvent[]>([]);
  const [rec, setRec] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getExperiences(), getApprovedEstablishments(), getApprovedEvents()])
      .then(([experienceItems, establishmentItems, eventItems]) => {
        setExps(experienceItems);
        setEsts(establishmentItems);
        setEvents(eventItems);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleSurprise() {
    const pool = exps.length > 0 ? exps : localExps;
    setRec(pool[Math.floor(Math.random() * pool.length)]);
  }

  const selectedFeatured = settings.featuredExperienceIds.length > 0
    ? exps.filter(e => settings.featuredExperienceIds.includes(e.id))
    : exps.filter(e => e.isPremium || e.isSponsored);
  const featured = (selectedFeatured.length > 0 ? selectedFeatured : exps).slice(0, 14);

  const featuredEsts = settings.featuredEstablishmentIds.length > 0
    ? ests.filter(e => settings.featuredEstablishmentIds.includes(e.id)).slice(0, 14)
    : ests.slice(0, 14);

  if (settings.maintenanceMode) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mb-6 text-6xl">🔧</div>
          <h1 className="mb-4 font-display text-3xl font-bold text-anthracite">Maintenance en cours</h1>
          <p className="text-gray-500">Kiffci est en cours de mise à jour. Reviens dans quelques minutes.</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <OnboardingModal />

      <section className="hero-shell relative isolate min-h-[76svh] overflow-hidden bg-anthracite text-white lg:min-h-[82svh]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${settings.heroImageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=88'})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" aria-hidden="true" />

        <div className="site-container relative flex min-h-[76svh] items-center justify-center py-16 text-center lg:min-h-[82svh] lg:py-24">
          <div className="mx-auto w-full max-w-6xl animate-fadeUp">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-white/80 md:text-sm">
              {settings.heroPromise || "Les meilleures expériences à vivre en Côte d'Ivoire"}
            </p>
            <HeroTitle title={settings.heroTitle} />
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/82 md:text-xl">
              {settings.heroSubtitle}
            </p>

            <div className="mx-auto mt-8 max-w-4xl">
              <SearchBar />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              <Link href={settings.heroButtonLink || '/experiences'} className="inline-flex min-h-11 items-center gap-2 border-b border-white pb-1 text-sm font-bold text-white transition hover:border-solar hover:text-solar">
                {settings.heroButtonText || 'Explorer'} <ArrowRight size={16} />
              </Link>
              <button onClick={handleSurprise} className="inline-flex min-h-11 items-center gap-2 border-b border-white/45 pb-1 text-sm font-semibold text-white/90 transition hover:border-solar hover:text-solar">
                <Shuffle size={16} /> Inspire-moi
              </button>
            </div>

            <div className="mx-auto mt-7 max-w-4xl">
              <CategoryChips categories={categories} />
            </div>
          </div>
        </div>
      </section>

      <section className="site-container page-section pb-8 lg:pb-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-solar">À découvrir maintenant</p>
            <h2 className="section-heading font-display font-bold">Expériences à vivre</h2>
          </div>
          <Link href="/experiences" className="flex shrink-0 items-center gap-1 text-sm font-semibold text-solar transition-all hover:gap-2">
            Tout voir <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden" aria-label="Chargement des expériences">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className={RAIL_ITEM_CLASS} aria-hidden="true">
                <div className="skeleton aspect-square" />
                <div className="mt-3 skeleton h-4 w-1/3 rounded" />
                <div className="mt-2 skeleton h-5 w-4/5 rounded" />
              </div>
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="relative -mx-4 px-4">
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 scrollbar-none">
              {featured.map(e => (
                <div key={e.id} className={RAIL_ITEM_CLASS}>
                  <ExperienceCard e={e} compact />
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute right-0 top-0 hidden h-[calc(100%-12px)] w-12 bg-gradient-to-l from-white to-transparent sm:block" />
          </div>
        ) : (
          <div className="py-10 text-center text-gray-400">
            <p>Aucune expérience. <Link href="/admin" className="text-solar hover:underline">Injecte les données démo →</Link></p>
          </div>
        )}
      </section>

      <HighlightSections />
      <DynamicSections />

      {featuredEsts.length > 0 && (
        <section className="site-container py-8 lg:py-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-solar">Celles et ceux qui font vivre la Côte d’Ivoire</p>
              <h2 className="section-heading font-display font-bold">Créateurs d’expériences à découvrir</h2>
            </div>
            <Link href="/establishments" className="flex shrink-0 items-center gap-1 text-sm font-semibold text-solar transition-all hover:gap-2">
              Tout voir <ArrowRight size={16} />
            </Link>
          </div>

          <div className="relative -mx-4 px-4">
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 scrollbar-none">
              {featuredEsts.map(est => (
                <Link key={est.id} href={est.ownerId ? `/annonceurs/${est.ownerId}` : `/establishments/${est.id}`} className={`${RAIL_ITEM_CLASS} group border-b border-gray-200 pb-4`}>
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {est.images[0] ? (
                      <img src={est.images[0]} alt={est.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-sand to-orange-100">
                        <img src="/logo.png" alt="" aria-hidden width={56} height={56} className="opacity-30" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
                    {est.isVerified && <div className="absolute bottom-3 right-3"><VerifiedBadge /></div>}
                  </div>
                  <div className="pt-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-solar">{est.category}</p>
                    <h3 className="mt-1 line-clamp-2 font-display text-sm font-bold leading-snug text-anthracite transition-colors group-hover:text-solar md:text-[15px]">{est.ownerName || est.name}</h3>
                    <p className="mt-2 flex items-center gap-1 border-t border-gray-100 pt-2 text-xs text-gray-500">
                      <MapPin size={12} /> {est.district}, {est.city}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="pointer-events-none absolute right-0 top-0 hidden h-[calc(100%-12px)] w-12 bg-gradient-to-l from-white to-transparent sm:block" />
          </div>
        </section>
      )}

      <div className="site-container py-6">
        <AdSlot slotId="home-hero-bas" variant="banner" />
      </div>

      {banners.length > 0 && (
        <section className="site-container py-8 lg:py-12">
          <div className="grid gap-4 md:grid-cols-2">
            {banners.slice(0, 2).map(banner => (
              <div key={banner.id} className="relative h-40 overflow-hidden bg-anthracite">
                {banner.imageUrl && <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url(${banner.imageUrl})` }} />}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                <div className="relative flex h-full flex-col justify-between p-6">
                  <div>
                    <h3 className="font-display text-lg font-bold leading-tight text-white">{banner.title}</h3>
                    {banner.subtitle && <p className="mt-1 text-sm text-white/75">{banner.subtitle}</p>}
                  </div>
                  {banner.buttonText && (
                    <Link href={banner.buttonLink || '#'} className="self-start bg-solar px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-600">
                      {banner.buttonText} →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {campaigns.length > 0 && (() => {
        const campaign = campaigns[0];
        return (
          <section className="site-container pb-8">
            <div className="relative h-52 overflow-hidden bg-tropical">
              {campaign.imageUrl && <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: `url(${campaign.imageUrl})` }} />}
              <div className="absolute inset-0 bg-gradient-to-r from-tropical/90 to-tropical/40" />
              <div className="relative flex h-full items-center p-8">
                <div>
                  <span className="mb-3 inline-block bg-white/20 px-3 py-1 text-xs font-bold text-white">Campagne · {campaign.endDate}</span>
                  <h3 className="mb-2 font-display text-3xl font-bold text-white">{campaign.title}</h3>
                  <p className="max-w-md text-sm text-white/80">{campaign.description}</p>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      <div className="site-container pb-4">
        <AdSlot slotId="home-milieu" variant="banner" />
      </div>

      <section className="site-container py-10 lg:py-16">
        <div className="border border-tropical/20 bg-gradient-to-r from-tropical/10 to-lagoon/10 p-8">
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 bg-tropical/15 px-4 py-1.5 text-sm font-semibold text-tropical">🤝 Espace Partenaires</div>
              <h2 className="mb-3 font-display text-3xl font-bold text-anthracite">Tu proposes une expérience à vivre ?</h2>
              <p className="text-sm leading-relaxed text-gray-600">Restaurants, hôtels, guides, artisans et organisateurs : crée ton compte annonceur, présente ton établissement ou ton activité, puis publie toutes les expériences que le public peut vivre avec toi.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/partner/create-establishment" className="group flex items-center gap-3 border border-tropical/20 bg-white p-4 transition hover:border-tropical hover:shadow-soft">
                <div className="flex h-10 w-10 items-center justify-center bg-tropical/10 transition group-hover:bg-tropical"><Store size={18} className="text-tropical group-hover:text-white" /></div>
                <div><p className="text-sm font-bold text-anthracite">Créer mon profil annonceur</p><p className="text-xs text-gray-500">Établissement, guide ou activité indépendante</p></div>
                <ArrowRight size={16} className="ml-auto text-gray-400 transition group-hover:text-tropical" />
              </Link>
              <Link href="/partner/dashboard" className="group flex items-center gap-3 border border-lagoon/20 bg-white p-4 transition hover:border-lagoon hover:shadow-soft">
                <div className="flex h-10 w-10 items-center justify-center bg-lagoon/10 transition group-hover:bg-lagoon"><Calendar size={18} className="text-lagoon group-hover:text-white" /></div>
                <div><p className="text-sm font-bold text-anthracite">Publier une expérience</p><p className="text-xs text-gray-500">Gastronomie, culture, nature, loisirs…</p></div>
                <ArrowRight size={16} className="ml-auto text-gray-400 transition group-hover:text-lagoon" />
              </Link>
              <p className="text-center text-xs text-gray-400">Publication gratuite · Validation sous 24h</p>
            </div>
          </div>
        </div>
      </section>

      {rec && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 px-4 pb-4 animate-fadeUp sm:items-center">
          <div className="relative w-full max-w-sm bg-white p-6">
            <button onClick={() => setRec(null)} aria-label="Fermer" className="absolute right-4 top-4 z-10 text-gray-300 transition hover:text-gray-500"><X size={18} /></button>
            <h2 className="mb-4 pr-8 font-display text-xl font-bold">Notre recommandation 🎲</h2>
            <ExperienceCard e={rec} />
            <div className="mt-4 flex gap-3">
              <button onClick={handleSurprise} className="flex-1 bg-gray-100 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"><Shuffle size={14} className="mr-1.5 inline" />Une autre</button>
              <button onClick={() => setRec(null)} className="flex-1 bg-anthracite py-2.5 text-sm font-medium text-white transition hover:opacity-90">Fermer</button>
            </div>
          </div>
        </div>
      )}

      <section className="site-container pb-16">
        <div className="relative overflow-hidden bg-anthracite p-10 text-white md:p-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(249,115,22,0.2)_0%,_transparent_60%)]" />
          <div className="absolute right-8 top-6 opacity-20"><img src="/logo.png" alt="" width={80} style={{ objectFit: 'contain', filter: 'brightness(10)' }} /></div>
          <div className="relative max-w-2xl">
            <h2 className="mb-4 font-display text-4xl font-bold">Collecte des expériences,<br />gagne des points 🏆</h2>
            <p className="mb-8 text-gray-300">Valide chaque expérience, monte de niveau et débloque des badges exclusifs Kiffci.</p>
            <Link href="/passport" className="inline-flex items-center gap-2 bg-solar px-6 py-3.5 font-bold text-white transition hover:bg-orange-600">Voir mon passeport <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
