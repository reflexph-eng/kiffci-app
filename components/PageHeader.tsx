/**
 * PageHeader — bandeau standard des pages internes (Sprint 1).
 * Dégradé aux couleurs de la marque + logo en filigrane.
 */
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Crumb { label: string; href?: string }

interface Props {
  title: string;
  subtitle?: string;
  crumbs?: Crumb[];
}

export default function PageHeader({ title, subtitle, crumbs }: Props) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-solar via-orange-500 to-amber-400">
      {/* Logo en filigrane */}
      <img
        src="/logo.png" alt="" aria-hidden width={260} height={260}
        className="absolute -right-10 -bottom-16 opacity-10 pointer-events-none select-none rotate-12"
        style={{ objectFit: 'contain' }}
      />
      <div className="relative max-w-7xl mx-auto px-4 py-10 md:py-12">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs text-white/80 mb-3">
            <Link href="/" className="hover:text-white transition">Accueil</Link>
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight size={12} aria-hidden />
                {c.href
                  ? <Link href={c.href} className="hover:text-white transition">{c.label}</Link>
                  : <span className="text-white font-medium">{c.label}</span>}
              </span>
            ))}
          </nav>
        )}
        <h1 className="font-display font-bold text-3xl md:text-4xl text-white drop-shadow-sm">{title}</h1>
        {subtitle && <p className="mt-2 text-white/90 max-w-2xl">{subtitle}</p>}
      </div>
    </div>
  );
}
