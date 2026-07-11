'use client';
/**
 * HighlightSections — les 5 catégories canoniques de mise en avant
 * (Tendances, Coups de cœur, Famille, Week-end, Près de vous), alimentées
 * automatiquement par les tags posés dans /admin/partners (HighlightModal).
 * Ne rend rien tant qu'aucun élément n'est tagué et actif pour une section.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { resolveHighlightSections, HighlightItem } from '@/lib/highlight-sections';
import { HIGHLIGHT_SECTIONS } from '@/lib/highlights';
import { HighlightSection, Experience, Establishment, KiffEvent } from '@/types';
import ExperienceCard from './ExperienceCard';
import EstablishmentCard from './EstablishmentCard';
import EventCard from './EventCard';

const LINK_BY_SECTION: Record<HighlightSection, string> = {
  trending: '/experiences', favorite: '/establishments', family: '/experiences',
  weekend: '/events', nearby: '/map',
};

const BADGE_BY_SECTION: Record<HighlightSection, 'tendance' | 'coupdecoeur' | undefined> = {
  trending: 'tendance', favorite: 'coupdecoeur', family: undefined, weekend: undefined, nearby: undefined,
};

function renderCard(entry: HighlightItem, badge?: 'tendance' | 'coupdecoeur') {
  if (entry.kind === 'establishment') return <EstablishmentCard e={entry.item as Establishment} badge={badge} compact />;
  if (entry.kind === 'event')         return <EventCard e={entry.item as KiffEvent} badge={badge} compact />;
  return <ExperienceCard e={entry.item as Experience} badge={badge} compact />;
}

export default function HighlightSections() {
  const [sections, setSections] = useState<Record<HighlightSection, HighlightItem[]> | null>(null);

  useEffect(() => {
    let cancelled = false;
    resolveHighlightSections()
      .then(r => { if (!cancelled) setSections(r); })
      .catch(() => { if (!cancelled) setSections(null); });
    return () => { cancelled = true; };
  }, []);

  if (!sections) return null;

  const nonEmpty = HIGHLIGHT_SECTIONS.filter(s => (sections[s.value]?.length ?? 0) > 0);
  if (nonEmpty.length === 0) return null;

  return (
    <>
      {nonEmpty.map(({ value, label }) => {
        const items = sections[value];
        return (
          <section key={value} className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-end justify-between mb-6">
              <h2 className="font-display font-bold text-3xl text-anthracite">{label}</h2>
              <Link href={LINK_BY_SECTION[value]}
                className="hidden sm:block text-sm font-medium text-solar hover:underline shrink-0">
                Tout voir →
              </Link>
            </div>

            <div className="relative -mx-4 px-4">
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none">
                {items.map(entry => (
                  <div key={`${entry.kind}-${entry.item.id}`} className="shrink-0 snap-start w-[68%] sm:w-[38%] md:w-[28%] lg:w-[20%] xl:w-[14.8%]">
                    {renderCard(entry, BADGE_BY_SECTION[value])}
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute top-0 right-0 h-[calc(100%-8px)] w-12 bg-gradient-to-l from-white to-transparent hidden sm:block" />
            </div>
          </section>
        );
      })}
    </>
  );
}
