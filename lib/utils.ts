import { Badge } from '@/types';

export function fcfa(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
}

export function levelFromPoints(points: number): {
  level: string;
  next: number;
  progress: number;
} {
  const levels = [
    { min: 0,    label: 'Curieux',              next: 300  },
    { min: 300,  label: 'Explorateur',           next: 700  },
    { min: 700,  label: 'Aventurier',             next: 1500 },
    { min: 1500, label: 'Connaisseur',            next: 3000 },
    { min: 3000, label: "Expert Côte d'Ivoire",   next: 5000 },
    { min: 5000, label: 'Légende KIFFCI',         next: 5000 },
  ];
  const current =
    [...levels].reverse().find((l) => points >= l.min) ?? levels[0];
  const prev = levels.find((l) => l.label === current.label) ?? levels[0];
  const progress =
    current.next === prev.min
      ? 100
      : Math.round(((points - prev.min) / (current.next - prev.min)) * 100);
  return {
    level:    current.label,
    next:     current.next,
    progress: Math.min(progress, 100),
  };
}

const LEVEL_ORDER = ['Curieux', 'Explorateur', 'Aventurier', 'Connaisseur', "Expert Côte d'Ivoire", 'Légende KIFFCI'];

/** Niveau minimum requis pour voir un contenu encore en accès prioritaire. */
export const EARLY_ACCESS_MIN_LEVEL = 'Aventurier';

function levelIndex(level: string): number {
  const i = LEVEL_ORDER.indexOf(level);
  return i === -1 ? 0 : i;
}

/**
 * Filtre les contenus encore en fenêtre d'accès prioritaire (earlyAccessUntil futur)
 * pour les visiteurs dont le niveau est en-dessous du seuil requis. Palier 1 —
 * récompense les niveaux élevés par un accès en avant-première, sans dépendance
 * à un partenaire.
 */
export function filterEarlyAccess<T extends { earlyAccessUntil?: number }>(
  items: T[],
  userPoints: number | undefined
): T[] {
  const now = Date.now();
  const userLevelIdx = levelIndex(levelFromPoints(userPoints ?? 0).level);
  const requiredIdx = levelIndex(EARLY_ACCESS_MIN_LEVEL);
  return items.filter(item => {
    if (!item.earlyAccessUntil || item.earlyAccessUntil <= now) return true;
    return userLevelIdx >= requiredIdx;
  });
}

export const BADGE_DEFINITIONS: Badge[] = [
  {
    id: 'abidjan',
    emoji: '🌆',
    label: "Explorateur d'Abidjan",
    description: 'Visite 5 expériences à Abidjan',
    condition: { type: 'count', count: 5 },
  },
  {
    id: 'nature',
    emoji: '🌿',
    label: 'Aventurier Nature',
    description: 'Réalise 3 expériences Nature',
    condition: { type: 'category', category: 'Nature', count: 3 },
  },
  {
    id: 'culture',
    emoji: '🎭',
    label: 'Amateur de Culture',
    description: 'Visite 3 lieux culturels',
    condition: { type: 'category', category: 'Culture', count: 3 },
  },
  {
    id: 'food',
    emoji: '🍜',
    label: 'Chasseur de Saveurs',
    description: 'Teste 4 expériences Food',
    condition: { type: 'category', category: 'Food', count: 4 },
  },
  {
    id: 'night',
    emoji: '🌙',
    label: 'Roi des Afterworks',
    description: 'Sors 3 fois en Nightlife',
    condition: { type: 'category', category: 'Nightlife', count: 3 },
  },
  {
    id: 'voyageur',
    emoji: '✈️',
    label: 'Voyageur Ivoirien',
    description: '10 expériences validées',
    condition: { type: 'count', count: 10 },
  },
  {
    id: 'premium',
    emoji: '⭐',
    label: 'Connaisseur Premium',
    description: 'Réalise 2 expériences Premium',
    condition: { type: 'count', count: 2 },
  },
  {
    id: 'social',
    emoji: '👥',
    label: 'Esprit de Groupe',
    description: '20 expériences validées',
    condition: { type: 'count', count: 20 },
  },
];
