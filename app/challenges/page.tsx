'use client';
import { useEffect, useState } from 'react';
import {
  getChallenges, getCompletedIds, getExperienceById, checkAndRewardChallenge,
  getChallengeProgress, getChallengeLeaderboard,
} from '@/lib/firestore';
import { Challenge, Experience } from '@/types';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Trophy, Star, ArrowRight, CheckCircle, MapPin, Calendar, Users, Medal } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  Romantique: 'bg-pink-100 text-pink-700',
  Culture:    'bg-purple-100 text-purple-700',
  Nature:     'bg-green-100 text-green-700',
  Ville:      'bg-blue-100 text-blue-700',
  Famille:    'bg-yellow-100 text-yellow-700',
};

const TYPE_BADGES: Record<Challenge['type'], { label: string; icon: typeof Trophy; color: string }> = {
  decouverte:    { label: 'Découverte',   icon: Trophy,   color: 'bg-solar/10 text-solar' },
  frequence:     { label: 'Fréquence',    icon: MapPin,   color: 'bg-lagoon/10 text-lagoon' },
  saisonnier:    { label: 'Saisonnier',   icon: Calendar, color: 'bg-purple-100 text-purple-700' },
  communautaire: { label: 'Communautaire', icon: Users,   color: 'bg-tropical/10 text-tropical' },
};

type Progress = { done: number; total: number; isComplete: boolean; windowOpen: boolean };

export default function ChallengesPage() {
  const { appUser, refreshUser } = useAuth();
  const [challenges,   setChallenges]   = useState<Challenge[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [expMap,       setExpMap]       = useState<Record<string, Experience>>({});
  const [progressMap,  setProgressMap]  = useState<Record<string, Progress>>({});
  const [leaderboards, setLeaderboards] = useState<Record<string, { userName: string; claimedAt: number }[]>>({});
  const [loading,      setLoading]      = useState(true);
  const [claiming,     setClaiming]     = useState<string | null>(null);
  const [toast,        setToast]        = useState('');
  const [openBoard,    setOpenBoard]    = useState<string | null>(null);

  async function load() {
    const [chs, ids] = await Promise.all([
      getChallenges(),
      appUser ? getCompletedIds(appUser.uid) : Promise.resolve([]),
    ]);
    const active = chs.filter(c => c.isActive);
    setChallenges(active);
    setCompletedIds(ids);

    const allIds = Array.from(new Set(active.flatMap((c) => c.experiences)));
    const exps = await Promise.all(allIds.map((id) => getExperienceById(id)));
    const map: Record<string, Experience> = {};
    exps.forEach((e) => { if (e) map[e.id] = e; });
    setExpMap(map);

    if (appUser) {
      const entries = await Promise.all(active.map(async c => [c.id, await getChallengeProgress(appUser.uid, c, ids)] as const));
      setProgressMap(Object.fromEntries(entries));
    }
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [appUser]);

  async function handleClaim(challenge: Challenge) {
    if (!appUser) return;
    setClaiming(challenge.id);
    try {
      const rewarded = await checkAndRewardChallenge(appUser.uid, challenge, completedIds);
      if (rewarded) {
        setToast(`+${challenge.rewardPoints} points ! Défi accompli 🏆`);
        await refreshUser();
        await load();
      } else {
        setToast('Défi déjà réclamé, incomplet, ou période terminée.');
      }
    } finally {
      setClaiming(null);
      setTimeout(() => setToast(''), 3000);
    }
  }

  async function toggleLeaderboard(challengeId: string) {
    if (openBoard === challengeId) { setOpenBoard(null); return; }
    setOpenBoard(challengeId);
    if (!leaderboards[challengeId]) {
      const board = await getChallengeLeaderboard(challengeId);
      setLeaderboards(prev => ({ ...prev, [challengeId]: board }));
    }
  }

  if (loading) return (
    <div className="flex justify-center mt-20">
      <div className="w-10 h-10 border-4 border-solar border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-anthracite text-white px-5 py-3 rounded-2xl shadow-soft font-semibold animate-fadeUp">
          {toast}
        </div>
      )}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-solar/10 text-solar rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
          <Trophy size={15} /> Défis à relever
        </div>
        <h1 className="font-display font-bold text-4xl text-anthracite">Défis KIFFCI</h1>
        <p className="text-gray-500 mt-2">Découverte, retours fidèles chez tes lieux préférés, défis saisonniers et classements communautaires.</p>
      </div>

      {challenges.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-4xl shadow-card">
          <p className="text-5xl mb-4">🏆</p>
          <h3 className="font-display font-bold text-xl">Aucun défi disponible</h3>
          <p className="text-gray-500 mt-2">Les défis seront bientôt disponibles.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {challenges.map((c) => {
            const relatedExps = c.experiences.map((id) => expMap[id]).filter(Boolean);
            const progress = progressMap[c.id];
            const done = progress?.done ?? 0;
            const total = progress?.total ?? (c.type === 'frequence' ? (c.requiredVisits ?? 1) : c.experiences.length);
            const isComplete = progress?.isComplete ?? false;
            const windowOpen = progress?.windowOpen ?? true;
            const colorClass = CATEGORY_COLORS[c.category] ?? 'bg-gray-100 text-gray-700';
            const typeBadge = TYPE_BADGES[c.type];
            const TypeIcon = typeBadge.icon;

            return (
              <div key={c.id} className="bg-white rounded-4xl shadow-card p-7 flex flex-col hover:shadow-soft transition">
                <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 ${typeBadge.color}`}>
                      <TypeIcon size={12} aria-hidden /> {typeBadge.label}
                    </span>
                    {c.category && <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${colorClass}`}>{c.category}</span>}
                  </div>
                  <div className="flex items-center gap-1.5 text-solar bg-solar/10 px-3 py-1.5 rounded-full">
                    <Star size={14} fill="currentColor" />
                    <span className="text-sm font-bold">{c.rewardPoints} pts</span>
                  </div>
                </div>
                <h2 className="font-display font-bold text-2xl text-anthracite">{c.title}</h2>
                <p className="text-gray-500 mt-2 flex-1">{c.description}</p>

                {c.type === 'saisonnier' && c.endDate && (
                  <p className="mt-3 text-xs font-medium text-purple-700 bg-purple-50 rounded-xl px-3 py-2 flex items-center gap-1.5 w-fit">
                    <Calendar size={12} aria-hidden />
                    {windowOpen ? `Se termine le ${new Date(c.endDate).toLocaleDateString('fr-FR')}` : 'Période terminée'}
                  </p>
                )}

                {/* Progression */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{c.type === 'frequence' ? `Visites chez ${c.targetEstablishmentName ?? 'le partenaire'}` : 'Progression'}</span>
                    <span>{done}/{total}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-solar rounded-full transition-all" style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }} />
                  </div>
                </div>

                {c.type === 'frequence' && c.targetEstablishmentId ? (
                  <div className="mt-6">
                    <Link href={`/establishments/${c.targetEstablishmentId}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-solar/5 hover:text-solar group transition">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-lagoon shrink-0" />
                        <p className="text-sm font-semibold">{c.targetEstablishmentName}</p>
                      </div>
                      <ArrowRight size={16} className="text-gray-400 group-hover:text-solar transition shrink-0" />
                    </Link>
                    <p className="text-xs text-gray-400 mt-2">Valide le code de passage sur place à chaque visite pour progresser.</p>
                  </div>
                ) : relatedExps.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{total} expérience(s) à vivre</p>
                    {relatedExps.map((exp) => (
                      <Link key={exp.id} href={`/experiences/${exp.id}`}
                        className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-solar/5 hover:text-solar group transition">
                        <div className="flex items-center gap-2">
                          {completedIds.includes(exp.id) && <CheckCircle size={16} className="text-tropical shrink-0" />}
                          <div>
                            <p className="text-sm font-semibold">{exp.title}</p>
                            <p className="text-xs text-gray-400">{exp.district}</p>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-gray-400 group-hover:text-solar transition shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}

                {c.type === 'communautaire' && (
                  <div className="mt-4">
                    <button onClick={() => toggleLeaderboard(c.id)}
                      className="text-sm font-medium text-tropical hover:underline flex items-center gap-1.5">
                      <Medal size={14} aria-hidden /> Voir le classement
                    </button>
                    {openBoard === c.id && (
                      <div className="mt-3 bg-gray-50 rounded-2xl p-4 space-y-2">
                        {(leaderboards[c.id] ?? []).length === 0 ? (
                          <p className="text-xs text-gray-400">Personne n'a encore relevé ce défi — sois le premier !</p>
                        ) : (
                          leaderboards[c.id].map((entry, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-tropical/10 text-tropical font-bold text-xs flex items-center justify-center">{i + 1}</span>
                                {entry.userName}
                              </span>
                              <span className="text-xs text-gray-400">{new Date(entry.claimedAt).toLocaleDateString('fr-FR')}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}

                {appUser && (
                  <button onClick={() => handleClaim(c)} disabled={!isComplete || !windowOpen || claiming === c.id}
                    className={`mt-6 w-full rounded-2xl py-3 font-bold transition flex items-center justify-center gap-2 ${
                      isComplete && windowOpen
                        ? 'bg-solar text-white hover:bg-orange-600'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}>
                    {claiming === c.id
                      ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : !windowOpen ? 'Période terminée'
                      : isComplete ? '🏆 Réclamer la récompense'
                      : `Encore ${total - done} pour réussir`
                    }
                  </button>
                )}
                {!appUser && (
                  <Link href="/login" className="mt-6 block w-full text-center border border-gray-200 rounded-2xl py-3 font-bold text-gray-600 hover:bg-gray-50 transition">
                    Connecte-toi pour participer
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
