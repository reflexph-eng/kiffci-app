'use client';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';

export default function Page() {
  const items = ['Fiches publiques et contacts', 'Statistiques de performance', 'Publication d’événements', 'Options de visibilité avancée'];
  return <main className="site-container py-10 md:py-14"><AuthGuard partnerOnly><div className="mx-auto max-w-4xl"><Link href="/partner/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-solar"><ArrowLeft size={16}/> Retour au tableau de bord</Link><header className="mt-7 border-b border-gray-200 pb-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-solar">Espace partenaire</p><h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">Mon abonnement</h1><p className="mt-4 max-w-2xl leading-7 text-gray-500">Consulte ton niveau de service et prépare les futures options professionnelles.</p></header><section className="py-8"><div className="divide-y divide-gray-100 border-y border-gray-200">{items.map(item => <div key={item} className="flex items-center gap-4 py-5"><CheckCircle2 className="shrink-0 text-solar" size={20}/><span className="font-medium text-anthracite">{item}</span></div>)}</div><div className="mt-8 rounded-2xl bg-orange-50 p-5 text-sm leading-6 text-gray-600">Ce module est préparé pour le parcours partenaire Sprint 4. Les activations commerciales, paiements ou dépôts de pièces seront branchés sans modifier les données existantes lors de leur mise en service.</div></section></div></AuthGuard></main>;
}
