'use client';
/** /admin/raffle — tirage au sort mensuel parmi les utilisateurs éligibles (Sprint 6). */
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import {
  getEligibleUsersForRaffle, getRaffleWinners, drawRaffleWinner,
  getRewardsSettings, updateRewardsSettings, hasWinnerThisPeriod, currentPeriod,
} from '@/lib/rewards-firestore';
import { AppUser, RaffleWinner, RewardsSettings } from '@/types';
import { Gift, Sparkles, Users, Trophy, Check } from 'lucide-react';

export default function AdminRafflePage() {
  const { appUser } = useAuth();
  const [eligible, setEligible]   = useState<AppUser[]>([]);
  const [winners, setWinners]     = useState<RaffleWinner[]>([]);
  const [settings, setSettings]   = useState<RewardsSettings | null>(null);
  const [loading, setLoading]     = useState(true);
  const [drawing, setDrawing]     = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saved, setSaved]         = useState(false);
  const [justDrawn, setJustDrawn] = useState<AppUser | null>(null);

  async function refresh() {
    const [e, w, s] = await Promise.all([getEligibleUsersForRaffle(), getRaffleWinners(), getRewardsSettings()]);
    setEligible(e); setWinners(w); setSettings(s);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function handleSaveSettings() {
    if (!settings) return;
    setSavingSettings(true);
    await updateRewardsSettings(settings);
    setSavingSettings(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleDraw() {
    if (!appUser || eligible.length === 0 || !settings) return;
    if (!confirm(`Tirer un gagnant parmi ${eligible.length} utilisateur(s) éligible(s) pour « ${settings.currentPrize} » ?`)) return;
    setDrawing(true);
    const winner = eligible[Math.floor(Math.random() * eligible.length)];
    await drawRaffleWinner(winner, settings.currentPrize, appUser.uid);
    setJustDrawn(winner);
    await refresh();
    setDrawing(false);
  }

  const alreadyDrawn = hasWinnerThisPeriod(winners);

  return (
    <AuthGuard adminOnly>
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="font-display font-bold text-3xl text-anthracite flex items-center gap-2 mb-2">
          <Gift className="text-solar" aria-hidden /> Tirage au sort mensuel
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Récompense les utilisateurs actifs — aucune dépendance à un partenaire, 100% pilotable ici.
        </p>

        {loading || !settings ? (
          <p className="text-gray-400 text-sm">Chargement…</p>
        ) : (
          <div className="space-y-6">
            {/* Réglages */}
            <div className="bg-white rounded-4xl shadow-card p-6 space-y-4">
              <h2 className="font-display font-bold text-lg flex items-center gap-2">
                <Sparkles size={17} className="text-solar" aria-hidden /> Lot du mois ({currentPeriod()})
              </h2>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Description du lot</span>
                <input value={settings.currentPrize}
                  onChange={e => setSettings(s => ({ ...s!, currentPrize: e.target.value }))}
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Niveau minimum requis</span>
                <select value={settings.eligibilityMinLevel}
                  onChange={e => setSettings(s => ({ ...s!, eligibilityMinLevel: e.target.value }))}
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-solar outline-none text-sm bg-white">
                  {['Explorateur', 'Aventurier', 'Connaisseur', "Expert Côte d'Ivoire", 'Légende KIFFCI'].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </label>
              <div className="flex items-center gap-3">
                <button onClick={handleSaveSettings} disabled={savingSettings}
                  className="bg-anthracite text-white font-medium px-5 py-2.5 rounded-2xl text-sm hover:opacity-90 transition disabled:opacity-50">
                  {savingSettings ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                {saved && <span className="flex items-center gap-1 text-tropical text-sm font-medium"><Check size={14} aria-hidden /> Enregistré</span>}
              </div>
            </div>

            {/* Éligibilité & tirage */}
            <div className="bg-white rounded-4xl shadow-card p-6">
              <h2 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
                <Users size={17} className="text-lagoon" aria-hidden /> {eligible.length} utilisateur(s) éligible(s) ce mois-ci
              </h2>

              {alreadyDrawn && !justDrawn ? (
                <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-3">
                  Un gagnant a déjà été tiré pour {currentPeriod()}. Vous pourrez retirer le mois prochain.
                </p>
              ) : (
                <button onClick={handleDraw} disabled={drawing || eligible.length === 0}
                  className="bg-solar text-white font-bold px-6 py-3 rounded-2xl hover:bg-orange-600 transition disabled:opacity-50 flex items-center gap-2">
                  <Gift size={17} aria-hidden /> {drawing ? 'Tirage en cours…' : 'Tirer au sort'}
                </button>
              )}

              {justDrawn && (
                <div className="mt-4 bg-solar/10 border border-solar/20 rounded-2xl px-5 py-4">
                  <p className="font-display font-bold text-anthracite flex items-center gap-2">
                    <Trophy size={17} className="text-solar" aria-hidden /> Gagnant : {justDrawn.displayName || justDrawn.email}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Contactez-le/la pour lui remettre : {settings.currentPrize}</p>
                </div>
              )}
            </div>

            {/* Historique */}
            <div className="bg-white rounded-4xl shadow-card p-6">
              <h2 className="font-display font-bold text-lg mb-4">Historique des gagnants</h2>
              {winners.length === 0 ? (
                <p className="text-sm text-gray-400">Aucun tirage effectué pour le moment.</p>
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
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
