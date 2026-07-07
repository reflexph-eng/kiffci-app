'use client';
import { useEffect, useState } from 'react';
import { getChallenges, getCompletedIds, getExperienceById, checkAndRewardChallenge } from '@/lib/firestore';
import { Challenge, Experience } from '@/types';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Trophy, Star, ArrowRight, CheckCircle } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  Romantique: 'bg-pink-100 text-pink-700',
  Culture:    'bg-purple-100 text-purple-700',
  Nature:     'bg-green-100 text-green-700',
  Ville:      'bg-blue-100 text-blue-700',
  Famille:    'bg-yellow-100 text-yellow-700',
};

export default function ChallengesPage() {
  const { appUser, refreshUser } = useAuth();
  const [challenges,    setChallenges]    = useState<Challenge[]>([]);
  const [completedIds,  setCompletedIds]  = useState<string[]>([]);
  const [expMap,        setExpMap]        = useState<Record<string, Experience>>({});
  const [loading,       setLoading]       = useState(true);
  const [claiming,      setClaiming]      = useState<string | null>(null);
  const [toast,         setToast]         = useState('');

  useEffect(() => {
    async function load() {
      const [chs, ids] = await Promise.all([
        getChallenges(),
        appUser ? getCompletedIds(appUser.uid) : Promise.resolve([]),
      ]);
      setChallenges(chs);
      setCompletedIds(ids);

      // Load all referenced experiences
      const allIds = Array.from(new Set(chs.flatMap((c) => c.experiences)));
      const exps = await Promise.all(allIds.map((id) => getExperienceById(id)));
      const map: Record<string, Experience> = {};
      exps.forEach((e) => { if (e) map[e.id] = e; });
      setExpMap(map);
      setLoading(false);
    }
    load();
  }, [appUser]);

  async function handleClaim(challenge: Challenge) {
    if (!appUser) return;
    setClaiming(challenge.id);
    try {
      const rewarded = await checkAndRewardChallenge(appUser.uid, challenge, completedIds);
      if (rewarded) {
        setToast(`+${challenge.rewardPoints} points ! Défi accompli 🏆`);
        await refreshUser();
      } else {
        setToast('Défi déjà réclamé ou incomplet.');
      }
    } finally {
      setClaiming(null);
      setTimeout(() => setToast(''), 3000);
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
        <p className="text-gray-500 mt-2">Relève des défis thématiques, valide des expériences et gagne des points.</p>
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
            const done = c.experiences.filter((id) => completedIds.includes(id)).length;
            const total = c.experiences.length;
            const allDone = done === total;
            const colorClass = CATEGORY_COLORS[c.category] ?? 'bg-gray-100 text-gray-700';

            return (
              <div key={c.id} className="bg-white rounded-4xl shadow-card p-7 flex flex-col hover:shadow-soft transition">
                <div className="flex items-start justify-between mb-4">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${colorClass}`}>{c.category}</span>
                  <div className="flex items-center gap-1.5 text-solar bg-solar/10 px-3 py-1.5 rounded-full">
                    <Star size={14} fill="currentColor" />
                    <span className="text-sm font-bold">{c.rewardPoints} pts</span>
                  </div>
                </div>
                <h2 className="font-display font-bold text-2xl text-anthracite">{c.title}</h2>
                <p className="text-gray-500 mt-2 flex-1">{c.description}</p>

                {/* Progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progression</span>
                    <span>{done}/{total}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-solar rounded-full transition-all" style={{ width: `${(done / total) * 100}%` }} />
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{total} expériences à vivre</p>
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

                {appUser && (
                  <button onClick={() => handleClaim(c)} disabled={!allDone || claiming === c.id}
                    className={`mt-6 w-full rounded-2xl py-3 font-bold transition flex items-center justify-center gap-2 ${
                      allDone
                        ? 'bg-solar text-white hover:bg-orange-600'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}>
                    {claiming === c.id
                      ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : allDone ? '🏆 Réclamer la récompense' : `Complète les ${total - done} expériences restantes`
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
