'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { hasPermission, permissionForPath } from '@/lib/permissions';
import { Activity, ArrowRight, BarChart3, Building2, Database, FileText, Gift, Image as ImageIcon, KeyRound, LayoutDashboard, LayoutGrid, Megaphone, Menu as MenuIcon, MessageSquare, PanelBottom, Settings, Shield, ShieldCheck, Sparkles, Tag, UserCircle, Users } from 'lucide-react';

type Stat = { label: string; value: number; tone?: string };
type Props = { email?: string | null; pendingCount: number; stats: Stat[]; migrating: boolean; migratingEst: boolean; backfilling: boolean; seeding: boolean; onMigrateCodes: () => void; onMigrateExperiences: () => void; onBackfillProfiles: () => void; onSeed: () => void; };

const groups = [
 { title:'Pilotage', items:[
  { href:'/admin/stats', icon:BarChart3, label:'Observatoire', sub:"Vue d’ensemble et tendances" },
  { href:'/admin/moderation', icon:Shield, label:'Centre de tâches', sub:'Validations et signalements' },
 ]},
 { title:'Contenus', items:[
  { href:'/admin/categories', icon:Tag, label:'Catégories', sub:'Ordre et visibilité' },
  { href:'/admin/category-proposals', icon:Sparkles, label:'Propositions de catégories', sub:'Suggestions des créateurs' },
  { href:'/admin/sections', icon:LayoutGrid, label:'Rubriques', sub:'Organisation de la homepage' },
  { href:'/admin/pages', icon:FileText, label:'Pages', sub:'À propos, FAQ et pages légales' },
  { href:'/admin/reviews', icon:MessageSquare, label:'Avis', sub:'Modération et signalements' },
 ]},
 { title:'Partenaires', items:[
  { href:'/admin/moderation', icon:Building2, label:'Demandes partenaires', sub:'Établissements et événements' },
  { href:'/admin/verifications', icon:ShieldCheck, label:'Vérification Créateurs', sub:'Dossiers, décisions et badges' },
  { href:'/admin/partners', icon:Sparkles, label:'Premium & Sponsorisé', sub:'Offres et visibilité payante' },
  { href:'/admin/users', icon:Users, label:'Utilisateurs', sub:'Comptes, rôles et suspensions' },
 ]},
 { title:'Visibilité', items:[
  { href:'/admin/campaigns', icon:Megaphone, label:'Campagnes', sub:'Promotions et activations' },
  { href:'/admin/banners', icon:ImageIcon, label:'Bannières', sub:'Visuels de la homepage' },
  { href:'/admin/highlights', icon:Sparkles, label:'Mises en avant', sub:'Badges et sélections éditoriales' },
  { href:'/admin/ads', icon:Megaphone, label:'Publicité', sub:'Emplacements publicitaires' },
  { href:'/admin/raffle', icon:Gift, label:'Tirage au sort', sub:'Récompenses mensuelles' },
 ]},
 { title:'Configuration', items:[
  { href:'/admin/settings', icon:Settings, label:'Paramètres', sub:'Hero, identité et maintenance' },
  { href:'/admin/menu', icon:MenuIcon, label:'Menu', sub:'Navigation publique' },
  { href:'/admin/footer', icon:PanelBottom, label:'Footer', sub:'Contacts et réseaux' },
 ]},
];

export default function AdminCockpit(props: Props) {
 const { appUser } = useAuth();
 const visibleGroups = groups.map(group => ({ ...group, items: group.items.filter(item => hasPermission(appUser, permissionForPath(item.href))) })).filter(group => group.items.length > 0);
 const canSystem = hasPermission(appUser, 'system.manage');
 return <section className="mb-10 space-y-8">
  <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
   <div><div className="mb-3 inline-flex items-center gap-2 rounded-full bg-solar/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-solar"><LayoutDashboard size={14}/> Cockpit KIFFCI</div>
   <h1 className="font-display text-4xl font-bold text-anthracite md:text-5xl">Bonjour, voici l’essentiel.</h1><p className="mt-2 text-sm text-gray-500">{props.email ? `Connecté : ${props.email}` : 'Administration de la plateforme'}</p></div>
   <Link href="/admin/moderation" className="inline-flex items-center justify-center gap-2 rounded-xl bg-anthracite px-4 py-3 text-sm font-bold text-white transition hover:bg-black"><Shield size={17}/>{props.pendingCount>0 ? `${props.pendingCount} action(s) en attente` : 'Ouvrir le centre de tâches'}</Link>
  </div>
  <div className="grid gap-px overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 sm:grid-cols-2 xl:grid-cols-4">{props.stats.map(stat=><div key={stat.label} className="bg-white px-5 py-5"><p className={`font-display text-3xl font-bold ${stat.tone ?? 'text-anthracite'}`}>{stat.value}</p><p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-400">{stat.label}</p></div>)}</div>
  <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
   <div className="rounded-2xl border border-gray-100 bg-white p-5"><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Navigation métier</p><h2 className="mt-1 font-display text-2xl font-bold text-anthracite">Gérer la plateforme</h2></div><Activity size={20} className="text-solar"/></div>
   <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">{visibleGroups.map(group=><div key={group.title}><p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">{group.title}</p><div className="divide-y divide-gray-100 border-t border-gray-100">{group.items.map(({href,icon:Icon,label,sub})=><Link key={`${group.title}-${label}`} href={href} className="group flex items-center gap-3 py-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition group-hover:bg-solar/10 group-hover:text-solar"><Icon size={15}/></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-anthracite">{label}</span><span className="block truncate text-xs text-gray-400">{sub}</span></span><ArrowRight size={14} className="text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-solar"/></Link>)}</div></div>)}</div></div>
   {canSystem && <aside className="rounded-2xl border border-gray-100 bg-white p-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Outils système</p><h2 className="mt-1 font-display text-2xl font-bold text-anthracite">Maintenance</h2><p className="mt-2 text-sm leading-6 text-gray-500">Actions techniques isolées du parcours quotidien.</p><div className="mt-5 space-y-2">
    <button onClick={props.onMigrateCodes} disabled={props.migrating} className="admin-system-action"><KeyRound size={16}/>{props.migrating?'Migration…':'Migrer les codes de passage'}</button>
    <button onClick={props.onMigrateExperiences} disabled={props.migratingEst} className="admin-system-action"><Building2 size={16}/>{props.migratingEst?'Conversion…':'Convertir en établissements'}</button>
    <button onClick={props.onBackfillProfiles} disabled={props.backfilling} className="admin-system-action"><UserCircle size={16}/>{props.backfilling?'Synchronisation…':'Synchroniser les profils publics'}</button>
    <button onClick={props.onSeed} disabled={props.seeding} className="admin-system-action text-red-600 hover:border-red-200 hover:bg-red-50"><Database size={16}/>{props.seeding?'Injection…':'Injecter les données démo'}</button>
   </div></aside>}
  </div>
 </section>;
}
