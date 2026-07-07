'use client';
/** /admin/stats — dashboard statistiques : l'embryon de l'observatoire (Sprint 5). */
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { computeDashboardStats, DashboardStats } from '@/lib/dashboard-stats';
import {
  BarChart3, Users, Store, Calendar, Compass, Eye, MessageCircle, Phone,
  Star, MessageSquare, Megaphone, MapPin, ShieldCheck,
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: typeof Users; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-3xl shadow-card p-5">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={18} aria-hidden />
      </div>
      <p className="text-2xl font-display font-bold text-anthracite">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminStatsPage() {
  const [stats, setStats]   = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    computeDashboardStats().then(setStats).finally(() => setLoading(false));
  }, []);

  return (
    <AuthGuard adminOnly>
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="font-display font-bold text-3xl text-anthracite flex items-center gap-2 mb-2">
          <BarChart3 className="text-solar" aria-hidden /> Observatoire KiffCI
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Vue d'ensemble de l'activité de la plateforme, calculée en temps réel.
        </p>

        {loading || !stats ? (
          <p className="text-gray-400 text-sm">Chargement des statistiques…</p>
        ) : (
          <div className="space-y-10">
            {/* Vue d'ensemble */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Utilisateurs inscrits" value={stats.usersTotal}
                sub={`${stats.usersByRole.partner ?? 0} partenaires · ${stats.usersSuspended} suspendu(s)`}
                color="bg-anthracite/5 text-anthracite" />
              <StatCard icon={Store} label="Établissements" value={stats.establishmentsTotal}
                sub={`${stats.establishmentsByStatus.approved ?? 0} approuvés · ${stats.establishmentsVerified} vérifiés`}
                color="bg-lagoon/10 text-lagoon" />
              <StatCard icon={Calendar} label="Événements" value={stats.eventsTotal}
                sub={`${stats.eventsByStatus.approved ?? 0} approuvés · ${stats.eventsByStatus.pending ?? 0} en attente`}
                color="bg-tropical/10 text-tropical" />
              <StatCard icon={Compass} label="Expériences" value={stats.experiencesTotal}
                color="bg-solar/10 text-solar" />
            </div>

            {/* Engagement */}
            <div>
              <h2 className="font-display font-bold text-lg text-anthracite mb-4">Engagement</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Eye} label="Vues cumulées" value={stats.totalViews} color="bg-gray-100 text-gray-600" />
                <StatCard icon={MessageCircle} label="Clics WhatsApp" value={stats.totalWhatsappClicks} color="bg-tropical/10 text-tropical" />
                <StatCard icon={Phone} label="Clics Appeler" value={stats.totalPhoneClicks} color="bg-solar/10 text-solar" />
                <StatCard icon={Star} label="Note moyenne" value={stats.reviewsAverage > 0 ? stats.reviewsAverage.toFixed(1) : '—'}
                  sub={`${stats.reviewsTotal} avis${stats.reviewsFlagged > 0 ? ` · ${stats.reviewsFlagged} signalé(s)` : ''}`}
                  color="bg-yellow-50 text-yellow-600" />
              </div>
            </div>

            {/* Publicité */}
            <div>
              <h2 className="font-display font-bold text-lg text-anthracite mb-4 flex items-center gap-2">
                <Megaphone size={17} className="text-solar" aria-hidden /> Publicité
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <StatCard icon={Megaphone} label="Encarts actifs" value={`${stats.adsActive} / ${stats.adsTotal}`} color="bg-pink-50 text-pink-600" />
                <StatCard icon={Eye} label="Vues des encarts" value={stats.adsViews} color="bg-gray-100 text-gray-600" />
                <StatCard icon={MessageSquare} label="Clics des encarts" value={stats.adsClicks}
                  sub={stats.adsViews > 0 ? `Taux de clic : ${((stats.adsClicks / stats.adsViews) * 100).toFixed(1)}%` : undefined}
                  color="bg-gray-100 text-gray-600" />
              </div>
            </div>

            {/* Top contenus */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-4xl shadow-card p-6">
                <h2 className="font-display font-bold text-lg text-anthracite mb-4">Top 5 expériences</h2>
                {stats.topExperiences.length === 0 ? (
                  <p className="text-sm text-gray-400">Pas encore de données.</p>
                ) : (
                  <ol className="space-y-3">
                    {stats.topExperiences.map((t, i) => (
                      <li key={t.id} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-solar/10 text-solar font-bold text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                          <span className="truncate text-anthracite">{t.name}</span>
                        </span>
                        <span className="text-gray-400 font-medium shrink-0 ml-2">{t.value} vues</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <div className="bg-white rounded-4xl shadow-card p-6">
                <h2 className="font-display font-bold text-lg text-anthracite mb-4">Top 5 établissements</h2>
                {stats.topEstablishments.length === 0 ? (
                  <p className="text-sm text-gray-400">Pas encore de données.</p>
                ) : (
                  <ol className="space-y-3">
                    {stats.topEstablishments.map((t, i) => (
                      <li key={t.id} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-lagoon/10 text-lagoon font-bold text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                          <span className="truncate text-anthracite">{t.name}</span>
                        </span>
                        <span className="text-gray-400 font-medium shrink-0 ml-2">{t.value} vues</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>

            {/* Couverture géographique */}
            <div className="bg-white rounded-4xl shadow-card p-6">
              <h2 className="font-display font-bold text-lg text-anthracite mb-4 flex items-center gap-2">
                <MapPin size={17} className="text-solar" aria-hidden /> Couverture par ville
              </h2>
              {stats.byCity.length === 0 ? (
                <p className="text-sm text-gray-400">Pas encore de données.</p>
              ) : (
                <div className="space-y-2">
                  {stats.byCity.map(c => {
                    const max = stats.byCity[0].count;
                    return (
                      <div key={c.city} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-28 shrink-0 truncate">{c.city}</span>
                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-solar rounded-full" style={{ width: `${(c.count / max) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-6 text-right shrink-0">{c.count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-4 flex items-center gap-1.5">
                <ShieldCheck size={12} aria-hidden /> Données agrégées uniquement — aucune donnée individuelle d'établissement n'est exposée ici.
              </p>
            </div>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
