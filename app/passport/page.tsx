'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { getCompletedIds } from '@/lib/firestore';
import { levelFromPoints, BADGE_DEFINITIONS } from '@/lib/utils';
import ShareButton from '@/components/ShareButton';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

function PassportContent() {
  const { appUser } = useAuth();
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appUser) return;
    getCompletedIds(appUser.uid)
      .then(setCompletedIds)
      .finally(() => setLoading(false));
  }, [appUser]);

  if (!appUser || loading) return (
    <div className="flex justify-center mt-16">
      <div className="w-10 h-10 border-4 border-solar border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { level, next, progress } = levelFromPoints(appUser.points);
  const unlockedBadges = appUser.badges ?? [];

  return (
    <div>
      {/* Passport card */}
      <div className="bg-gradient-to-br from-solar via-orange-500 to-tropical text-white rounded-[2.5rem] p-8 shadow-glow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-12" />
        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-white/70 text-sm font-medium">KIFFCI · PASSEPORT</p>
              <p className="text-white/70 text-sm">Côte d'Ivoire</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-display font-bold">
              {appUser.displayName?.[0]?.toUpperCase() ?? '?'}
            </div>
          </div>
          <p className="text-white/70 text-sm uppercase tracking-widest mb-1">Niveau actuel</p>
          <h2 className="font-display font-bold text-5xl">{level}</h2>
          <p className="mt-2 text-white/80">{appUser.displayName}</p>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { value: appUser.points.toLocaleString('fr-FR'), label: 'Points' },
              { value: completedIds.length,                    label: 'Expériences' },
              { value: unlockedBadges.length,                  label: 'Badges' },
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
            <p className="text-xs text-white/60 mt-1">{Math.max(0, next - appUser.points)} points restants</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <ShareButton title="Mon passeport KiffCI"
          url={typeof window !== 'undefined' ? `${window.location.origin}/passport/${appUser.uid}` : undefined} />
        <Link href={`/passport/${appUser.uid}`} target="_blank"
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-anthracite font-medium py-3 rounded-2xl hover:bg-gray-50 transition text-sm">
          <ExternalLink size={16} /> Voir la version publique
        </Link>
      </div>

      {/* Badges */}
      <div className="mt-12">
        <h2 className="font-display font-bold text-2xl text-anthracite mb-6">
          Badges ({unlockedBadges.length}/{BADGE_DEFINITIONS.length})
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          {BADGE_DEFINITIONS.map((b) => {
            const unlocked = unlockedBadges.includes(b.id);
            return (
              <div key={b.id} className={`rounded-3xl p-5 transition ${unlocked ? 'bg-white shadow-card' : 'bg-gray-100 opacity-60 grayscale'}`}>
                <div className="text-4xl mb-3">{b.emoji}</div>
                <h3 className="font-display font-bold text-sm leading-tight">{b.label}</h3>
                <p className="text-xs text-gray-500 mt-1">{b.description}</p>
                {unlocked && <span className="mt-2 inline-block text-xs font-bold text-tropical">✓ Débloqué</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* How to earn */}
      <div className="mt-12 bg-sand rounded-4xl p-8">
        <h2 className="font-display font-bold text-2xl text-anthracite mb-4">Comment gagner des points ?</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { emoji: '✅', label: 'Valider une expérience', points: '+50 pts' },
            { emoji: '🏆', label: 'Terminer un défi',       points: 'Bonus variable' },
            { emoji: '⭐', label: 'Monter de niveau',        points: 'Récompenses' },
          ].map(({ emoji, label, points }) => (
            <div key={label} className="bg-white rounded-2xl p-4 flex items-center gap-3">
              <span className="text-2xl">{emoji}</span>
              <div><p className="font-semibold text-sm">{label}</p><p className="text-tropical font-bold text-sm">{points}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PassportPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display font-bold text-4xl text-anthracite mb-8">Mon passeport</h1>
      <AuthGuard>
        <PassportContent />
      </AuthGuard>
    </main>
  );
}
