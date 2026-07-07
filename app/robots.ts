import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/partner', '/profile', '/favorites', '/passport', '/login', '/register'] },
    ],
    sitemap: 'https://kiffci-prod.vercel.app/sitemap.xml',
  };
}
