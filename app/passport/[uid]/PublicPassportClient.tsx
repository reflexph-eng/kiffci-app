'use client';
/**
 * Vue publique du Passeport — consultable sans connexion, pensée pour être
 * partagée (WhatsApp, Instagram). Alimentée par publicProfiles/{uid}, un
 * miroir minimal et non sensible du profil (jamais l'email).
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPublicProfile } from '@/lib/firestore';
import { levelFromPoints, BADGE_DEFINITIONS } from '@/lib/utils';
import { PublicProfile } from '@/types';
import ShareButton from '@/components/ShareButton';
import { ArrowRight } from 'lucide-react';

export default function PublicPassportClient({ uid }: { uid: string }) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicProfile(uid).then(setProfile).finally(() => setLoading(false));
  }, [uid]);

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 flex justify-center">
        <div className="w-10 h-10 border-4 border-solar border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">🧭</p>
        <h1 className="font-display font-bold text-2xl text-anthracite mb-2">Passeport introuvable</h1>
        <p className="text-gray-500 mb-6">Ce profil n'existe pas ou n'a pas encore été activé.</p>
        <Link href="/" className="inline-block bg-solar text-white font-medium px-6 py-3 rounded-2xl hover:bg-orange-600 transition">
          Découvrir KiffCI
        </Link>
      </main>
    );
  }

  const { level, next, progress } = levelFromPoints(profile.points);
  const unlockedBadges = profile.badges ?? [];

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-gradient-to-br from-solar via-orange-500 to-tropical text-white rounded-[2.5rem] p-8 shadow-glow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-12" />
        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-white/70 text-sm font-medium">KIFFCI · PASSEPORT</p>
              <p className="text-white/70 text-sm">Côte d'Ivoire</p>
            </div>
            {profile.photoURL ? (
              <img src={profile.photoURL} alt="" className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-display font-bold">
                {profile.displayName?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
          </div>
          <p className="text-white/70 text-sm uppercase tracking-widest mb-1">Niveau actuel</p>
          <h2 className="font-display font-bold text-5xl">{level}</h2>
          <p className="mt-2 text-white/80">{profile.displayName}</p>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { value: profile.points.toLocaleString('fr-FR'), label: 'Points' },
              { value: profile.experiencesCount,                label: 'Expériences' },
              { value: unlockedBadges.length,                   label: 'Badges' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/15 rounded-2xl p-4 text-center">
                <p className="font-display font-bold text-3xl">{value}</p>
                <p className="text-sm text-white/70">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-sm text-white/70 mb-2">
              <span>Progression vers le niveau suivant</span>
              <span>{progress}%</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            {next > 0 && <p className="text-xs text-white/60 mt-1">{Math.max(0, next - profile.points)} points restants</p>}
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-display font-bold text-xl text-anthracite mb-5">
          Badges ({unlockedBadges.length}/{BADGE_DEFINITIONS.length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BADGE_DEFINITIONS.map((b) => {
            const unlocked = unlockedBadges.includes(b.id);
            return (
              <div key={b.id} className={`rounded-3xl p-5 transition ${unlocked ? 'bg-white shadow-card' : 'bg-gray-100 opacity-60 grayscale'}`}>
                <div className="text-3xl mb-2">{b.emoji}</div>
                <h3 className="font-display font-bold text-sm leading-tight">{b.label}</h3>
                {unlocked && <span className="mt-2 inline-block text-xs font-bold text-tropical">✓ Débloqué</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <ShareButton title={`Le passeport KiffCI de ${profile.displayName}`} />
        <Link href="/register"
          className="flex-1 flex items-center justify-center gap-2 bg-solar text-white font-medium py-3 rounded-2xl hover:bg-orange-600 transition">
          Crée le tien <ArrowRight size={17} />
        </Link>
      </div>
    </main>
  );
}
