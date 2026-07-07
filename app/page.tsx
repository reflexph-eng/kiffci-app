'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import ExperienceCard from '@/components/ExperienceCard';
import { getExperiences } from '@/lib/firestore';
import { getApprovedEstablishments, getApprovedEvents } from '@/lib/partner-firestore';
import { Experience, Establishment, KiffEvent } from '@/types';
import { ArrowRight, MapPin, Trophy, BookOpen, Store, Calendar, Shuffle } from 'lucide-react';
import { experiences as localExps } from '@/data/experiences';
import { useCms } from '@/context/CmsContext';

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

            <div className="mt-8 flex gap-3 flex-wrap">
              <Link
                href={settings.heroButtonLink || '/experiences'}
                className="bg-solar text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-orange-600 transition shadow-glow"
              >
                {settings.heroButtonText || 'Explorer'} <ArrowRight size={18} />
              </Link>
              <button
                onClick={handleSurprise}
                className="bg-anthracite text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-800 transition"
              >
                <Shuffle size={18} /> Surprends-moi
              </button>
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

          {/* Card mood */}
          <div className="bg-white rounded-[2.5rem] shadow-soft p-6 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-center gap-3 mb-5">
              <img src="/logo.png" alt="Kiffci" width={52} height={52} style={{ objectFit: 'contain' }} />
              <div>
                <p className="font-display font-bold text-2xl leading-none text-anthracite">kiffci</p>
                <p className="text-gray-400 text-xs tracking-widest">VIS · EXPLORE · KIFFE</p>
              </div>
            </div>
            <div className="h-48 rounded-[2rem] bg-cover bg-center mb-5 relative overflow-hidden"
              style={{ backgroundImage: `url(${settings.heroImageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'})` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-display font-bold text-lg">Côte d'Ivoire</p>
                <p className="text-sm opacity-80">Abidjan & alentours</p>
              </div>
            </div>

            {/* Catégories dynamiques depuis CMS */}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Explorer par catégorie</p>
            <div className="grid grid-cols-2 gap-2">
              {(categories.length > 0 ? categories : [
                { id: '1', name: 'Nature',     icon: '🌿', color: '#10B981', type: 'experience', isVisible: true, order: 1, createdAt: 0 },
                { id: '2', name: 'Culture',    icon: '🎭', color: '#8B5CF6', type: 'experience', isVisible: true, order: 2, createdAt: 0 },
                { id: '3', name: 'Food',       icon: '🍜', color: '#F97316', type: 'experience', isVisible: true, order: 3, createdAt: 0 },
                { id: '4', name: 'Nightlife',  icon: '🌙', color: '#1F2937', type: 'experience', isVisible: true, order: 4, createdAt: 0 },
                { id: '5', name: 'Sport',      icon: '⚡', color: '#EF4444', type: 'experience', isVisible: true, order: 5, createdAt: 0 },
                { id: '6', name: 'Bien-être',  icon: '💆', color: '#06B6D4', type: 'experience', isVisible: true, order: 6, createdAt: 0 },
                { id: '7', name: 'Découverte', icon: '🧭', color: '#F59E0B', type: 'experience', isVisible: true, order: 7, createdAt: 0 },
                { id: '8', name: 'Couple',     icon: '💑', color: '#EC4899', type: 'experience', isVisible: true, order: 8, createdAt: 0 },
              ]).slice(0, 8).map(cat => (
                <Link key={cat.id} href={`/experiences?category=${encodeURIComponent(cat.name)}`}
                  className="border border-gray-100 rounded-2xl px-3 py-2.5 text-sm font-medium hover:bg-solar/5 hover:border-solar/30 hover:text-solar transition text-center flex items-center justify-center gap-1.5">
                  <span>{cat.icon}</span> {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

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
        <section className="max-w-7xl mx-auto px-4 mt-2 animate-fadeUp">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-2xl">Notre recommandation 🎲</h2>
            <button onClick={handleSurprise} className="text-sm text-solar hover:underline flex items-center gap-1">
              <Shuffle size={14} /> Autre
            </button>
          </div>
          <div className="max-w-sm"><ExperienceCard e={rec} /></div>
        </section>
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
