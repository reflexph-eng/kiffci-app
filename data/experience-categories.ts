import { Category } from '@/types';

export const EXPERIENCE_CATEGORY_SEEDS: Omit<Category, 'id' | 'createdAt'>[] = [
  { name: 'Gastronomie', icon: '🍲', color: '#F97316', type: 'experience', isVisible: true, order: 1 },
  { name: 'Tourisme culturel', icon: '🎭', color: '#8B5CF6', type: 'experience', isVisible: true, order: 2 },
  { name: 'Tourisme écologique', icon: '🌿', color: '#10B981', type: 'experience', isVisible: true, order: 3 },
  { name: 'Aventure', icon: '🧭', color: '#EF4444', type: 'experience', isVisible: true, order: 4 },
  { name: 'Famille', icon: '👨‍👩‍👧', color: '#3B82F6', type: 'experience', isVisible: true, order: 5 },
  { name: 'Bien-être', icon: '💆', color: '#EC4899', type: 'experience', isVisible: true, order: 6 },
  { name: 'Sport', icon: '🏆', color: '#84CC16', type: 'experience', isVisible: true, order: 7 },
  { name: 'Vie nocturne', icon: '🌙', color: '#1F2937', type: 'experience', isVisible: true, order: 8 },
  { name: 'Centre aéré', icon: '🎨', color: '#06B6D4', type: 'experience', isVisible: true, order: 9 },
  { name: 'Colonie de vacances', icon: '⛺', color: '#F59E0B', type: 'experience', isVisible: true, order: 10 },
  { name: 'Camping', icon: '🏕️', color: '#10B981', type: 'experience', isVisible: true, order: 11 },
  { name: 'Tourisme religieux', icon: '🕊️', color: '#8B5CF6', type: 'experience', isVisible: true, order: 12 },
  { name: 'Tourisme communautaire', icon: '🤝', color: '#10B981', type: 'experience', isVisible: true, order: 13 },
  { name: 'Artisanat', icon: '🧵', color: '#F97316', type: 'experience', isVisible: true, order: 14 },
  { name: 'Festivals', icon: '🎪', color: '#EC4899', type: 'experience', isVisible: true, order: 15 },
  { name: 'Tourisme balnéaire', icon: '🏖️', color: '#06B6D4', type: 'experience', isVisible: true, order: 16 },
  { name: 'Autre', icon: '➕', color: '#6B7280', type: 'experience', isVisible: true, order: 99 },
];
