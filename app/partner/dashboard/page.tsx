'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, BarChart3, Calendar, CheckCircle2, CircleHelp, FileText,
  Heart, Megaphone, MessageCircle, Phone, Plus, Sparkles, Store, TrendingUp, ShieldCheck
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import SuspendedBanner from '@/components/SuspendedBanner';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { getPartnerStats, getMyEstablishments, getMyEvents, getMyExperiences } from '@/lib/partner-firestore';
import { Establishment, KiffEvent, PartnerStats, Experience } from '@/types';

const quickLinks = [
  { href: '/partner/experiences', label: 'Mes expériences', hint: 'Publier et suivre', icon: Sparkles },
  { href: '/partner/create-experience', label: 'Créer une expérience', hint: 'Faire vivre une nouvelle idée', icon: Plus },
  { href: '/partner/events', label: 'Expériences datées', hint: 'Événements ponctuels', icon: Calendar },
  { href: '/partner/establishments', label: 'Mes lieux supports', hint: 'Gérer mes établissements', icon: Store },
  { href: '/partner/sponsorship', label: 'Sponsorisation', hint: 'Gagner en visibilité', icon: Megaphone },
  { href: '/partner/verification', label: 'Vérification Créateur', hint: 'Transmettre mon dossier', icon: ShieldCheck },
  { href: '/partner/documents', label: 'Mes documents', hint: 'Préparer mes justificatifs', icon: FileText },
  { href: '/partner/subscription', label: 'Mon abonnement', hint: 'Offre et facturation', icon: Sparkles },
  { href: '/partner/support', label: 'Assistance', hint: 'Obtenir de l’aide', icon: CircleHelp },
];

function DashboardContent() {
  const { appUser } = useAuth();
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [ests, setEsts] = useState<Establishment[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [events, setEvents] = useState<KiffEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appUser) return;
    Promise.all([
      getPartnerStats(appUser.uid),
      getMyEstablishments(appUser.uid),
      getMyExperiences(appUser.uid),
      getMyEvents(appUser.uid),
    ]).then(([s, e, ex, ev]) => {
      setStats(s);
      setEsts(e);
      setExperiences(ex);
      setEvents(ev);
    }).finally(() => setLoading(false));
  }, [appUser]);

  const completeness = useMemo(() => {
    if (!appUser) return 0;
    const profileChecks = [appUser.displayName, appUser.email];
    const first = ests[0];
    const establishmentChecks = first ? [
      first.name, first.description, first.city, first.address,
      first.phone, first.whatsapp, first.category,
      Array.isArray(first.images) && first.images.length > 0,
    ] : [];
    const all = [...profileChecks, ...establishmentChecks];
    if (!all.length) return 0;
    return Math.round((all.filter(Boolean).length / all.length) * 100);
  }, [appUser, ests]);

  if (loading) {
    return <div className="flex min-h-[45vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-solar border-t-transparent" /></div>;
  }

  const statItems = [
    { label: 'Vues totales', value: stats?.totalViews ?? 0, icon: BarChart3 },
    { label: 'Clics WhatsApp', value: stats?.totalWhatsappClicks ?? 0, icon: MessageCircle },
    { label: 'Appels', value: stats?.totalPhoneClicks ?? 0, icon: Phone },
    { label: 'Favoris', value: stats?.totalFavorites ?? 0, icon: Heart },
  ];

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[2rem] bg-anthracite px-6 py-8 text-white md:px-10 md:py-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-white/55">Espace Créateur KIFFCI</p>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-5xl">Bonjour, {appUser?.displayName || 'Créateur'}</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 md:text-base">Publie des expériences à vivre, organise tes rendez-vous datés et mesure leur performance depuis un espace unique.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/partner/create-experience" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-solar px-5 font-bold text-white transition hover:bg-orange-600"><Plus size={18} /> Créer une expérience</Link>
            <Link href={`/annonceurs/${appUser?.uid}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 font-bold text-white transition hover:bg-white/10"><Sparkles size={18} /> Voir ma vitrine</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_.8fr]">
        <div>
          <div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-solar">Performance</p><h2 className="mt-1 font-display text-2xl font-bold">Vue d’ensemble</h2></div><TrendingUp className="text-gray-300" /></div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 md:grid-cols-4">
            {statItems.map(({ label, value, icon: Icon }) => <div key={label} className="bg-white p-5 md:p-6"><Icon size={20} className="mb-5 text-solar" /><p className="font-display text-3xl font-bold text-anthracite">{value}</p><p className="mt-1 text-xs text-gray-500">{label}</p></div>)}
          </div>
        </div>

        <aside className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Qualité du compte</p><h2 className="mt-1 font-display text-xl font-bold">Profil complété à {completeness}%</h2></div><CheckCircle2 className="text-solar" /></div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-solar transition-all" style={{ width: `${completeness}%` }} /></div>
          <p className="mt-4 text-sm leading-6 text-gray-500">Complète ton profil Créateur, tes contacts et tes publications afin d’améliorer la confiance et ta visibilité.</p>
          <Link href="/profile" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-solar">Améliorer mon profil <ArrowRight size={15} /></Link>
        </aside>
      </section>

      <section>
        <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-solar">Accès rapides</p><h2 className="mt-1 font-display text-2xl font-bold">Développer mes expériences</h2></div>
        <div className="grid gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 sm:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map(({ href, label, hint, icon: Icon }) => <Link key={href} href={href} className="group flex items-center justify-between bg-white p-5 transition hover:bg-orange-50"><div className="flex items-center gap-4"><span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-50 text-solar"><Icon size={20} /></span><span><strong className="block text-sm text-anthracite">{label}</strong><span className="text-xs text-gray-500">{hint}</span></span></div><ArrowRight size={17} className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-solar" /></Link>)}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <ResourceList title="Mes lieux supports" icon={Store} href="/partner/establishments" empty="Aucun lieu support pour le moment." addHref="/partner/create-establishment">
          {ests.slice(0, 4).map(e => <div key={e.id} className="flex items-center justify-between border-b border-gray-100 py-4 last:border-0"><div className="min-w-0"><p className="truncate font-semibold">{e.name}</p><p className="mt-1 text-xs text-gray-400">{e.category} · {e.city}</p></div><StatusBadge status={e.status} /></div>)}
        </ResourceList>
        <ResourceList title="Mes expériences" icon={Calendar} href="/partner/experiences" empty="Aucune expérience publiée pour le moment." addHref="/partner/create-experience">
          {experiences.slice(0, 4).map(e => <div key={e.id} className="flex items-center justify-between border-b border-gray-100 py-4 last:border-0"><div className="min-w-0"><p className="truncate font-semibold">{e.title}</p><p className="mt-1 text-xs text-gray-400">{e.category} · {e.city}</p></div><StatusBadge status={e.status ?? 'pending'} /></div>)}
        </ResourceList>
      </section>

      <section className="flex flex-col gap-4 border-y border-orange-100 bg-orange-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="font-bold text-anthracite">Besoin d’aide pour publier une expérience attractive ?</p><p className="mt-1 text-sm text-gray-600">Consulte les guides ou contacte l’équipe créateurs KIFFCI.</p></div>
        <Link href="/partner/support" className="inline-flex items-center gap-2 text-sm font-bold text-solar">Accéder à l’assistance <ArrowRight size={15} /></Link>
      </section>
    </div>
  );
}

function ResourceList({ title, icon: Icon, href, empty, addHref, children }: { title: string; icon: typeof Store; href: string; empty: string; addHref: string; children: React.ReactNode }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return <div><div className="mb-3 flex items-center justify-between"><h2 className="flex items-center gap-2 font-display text-xl font-bold"><Icon size={19} className="text-solar" /> {title}</h2><Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-solar">Tout voir <ArrowRight size={14} /></Link></div><div className="border-t border-gray-200">{hasChildren ? children : <div className="py-10 text-center"><p className="text-sm text-gray-400">{empty}</p><Link href={addHref} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-solar"><Plus size={15} /> Ajouter</Link></div>}</div></div>;
}

export default function PartnerDashboard() {
  return <main className="site-container py-8 md:py-12"><SuspendedBanner /><AuthGuard partnerOnly><DashboardContent /></AuthGuard></main>;
}
