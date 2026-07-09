/**
 * lib/highlight-sections.ts — Alimente les 5 sections canoniques de mise en
 * avant (Tendances, Coups de cœur, Famille, Week-end, Près de vous) à partir
 * du tag `highlightSections` posé par l'admin sur chaque établissement/
 * événement/expérience (voir HighlightModal, /admin/partners).
 *
 * Volontairement séparé du système /admin/sections (rubriques 100% libres) :
 * les deux coexistent, celui-ci ne gère que les 5 catégories fixes du
 * dictionnaire HIGHLIGHT_SECTIONS.
 */
import { getExperiences } from './firestore';
import { getApprovedEstablishments, getApprovedEvents } from './partner-firestore';
import { isHighlightActive, byHighlightRank } from './highlights';
import { Establishment, Experience, HighlightSection, KiffEvent } from '@/types';

export type HighlightItem =
  | { kind: 'establishment'; item: Establishment }
  | { kind: 'event'; item: KiffEvent }
  | { kind: 'experience'; item: Experience };

/** Pool unique de tout ce qui peut porter un tag de mise en avant, une seule fois par appel. */
async function getHighlightPool(): Promise<HighlightItem[]> {
  const [experiences, establishments, events] = await Promise.all([
    getExperiences().catch(() => []),
    getApprovedEstablishments().catch(() => []),
    getApprovedEvents().catch(() => []),
  ]);
  return [
    ...establishments.map(item => ({ kind: 'establishment' as const, item })),
    ...events.map(item => ({ kind: 'event' as const, item })),
    ...experiences.map(item => ({ kind: 'experience' as const, item })),
  ];
}

/** Retourne, pour chacune des 5 sections canoniques, les éléments actifs qui lui sont tagués — triés par rang, limités. */
export async function resolveHighlightSections(limitPerSection = 8): Promise<Record<HighlightSection, HighlightItem[]>> {
  const pool = await getHighlightPool();

  const active = pool.filter(({ item }) => isHighlightActive(item));

  function forSection(key: HighlightSection): HighlightItem[] {
    return active
      .filter(({ item }) => item.highlightSections?.includes(key))
      .sort((a, b) => byHighlightRank(a.item, b.item))
      .slice(0, limitPerSection);
  }

  return {
    trending: forSection('trending'),
    favorite: forSection('favorite'),
    family:   forSection('family'),
    weekend:  forSection('weekend'),
    nearby:   forSection('nearby'),
  };
}
