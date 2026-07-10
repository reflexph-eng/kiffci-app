import type { MetadataRoute } from 'next';

const BASE_URL = 'https://kiffci-prod.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/experiences`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/establishments`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/events`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/map`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE_URL}/challenges`, changeFrequency: 'weekly', priority: 0.5 },
  ];
}
