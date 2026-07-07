import type { MetadataRoute } from 'next';
import { getExperiences } from '@/lib/firestore';
import { getApprovedEstablishments, getApprovedEvents } from '@/lib/partner-firestore';
import { getFooterPages } from '@/lib/pages-firestore';

const BASE_URL = 'https://kiffci-prod.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,              changeFrequency: 'daily',   priority: 1 },
    { url: `${BASE_URL}/experiences`,    changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/establishments`, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/events`,         changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/map`,            changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${BASE_URL}/challenges`,     changeFrequency: 'weekly',  priority: 0.5 },
  ];

  const [experiences, establishments, events, pages] = await Promise.all([
    getExperiences().catch(() => []),
    getApprovedEstablishments().catch(() => []),
    getApprovedEvents().catch(() => []),
    getFooterPages().catch(() => []),
  ]);

  const experienceRoutes: MetadataRoute.Sitemap = experiences.map(e => ({
    url: `${BASE_URL}/experiences/${e.id}`,
    lastModified: e.updatedAt ? new Date(e.updatedAt) : undefined,
    changeFrequency: 'monthly', priority: 0.7,
  }));

  const establishmentRoutes: MetadataRoute.Sitemap = establishments.map(e => ({
    url: `${BASE_URL}/establishments/${e.id}`,
    lastModified: e.updatedAt ? new Date(e.updatedAt) : undefined,
    changeFrequency: 'monthly', priority: 0.7,
  }));

  const eventRoutes: MetadataRoute.Sitemap = events.map(e => ({
    url: `${BASE_URL}/events/${e.id}`,
    lastModified: e.updatedAt ? new Date(e.updatedAt) : undefined,
    changeFrequency: 'weekly', priority: 0.6,
  }));

  const pageRoutes: MetadataRoute.Sitemap = pages.map(p => ({
    url: `${BASE_URL}/p/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'yearly', priority: 0.3,
  }));

  return [...staticRoutes, ...experienceRoutes, ...establishmentRoutes, ...eventRoutes, ...pageRoutes];
}
