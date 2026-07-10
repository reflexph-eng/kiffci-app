import Link from 'next/link';
import { Category } from '@/types';

const FALLBACK_CATEGORIES: Category[] = [
  { id: '1', name: 'Nature', icon: '🌿', color: '#10B981', type: 'experience', isVisible: true, order: 1, createdAt: 0 },
  { id: '2', name: 'Culture', icon: '🎭', color: '#8B5CF6', type: 'experience', isVisible: true, order: 2, createdAt: 0 },
  { id: '3', name: 'Food', icon: '🍜', color: '#F97316', type: 'experience', isVisible: true, order: 3, createdAt: 0 },
  { id: '4', name: 'Nightlife', icon: '🌙', color: '#1F2937', type: 'experience', isVisible: true, order: 4, createdAt: 0 },
  { id: '5', name: 'Sport', icon: '⚡', color: '#EF4444', type: 'experience', isVisible: true, order: 5, createdAt: 0 },
  { id: '6', name: 'Bien-être', icon: '💆', color: '#06B6D4', type: 'experience', isVisible: true, order: 6, createdAt: 0 },
  { id: '7', name: 'Découverte', icon: '🧭', color: '#F59E0B', type: 'experience', isVisible: true, order: 7, createdAt: 0 },
  { id: '8', name: 'Couple', icon: '💑', color: '#EC4899', type: 'experience', isVisible: true, order: 8, createdAt: 0 },
];

export default function CategoryChips({ categories }: { categories: Category[] }) {
  const list = (categories.length > 0 ? categories : FALLBACK_CATEGORIES)
    .filter((cat, i, arr) => arr.findIndex(c => c.name === cat.name) === i)
    .slice(0, 8);

  return (
    <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-none">
      {list.map(cat => (
        <Link key={cat.id} href={`/experiences?category=${encodeURIComponent(cat.name)}`}
          className="shrink-0 border-b border-white/40 pb-1 text-sm font-medium text-white/85 transition hover:border-solar hover:text-white">
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
