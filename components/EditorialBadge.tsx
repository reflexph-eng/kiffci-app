import { TrendingUp, Heart, Sparkles, Trophy } from 'lucide-react';

export type EditorialBadge = 'tendance' | 'coupdecoeur' | 'nouveau' | 'top10';

const CONFIG: Record<EditorialBadge, { label: string; icon: typeof TrendingUp; className: string }> = {
  tendance:    { label: 'Tendance',     icon: TrendingUp, className: 'bg-anthracite text-white' },
  coupdecoeur: { label: 'Coup de cœur', icon: Heart,       className: 'bg-pink-500 text-white' },
  nouveau:     { label: 'Nouveau',      icon: Sparkles,    className: 'bg-lagoon text-white' },
  top10:       { label: 'Top 10',       icon: Trophy,      className: 'bg-solar text-white' },
};

/** Calcule automatiquement le badge "Nouveau" à partir de la date de création (14 jours). */
export function computeAutoBadge(createdAt?: number, isFeatured?: boolean): EditorialBadge | undefined {
  if (createdAt && Date.now() - createdAt < 14 * 24 * 3600 * 1000) return 'nouveau';
  if (isFeatured) return 'coupdecoeur';
  return undefined;
}

export default function EditorialBadgePill({ badge }: { badge?: EditorialBadge }) {
  if (!badge) return null;
  const { label, icon: Icon, className } = CONFIG[badge];
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${className}`}>
      <Icon size={11} aria-hidden /> {label}
    </span>
  );
}
