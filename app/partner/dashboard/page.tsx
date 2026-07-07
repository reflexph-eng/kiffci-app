'use client';
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import StatCard from '@/components/StatCard';
import SuspendedBanner from '@/components/SuspendedBanner';
import { useAuth } from '@/context/AuthContext';
import { getPartnerStats, getMyEstablishments, getMyEvents } from '@/lib/partner-firestore';
import { PartnerStats, Establishment, KiffEvent } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';
import { Plus, Store, Calendar, ArrowRight } from 'lucide-react';

function DashboardContent() {
  const { appUser } = useAuth();
  const [stats,   setStats]   = useState<PartnerStats | null>(null);
  const [ests,    setEsts]    = useState<Establishment[]>([]);
  const [events,  setEvents]  = useState<KiffEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appUser) return;
    Promise.all([
      getPartnerStats(appUser.uid),
      getMyEstablishments(appUser.uid),
      getMyEvents(appUser.uid),
    ]).then(([s, e, ev]) => {
      setStats(s); setEsts(e.slice(0, 3)); setEvents(ev.slice(0, 3));
    }).finally(() => setLoading(false));
  }, [appUser]);

  if (loading) return (
    <div className="flex justify-center mt-20">
      <div className="w-10 h-10 border-4 border-solar border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-solar to-orange-400 rounded-4xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(255,255,255,0.15)_0%,_transparent_60%)]" />
        <div className="relative">
          <p className="text-white/75 text-sm mb-1">Espace Partenaire</p>
          <h2 className="font-display font-bold text-3xl mb-2">Bonjour, {appUser?.displayName} 👋</h2>
          <p className="text-white/80 text-sm">Publie et gère tes établissements et événements sur Kiffci.</p>
          <div className="mt-5 flex gap-3 flex-wrap">
            <Link href="/partner/create-establishment"
              className="bg-white text-solar px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-orange-50 transition">
              <Store size={16} /> Ajouter un établissement
            </Link>
            <Link href="/partner/create-event"
              className="bg-white/20 text-white px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-white/30 transition border border-white/30">
              <Calendar size={16} /> Publier un événement
            </Link>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard emoji="👁️" label="Vues totales"      value={stats.totalViews}         color="text-solar"    />
          <StatCard emoji="💬" label="Clics WhatsApp"    value={stats.totalWhatsappClicks} color="text-tropical" />
          <StatCard emoji="📞" label="Clics Téléphone"   value={stats.totalPhoneClicks}    color="text-blue-500" />
          <StatCard emoji="❤️" label="Favoris"           value={stats.totalFavorites}      color="text-red-500"  />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-4xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-xl flex items-center gap-2">
              <Store size={18} className="text-solar" /> Mes établissements
            </h3>
            <Link href="/partner/establishments" className="text-sm text-solar hover:underline flex items-center gap-1">
              Tout voir <ArrowRight size={14} />
            </Link>
          </div>
          {ests.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 text-sm mb-3">Aucun établissement encore.</p>
              <Link href="/partner/create-establishment"
                className="inline-flex items-center gap-2 bg-solar text-white px-4 py-2 rounded-2xl text-sm font-bold hover:bg-orange-600 transition">
                <Plus size={15} /> Ajouter
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {ests.map(e => (
                <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{e.name}</p>
                    <p className="text-xs text-gray-400">{e.category} · {e.city}</p>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-4xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-xl flex items-center gap-2">
              <Calendar size={18} className="text-solar" /> Mes événements
            </h3>
            <Link href="/partner/events" className="text-sm text-solar hover:underline flex items-center gap-1">
              Tout voir <ArrowRight size={14} />
            </Link>
          </div>
          {events.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 text-sm mb-3">Aucun événement encore.</p>
              <Link href="/partner/create-event"
                className="inline-flex items-center gap-2 bg-solar text-white px-4 py-2 rounded-2xl text-sm font-bold hover:bg-orange-600 transition">
                <Plus size={15} /> Publier
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map(e => (
                <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{e.title}</p>
                    <p className="text-xs text-gray-400">{e.city} · {new Date(e.startDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-sand rounded-3xl p-5 border border-orange-100">
        <p className="text-sm text-gray-700">
          <strong>ℹ️ Modération :</strong> Chaque publication est examinée par l'équipe Kiffci avant d'être visible publiquement. Délai de validation : 24h.
        </p>
      </div>
    </div>
  );
}

export default function PartnerDashboard() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      <SuspendedBanner />
      <AuthGuard partnerOnly>
        <DashboardContent />
      </AuthGuard>
    </main>
  );
}
