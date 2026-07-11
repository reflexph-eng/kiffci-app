'use client';
/**
 * DynamicSections — affiche les rubriques créées depuis /admin/sections.
 * Ne rend rien si aucune rubrique active ou si une rubrique ne résout aucun contenu.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getActiveSections, resolveSectionContent } from '@/lib/sections-firestore';
import { HomeSection, Experience, Establishment, KiffEvent } from '@/types';
import ExperienceCard from './ExperienceCard';
import EstablishmentCard from './EstablishmentCard';
import EventCard from './EventCard';

type Resolved = { section: HomeSection; items: (Experience | Establishment | KiffEvent)[] };

const LINK_BY_TYPE: Record<HomeSection['contentType'], string> = {
  experiences: '/experiences', establishments: '/establishments', events: '/events',
};

export default function DynamicSections() {
  const [resolved, setResolved] = useState<Resolved[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getActiveSections().then(async (sections) => {
      const results = await Promise.all(
        sections.map(async section => ({ section, items: await resolveSectionContent(section) }))
      );
      if (!cancelled) setResolved(results.filter(r => r.items.length > 0));
    }).catch(() => { if (!cancelled) setResolved([]); });
    return () => { cancelled = true; };
  }, []);

  if (!resolved || resolved.length === 0) return null;

  return (
    <>
      {resolved.map(({ section, items }) => (
        <section key={section.id} className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-3xl text-anthracite">{section.title}</h2>
              {section.subtitle && <p className="text-gray-500 mt-1">{section.subtitle}</p>}
            </div>
            <Link href={LINK_BY_TYPE[section.contentType]}
              className="hidden sm:block text-sm font-medium text-solar hover:underline shrink-0">
              Tout voir →
            </Link>
          </div>

          <div className="relative -mx-4 px-4">
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none">
              {items.map(item => (
                <div key={item.id} className="shrink-0 snap-start w-[68%] sm:w-[38%] md:w-[28%] lg:w-[20%] xl:w-[14.8%]">
                  {section.contentType === 'experiences'    && <ExperienceCard    e={item as Experience} badge={section.badge} compact />}
                  {section.contentType === 'establishments' && <EstablishmentCard e={item as Establishment} badge={section.badge} compact />}
                  {section.contentType === 'events'         && <EventCard e={item as KiffEvent} badge={section.badge} compact />}
                </div>
              ))}
            </div>
            {/* Dégradé de fondu — signale qu'il y a plus de contenu à faire défiler */}
            <div className="pointer-events-none absolute top-0 right-0 h-[calc(100%-8px)] w-12 bg-gradient-to-l from-white to-transparent hidden sm:block" />
          </div>
        </section>
      ))}
    </>
  );
}
