import Link from 'next/link';
import { Category } from '@/types';
import { Compass, Dumbbell, Heart, Landmark, Leaf, Moon, Sparkles, Utensils } from 'lucide-react';

const FALLBACK_CATEGORIES: Category[] = [
  { id: '1', name: 'Nature',     icon: 'nature', color: '#10B981', type: 'experience', isVisible: true, order: 1, createdAt: 0 },
  { id: '2', name: 'Culture',    icon: 'culture', color: '#8B5CF6', type: 'experience', isVisible: true, order: 2, createdAt: 0 },
  { id: '3', name: 'Food',       icon: 'food', color: '#F97316', type: 'experience', isVisible: true, order: 3, createdAt: 0 },
  { id: '4', name: 'Nightlife',  icon: 'nightlife', color: '#1F2937', type: 'experience', isVisible: true, order: 4, createdAt: 0 },
  { id: '5', name: 'Sport',      icon: 'sport', color: '#EF4444', type: 'experience', isVisible: true, order: 5, createdAt: 0 },
  { id: '6', name: 'Bien-être',  icon: 'wellness', color: '#06B6D4', type: 'experience', isVisible: true, order: 6, createdAt: 0 },
  { id: '7', name: 'Découverte', icon: 'discover', color: '#F59E0B', type: 'experience', isVisible: true, order: 7, createdAt: 0 },
  { id: '8', name: 'Couple',     icon: 'couple', color: '#EC4899', type: 'experience', isVisible: true, order: 8, createdAt: 0 },
];

const CATEGORY_ICONS = [
  { test: /nature|plage|plein air|outdoor/i, icon: Leaf },
  { test: /culture|musée|musee|patrimoine|art/i, icon: Landmark },
  { test: /food|restaurant|resto|gastronomie|cuisine/i, icon: Utensils },
  { test: /night|soirée|soiree|bar|club|nightlife/i, icon: Moon },
  { test: /sport|fitness|jeu/i, icon: Dumbbell },
  { test: /bien|spa|détente|detente|wellness/i, icon: Sparkles },
  { test: /découverte|decouverte|exploration|tourisme/i, icon: Compass },
  { test: /couple|romantique|amour/i, icon: Heart },
];

function getCategoryIcon(name: string) {
  return CATEGORY_ICONS.find(item => item.test.test(name))?.icon || Sparkles;
}

/** Barre d'accès rapide premium : catégories en liens, sans emojis, avec icônes vectorielles cohérentes. */
export default function CategoryChips({ categories }: { categories: Category[] }) {
  const list = (categories.length > 0 ? categories : FALLBACK_CATEGORIES)
    .filter((cat, i, arr) => arr.findIndex(c => c.name === cat.name) === i)
    .slice(0, 8);

  return (
    <div className="relative">
      <div className="flex gap-1.5 sm:gap-2 md:gap-3 overflow-x-auto px-1 py-1 scrollbar-none justify-start md:justify-center">
        {list.map(cat => {
          const Icon = getCategoryIcon(cat.name);
          return (
            <Link
              key={cat.id}
              href={`/experiences?category=${encodeURIComponent(cat.name)}`}
              className="group shrink-0 inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 text-sm md:text-base font-semibold text-anthracite/85 hover:bg-ivory hover:text-solar hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
            >
              <Icon size={17} strokeWidth={1.9} className="text-gray-500 transition-colors group-hover:text-solar" />
              <span>{cat.name}</span>
            </Link>
          );
        })}
      </div>
      <div className="md:hidden pointer-events-none absolute top-0 right-0 h-full w-10 bg-gradient-to-l from-white to-transparent" />
    </div>
  );
}
