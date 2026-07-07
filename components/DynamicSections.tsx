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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => {
              if (section.contentType === 'experiences')    return <ExperienceCard    key={item.id} e={item as Experience} />;
              if (section.contentType === 'establishments')  return <EstablishmentCard key={item.id} e={item as Establishment} />;
              return <EventCard key={item.id} e={item as KiffEvent} />;
            })}
          </div>
        </section>
      ))}
    </>
  );
}
