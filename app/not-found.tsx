import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="site-container flex min-h-[68vh] items-center justify-center py-16 text-center">
      <div className="max-w-xl">
        <Compass className="mx-auto mb-6 text-solar" size={48} aria-hidden />
        <p className="mb-3 text-xs font-bold uppercase tracking-[.22em] text-solar">Erreur 404</p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-anthracite md:text-6xl">Cette destination reste à découvrir.</h1>
        <p className="mx-auto mt-5 max-w-md text-gray-500">La page demandée n’existe plus ou son adresse a changé.</p>
        <Link href="/" className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-xl bg-anthracite px-5 py-3 text-sm font-bold text-white transition hover:bg-solar">
          <ArrowLeft size={16} /> Retour à l’accueil
        </Link>
      </div>
    </main>
  );
}
