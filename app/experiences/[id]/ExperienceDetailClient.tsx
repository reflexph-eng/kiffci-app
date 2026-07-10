'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getExperienceById, getExperiences, markExperienceCompleted, markExperienceCompletedWithCode, getCompletedRecords, trackExperienceView } from '@/lib/firestore';
import { Experience } from '@/types';
import { useAuth } from '@/context/AuthContext';
import FavoriteButton from '@/components/FavoriteButton';
import AdSlot from '@/components/AdSlot';
import ShareButton from '@/components/ShareButton';
import Reviews from '@/components/Reviews';
import { ArrowLeft, MapPin, Clock, Star, Sun, Tag, Users, MessageCircle, Phone, Navigation, ExternalLink, CheckCircle, ShieldCheck, KeyRound, X, Sparkles, ListChecks, HeartHandshake } from 'lucide-react';

export default function ExperienceDetailClient() {
  const { id } = useParams<{ id: string }>();
  const { appUser, refreshUser } = useAuth();
  const router = useRouter();

  const [exp,       setExp]       = useState<Experience | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [status,    setStatus]    = useState<'none' | 'declaration' | 'code'>('none');
  const [marking,   setMarking]   = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [codeValue, setCodeValue] = useState('');
  const [codeError, setCodeError] = useState('');
  const [toast,     setToast]     = useState('');
  const [related,   setRelated]   = useState<Experience[]>([]);

  useEffect(() => {
    if (!id) return;
    getExperienceById(id as string)
      .then((e) => {
        setExp(e);
        if (!e) router.replace('/experiences');
        else {
          trackExperienceView(e.id).catch(() => {});
          getExperiences().then(items => setRelated(items.filter(item => item.id !== e.id && (item.category === e.category || item.city === e.city)).slice(0, 3))).catch(() => {});
        }
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    if (!appUser || !id) return;
    getCompletedRecords(appUser.uid).then((records) => {
      const rec = records.find(r => r.experienceId === id);
      setStatus(rec ? (rec.verified ? 'code' : 'declaration') : 'none');
    });
  }, [appUser, id]);

  async function handleComplete() {
    if (!appUser) { router.push('/login'); return; }
    setMarking(true);
    try {
      const { alreadyDone, pointsEarned } = await markExperienceCompleted(appUser.uid, id as string);
      if (alreadyDone) {
        setToast('Déjà validée !');
      } else {
        setStatus('declaration');
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

  async function handleCodeSubmit() {
    if (!appUser || !codeValue.trim()) return;
    setMarking(true); setCodeError('');
    try {
      const { alreadyDone, pointsEarned, invalidCode, isRepeatVisit } = await markExperienceCompletedWithCode(appUser.uid, id as string, codeValue);
      if (invalidCode) {
        setCodeError('Code invalide. Vérifie auprès du partenaire sur place.');
      } else if (alreadyDone) {
        setToast('Déjà validée !');
        setShowCodeInput(false);
      } else {
        setStatus('code');
        setToast(isRepeatVisit ? `+${pointsEarned} points ! Merci de ta fidélité 🎉` : `+${pointsEarned} points ! Passage certifié 🎉`);
        setShowCodeInput(false);
        setCodeValue('');
        await refreshUser();
      }
    } catch (err) {
      console.error('markExperienceCompletedWithCode a échoué :', err);
      setCodeError('Erreur. Réessaie.');
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

      <div className="mt-8 border-b border-gray-200 pb-8">
        <p className="max-w-3xl text-xs font-bold uppercase tracking-[0.22em] text-solar">Une expérience à vivre</p>
        <h1 className="mt-3 max-w-4xl font-display text-4xl font-bold leading-tight text-anthracite md:text-6xl">{exp.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-gray-600">{exp.description}</p>
      </div>

      <div className="grid md:grid-cols-[1.5fr_.8fr] gap-8 mt-8">
        <section>
          <span className="text-sm font-bold text-solar bg-solar/10 px-3 py-1.5 rounded-full">{exp.category}</span>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="border-t-2 border-solar pt-4"><Sparkles className="text-solar" size={20}/><h2 className="mt-3 font-display font-bold">Pourquoi tu vas aimer</h2><p className="mt-2 text-sm leading-relaxed text-gray-500">Une proposition choisie pour son ambiance, son caractère et le souvenir qu’elle peut créer.</p></div>
            <div className="border-t-2 border-tropical pt-4"><ListChecks className="text-tropical" size={20}/><h2 className="mt-3 font-display font-bold">À quoi t’attendre</h2><p className="mt-2 text-sm leading-relaxed text-gray-500">{exp.duration} pour profiter pleinement, à {exp.district || exp.city}, dans une ambiance {exp.mood.slice(0,2).join(' et ') || 'authentique'}.</p></div>
            <div className="border-t-2 border-lagoon pt-4"><HeartHandshake className="text-lagoon" size={20}/><h2 className="mt-3 font-display font-bold">Le bon conseil</h2><p className="mt-2 text-sm leading-relaxed text-gray-500">Prévois ton passage au meilleur moment indiqué et contacte l’annonceur avant de te déplacer si nécessaire.</p></div>
          </div>

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
            {status === 'none' ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <button onClick={handleComplete} disabled={marking}
                  className="rounded-2xl px-5 py-3 font-bold flex items-center justify-center gap-2 transition border border-gray-200 text-gray-700 hover:bg-gray-50">
                  {marking
                    ? <span className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    : <>✅ J'ai vécu cette expérience</>}
                </button>
                {exp.linkedEstablishmentId && (
                  <button onClick={() => setShowCodeInput(true)}
                    className="rounded-2xl px-5 py-3 font-bold flex items-center justify-center gap-2 transition bg-lagoon/10 text-lagoon border border-lagoon/30 hover:bg-lagoon/20">
                    <KeyRound size={16} /> Valider avec un code
                  </button>
                )}
              </div>
            ) : status === 'code' ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <button disabled
                  className="rounded-2xl px-5 py-3 font-bold flex items-center justify-center gap-2 bg-lagoon/10 text-lagoon border border-lagoon/30 cursor-default">
                  <ShieldCheck size={18} /> Vécu et certifié ✓
                </button>
                {exp.linkedEstablishmentId && (
                  <button onClick={() => setShowCodeInput(true)}
                    className="rounded-2xl px-5 py-3 font-medium flex items-center justify-center gap-2 transition bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm">
                    <KeyRound size={15} /> J'y suis retourné(e)
                  </button>
                )}
              </div>
            ) : (
              <button disabled
                className="rounded-2xl px-5 py-3 font-bold flex items-center justify-center gap-2 bg-tropical/10 text-tropical border border-tropical/30 cursor-default">
                <CheckCircle size={18} /> Expérience validée ✓
              </button>
            )}
          </div>

          <ShareButton title={exp.title} />

          <AdSlot slotId="detail-sidebar" variant="sidebar" />
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-gray-200 pt-10">
          <div className="flex items-end justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-solar">Continue l’aventure</p><h2 className="mt-2 font-display text-3xl font-bold text-anthracite">D’autres expériences qui pourraient te plaire</h2></div>
            <Link href="/experiences" className="hidden text-sm font-bold text-solar md:block">Tout explorer →</Link>
          </div>
          <div className="mt-7 grid gap-7 md:grid-cols-3">
            {related.map(item => (
              <Link key={item.id} href={`/experiences/${item.id}`} className="group border-b border-gray-200 pb-5">
                <div className="aspect-[4/3] overflow-hidden bg-gray-100"><div className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${item.images[0] ?? ''})` }} /></div>
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-solar">{item.category}</p>
                <h3 className="mt-2 font-display text-xl font-bold text-anthracite group-hover:text-solar">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{item.district}, {item.city} · {item.priceText}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Reviews targetType="experience" targetId={exp.id} targetName={exp.title} />

      {showCodeInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] px-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 relative">
            <button onClick={() => { setShowCodeInput(false); setCodeError(''); setCodeValue(''); }}
              aria-label="Fermer" className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition">
              <X size={18} />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-lagoon/10 text-lagoon flex items-center justify-center mb-4">
              <KeyRound size={22} />
            </div>
            <h2 className="font-display font-bold text-lg text-anthracite mb-1">Code de passage</h2>
            <p className="text-sm text-gray-500 mb-4">Demande le code affiché sur place à l'établissement partenaire.</p>
            <input value={codeValue} onChange={e => setCodeValue(e.target.value.toUpperCase())}
              placeholder="Ex : A3F9K2" maxLength={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-lagoon outline-none text-center font-mono text-lg tracking-widest uppercase mb-3" />
            {codeError && <p className="text-sm text-red-600 mb-3">{codeError}</p>}
            <button onClick={handleCodeSubmit} disabled={marking || !codeValue.trim()}
              className="w-full bg-lagoon text-white font-medium py-3 rounded-2xl hover:opacity-90 transition disabled:opacity-50">
              {marking ? 'Vérification…' : 'Valider'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
