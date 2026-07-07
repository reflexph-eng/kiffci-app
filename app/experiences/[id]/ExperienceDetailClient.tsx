'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getExperienceById, markExperienceCompleted, getCompletedIds, trackExperienceView } from '@/lib/firestore';
import { Experience } from '@/types';
import { useAuth } from '@/context/AuthContext';
import FavoriteButton from '@/components/FavoriteButton';
import AdSlot from '@/components/AdSlot';
import ShareButton from '@/components/ShareButton';
import Reviews from '@/components/Reviews';
import { ArrowLeft, MapPin, Clock, Star, Sun, Tag, Users, MessageCircle, Phone, Navigation, ExternalLink, CheckCircle } from 'lucide-react';

export default function ExperienceDetailClient() {
  const { id } = useParams<{ id: string }>();
  const { appUser, refreshUser } = useAuth();
  const router = useRouter();

  const [exp,       setExp]       = useState<Experience | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [completed, setCompleted] = useState(false);
  const [marking,   setMarking]   = useState(false);
  const [toast,     setToast]     = useState('');

  useEffect(() => {
    if (!id) return;
    getExperienceById(id as string)
      .then((e) => {
        setExp(e);
        if (!e) router.replace('/experiences');
        else trackExperienceView(e.id).catch(() => {});
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    if (!appUser || !id) return;
    getCompletedIds(appUser.uid).then((ids) => setCompleted(ids.includes(id as string)));
  }, [appUser, id]);

  async function handleComplete() {
    if (!appUser) { router.push('/login'); return; }
    setMarking(true);
    try {
      const { alreadyDone, pointsEarned } = await markExperienceCompleted(appUser.uid, id as string);
      if (alreadyDone) {
        setToast('Déjà validée !');
      } else {
        setCompleted(true);
        setToast(`+${pointsEarned} points ! Bravo 🎉`);
        await refreshUser();
      }
    } catch (err) {
      console.error('markExperienceCompleted a échoué :', err);
      setToast('Erreur. Réessaie.');
    } finally {
      setMarking(false);
      setTimeout(() => setToast(''), 3000);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-solar border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!exp) return null;

  const profileLabels: Record<string, string> = {
    solo: '🧑 Solo', couple: '💑 Couple', famille: '👨‍👩‍👧 Famille', amis: '👥 Amis',
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-anthracite text-white px-5 py-3 rounded-2xl shadow-soft font-semibold animate-fadeUp">
          {toast}
        </div>
      )}

      <Link href="/experiences" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-solar transition mb-6">
        <ArrowLeft size={16} /> Retour aux expériences
      </Link>

      <div className="h-80 md:h-96 rounded-[2rem] bg-cover bg-center shadow-soft relative overflow-hidden"
        style={{ backgroundImage: `url(${exp.images[0] ?? ''})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
          {exp.isPremium && <span className="bg-solar text-white text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1"><Star size={13} fill="currentColor" /> Premium</span>}
          {exp.isFree    && <span className="bg-tropical text-white text-sm font-bold px-3 py-1.5 rounded-full">Gratuit</span>}
        </div>
        <div className="absolute top-4 right-4">
          <FavoriteButton experienceId={exp.id} />
        </div>
        <div className="absolute bottom-4 left-4 text-white">
          <p className="text-sm opacity-80">{exp.district}, {exp.city}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-[1.5fr_.8fr] gap-8 mt-8">
        <section>
          <span className="text-sm font-bold text-solar bg-solar/10 px-3 py-1.5 rounded-full">{exp.category}</span>
          <h1 className="font-display font-bold text-4xl mt-4 text-anthracite">{exp.title}</h1>
          <p className="text-lg text-gray-600 mt-5 leading-relaxed">{exp.description}</p>

          <div className="mt-8">
            <h2 className="font-display font-bold text-xl mb-3 flex items-center gap-2"><Tag size={18} className="text-solar" /> Tags</h2>
            <div className="flex flex-wrap gap-2">
              {exp.tags.map((t) => (
                <Link key={t} href={`/experiences?query=${t}`}
                  className="bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-700 hover:bg-solar/10 hover:text-solar transition">
                  #{t}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-8">
            <h2 className="font-display font-bold text-xl mb-3 flex items-center gap-2"><Users size={18} className="text-solar" /> Idéal pour</h2>
            <div className="flex flex-wrap gap-2">
              {exp.suitableFor.map((p) => (
                <span key={p} className="bg-sand text-gray-700 rounded-full px-4 py-2 text-sm font-medium">{profileLabels[p] ?? p}</span>
              ))}
            </div>
          </div>
          <div className="mt-8">
            <h2 className="font-display font-bold text-xl mb-3 flex items-center gap-2"><Sun size={18} className="text-solar" /> Meilleur moment</h2>
            <div className="flex flex-wrap gap-2">
              {exp.bestMoment.map((m) => (
                <span key={m} className="border border-gray-200 rounded-full px-4 py-2 text-sm capitalize">{m}</span>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="bg-white rounded-3xl shadow-soft p-6">
            <h3 className="font-display font-bold text-xl mb-4">Infos pratiques</h3>
            <dl className="space-y-3 text-sm">
              {[
                { icon: MapPin, label: 'Lieu',     value: `${exp.district}, ${exp.city}` },
                { icon: Clock,  label: 'Durée',    value: exp.duration },
                { icon: Star,   label: 'Tarif',    value: exp.priceText },
                { icon: Sun,    label: 'Horaires', value: exp.openingHours },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon size={16} className="text-solar mt-0.5 shrink-0" />
                  <div><p className="font-semibold">{label}</p><p className="text-gray-600">{value}</p></div>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid gap-2">
            <a className="bg-tropical text-white rounded-2xl px-5 py-3 text-center font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition"
              href={`https://wa.me/${exp.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={18} /> WhatsApp
            </a>
            <a className="bg-solar text-white rounded-2xl px-5 py-3 text-center font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition"
              href={`tel:${exp.contactPhone}`}>
              <Phone size={18} /> Appeler
            </a>
            <a className="bg-anthracite text-white rounded-2xl px-5 py-3 text-center font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition"
              target="_blank" rel="noopener noreferrer"
              href={`https://www.google.com/maps/search/?api=1&query=${exp.latitude},${exp.longitude}`}>
              <Navigation size={18} /> Itinéraire
            </a>
            {exp.bookingLink && (
              <a className="border-2 border-solar text-solar rounded-2xl px-5 py-3 text-center font-bold flex items-center justify-center gap-2 hover:bg-solar/5 transition"
                target="_blank" rel="noopener noreferrer" href={exp.bookingLink}>
                <ExternalLink size={18} /> Réserver
              </a>
            )}
            <button onClick={handleComplete} disabled={marking || completed}
              className={`rounded-2xl px-5 py-3 font-bold flex items-center justify-center gap-2 transition ${
                completed
                  ? 'bg-tropical/10 text-tropical border border-tropical/30 cursor-default'
                  : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}>
              {marking
                ? <span className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                : completed
                  ? <><CheckCircle size={18} /> Expérience validée ✓</>
                  : <>✅ J'ai vécu cette expérience</>
              }
            </button>
          </div>

          <ShareButton title={exp.title} />

          <AdSlot slotId="detail-sidebar" variant="sidebar" />
        </aside>
      </div>

      <Reviews targetType="experience" targetId={exp.id} targetName={exp.title} />
    </main>
  );
}
