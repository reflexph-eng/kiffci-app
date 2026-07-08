import { HighlightBadge, HighlightFields, HighlightSection, HighlightStatus, HighlightType } from '@/types';
import { EditorialBadge } from '@/components/EditorialBadge';

export const HIGHLIGHT_BADGES: { value: HighlightBadge; label: string }[] = [
  { value: 'none', label: 'Aucun' },
  { value: 'new', label: 'Nouveau' },
  { value: 'trending', label: 'Tendance' },
  { value: 'favorite', label: 'Coup de cœur KIFFCI' },
  { value: 'top10', label: 'Top 10' },
  { value: 'sponsored', label: 'Sponsorisé' },
];

export const HIGHLIGHT_SECTIONS: { value: HighlightSection; label: string }[] = [
  { value: 'trending', label: 'Tendances cette semaine' },
  { value: 'favorite', label: 'Coups de cœur KIFFCI' },
  { value: 'family', label: 'En famille' },
  { value: 'weekend', label: 'Sorties du week-end' },
  { value: 'nearby', label: 'Près de vous' },
];

export const HIGHLIGHT_STATUSES: { value: HighlightStatus; label: string }[] = [
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'En attente' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expirée' },
  { value: 'rejected', label: 'Refusée' },
];

export const HIGHLIGHT_TYPES: { value: HighlightType; label: string }[] = [
  { value: 'editorial', label: 'Éditorial KIFFCI' },
  { value: 'sponsored', label: 'Sponsorisé / paiement futur' },
];

export type HighlightPatch = {
  highlightType?: HighlightType;
  highlightStatus?: HighlightStatus;
  highlightBadge?: HighlightBadge;
  highlightSections?: HighlightSection[];
  highlightStartAt?: number | null;
  highlightEndAt?: number | null;
  highlightRank?: number | null;
  highlightPaymentRef?: string | null;
  highlightAmount?: number | null;
  highlightCurrency?: 'XOF';
  isFeatured?: boolean;
  isSponsored?: boolean;
  premiumUntil?: number | null;
};

export function dateInputToTimestamp(value: string): number | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

export function timestampToDateInput(value?: number): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function isHighlightActive(item: HighlightFields, now = Date.now()): boolean {
  if (item.highlightStatus !== 'active') return false;
  if (item.highlightStartAt && item.highlightStartAt > now) return false;
  if (item.highlightEndAt && item.highlightEndAt < now) return false;
  return true;
}

export function mapHighlightBadgeToEditorial(badge?: HighlightBadge): EditorialBadge | undefined {
  if (!badge || badge === 'none' || badge === 'sponsored') return undefined;
  if (badge === 'new') return 'nouveau';
  if (badge === 'trending') return 'tendance';
  if (badge === 'favorite') return 'coupdecoeur';
  if (badge === 'top10') return 'top10';
  return undefined;
}

export function getEditorialBadgeFromHighlight(item: HighlightFields): EditorialBadge | undefined {
  if (!isHighlightActive(item)) return undefined;
  return mapHighlightBadgeToEditorial(item.highlightBadge);
}

export function isSponsoredHighlight(item: HighlightFields): boolean {
  return isHighlightActive(item) && (item.highlightType === 'sponsored' || item.highlightBadge === 'sponsored');
}

export function highlightRank(item: HighlightFields): number {
  return typeof item.highlightRank === 'number' ? item.highlightRank : 999;
}

export function byHighlightRank<T extends HighlightFields>(a: T, b: T) {
  return highlightRank(a) - highlightRank(b);
}
