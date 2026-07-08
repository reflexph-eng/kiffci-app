import Link from 'next/link';
import { Category } from '@/types';

const FALLBACK_CATEGORIES: Category[] = [
  { id: '1', name: 'Nature',     icon: '🌿', color: '#10B981', type: 'experience', isVisible: true, order: 1, createdAt: 0 },
  { id: '2', name: 'Culture',    icon: '🎭', color: '#8B5CF6', type: 'experience', isVisible: true, order: 2, createdAt: 0 },
  { id: '3', name: 'Food',       icon: '🍜', color: '#F97316', type: 'experience', isVisible: true, order: 3, createdAt: 0 },
  { id: '4', name: 'Nightlife',  icon: '🌙', color: '#1F2937', type: 'experience', isVisible: true, order: 4, createdAt: 0 },
  { id: '5', name: 'Sport',      icon: '⚡', color: '#EF4444', type: 'experience', isVisible: true, order: 5, createdAt: 0 },
  { id: '6', name: 'Bien-être',  icon: '💆', color: '#06B6D4', type: 'experience', isVisible: true, order: 6, createdAt: 0 },
  { id: '7', name: 'Découverte', icon: '🧭', color: '#F59E0B', type: 'experience', isVisible: true, order: 7, createdAt: 0 },
  { id: '8', name: 'Couple',     icon: '💑', color: '#EC4899', type: 'experience', isVisible: true, order: 8, createdAt: 0 },
];

/** Chips de catégories arrondies, modernes — remplace la grille dense d'origine. */
export default function CategoryChips({ categories }: { categories: Category[] }) {
  const list = (categories.length > 0 ? categories : FALLBACK_CATEGORIES)
    // Filet de sécurité anti-doublons (voir incident de seed dupliqué).
    .filter((cat, i, arr) => arr.findIndex(c => c.name === cat.name) === i)
    .slice(0, 8);

  return (
    <div className="relative">
      <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {list.map(cat => (
          <Link key={cat.id} href={`/experiences?category=${encodeURIComponent(cat.name)}`}
            className="shrink-0 flex items-center gap-1.5 bg-white border border-gray-100 rounded-full px-4 py-2.5 text-sm font-medium text-anthracite shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-solar/30 hover:text-solar transition-all duration-200">
            <span>{cat.icon}</span> {cat.name}
          </Link>
        ))}
      </div>
      {/* Dégradé de fondu — signale qu'il y a plus de contenu à faire défiler */}
      <div className="pointer-events-none absolute top-0 right-0 h-full w-10 bg-gradient-to-l from-ivory to-transparent" />
    </div>
  );
}
