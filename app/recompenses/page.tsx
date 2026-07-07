'use client';
import { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { getRewardsSettings, getRaffleWinners } from '@/lib/rewards-firestore';
import { RewardsSettings, RaffleWinner } from '@/types';
import { Gift, Zap, ShieldCheck, Trophy } from 'lucide-react';

export default function RecompensesPage() {
  const [settings, setSettings] = useState<RewardsSettings | null>(null);
  const [winners, setWinners]   = useState<RaffleWinner[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getRewardsSettings(), getRaffleWinners()])
      .then(([s, w]) => { setSettings(s); setWinners(w.slice(0, 6)); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <PageHeader
        title="Tes avantages KiffCI"
        subtitle="Plus tu explores, plus tu débloques d'avantages réels."
        crumbs={[{ label: 'Récompenses' }]} />

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-4xl shadow-card p-6">
            <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
              <Zap size={20} aria-hidden />
            </div>
            <h2 className="font-display font-bold text-lg text-anthracite mb-2">Accès prioritaire</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Dès le niveau <strong>Aventurier</strong>, tu découvres certaines nouvelles expériences et certains
              événements 24h avant tout le monde. Continue à explorer pour ne jamais rater les nouveautés.
            </p>
          </div>

          <div className="bg-white rounded-4xl shadow-card p-6">
            <div className="w-11 h-11 rounded-2xl bg-solar/10 text-solar flex items-center justify-center mb-4">
              <Gift size={20} aria-hidden />
            </div>
            <h2 className="font-display font-bold text-lg text-anthracite mb-2">Tirage au sort mensuel</h2>
            {loading ? (
              <p className="text-sm text-gray-400">Chargement…</p>
            ) : (
              <>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Chaque mois, un tirage au sort récompense un utilisateur actif parmi ceux ayant atteint le niveau{' '}
                  <strong>{settings?.eligibilityMinLevel}</strong>.
                </p>
                <p className="mt-3 text-sm bg-solar/5 text-solar font-medium rounded-xl px-3 py-2">
                  🎁 Ce mois-ci : {settings?.currentPrize}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-4xl shadow-card p-6">
          <h2 className="font-display font-bold text-lg text-anthracite mb-4 flex items-center gap-2">
            <Trophy size={17} className="text-solar" aria-hidden /> Derniers gagnants
          </h2>
          {winners.length === 0 ? (
            <p className="text-sm text-gray-400">Le premier tirage arrive bientôt — sois de la partie !</p>
          ) : (
            <ul className="space-y-2">
              {winners.map(w => (
                <li key={w.id} className="flex items-center justify-between text-sm border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                  <span className="text-anthracite font-medium">{w.userName}</span>
                  <span className="text-gray-400">{w.prize} · {w.period}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-lagoon/5 border border-lagoon/20 rounded-3xl p-6 flex items-start gap-3">
          <ShieldCheck size={20} className="text-lagoon shrink-0 mt-0.5" aria-hidden />
          <p className="text-sm text-gray-600">
            Pour compter, une expérience doit être marquée comme vécue depuis ta fiche.
            Certaines expériences proposent un <strong>code de passage</strong> fourni par l'établissement sur place :
            l'utiliser certifie ta visite et double tes points gagnés.
          </p>
        </div>
      </div>
    </main>
  );
}
