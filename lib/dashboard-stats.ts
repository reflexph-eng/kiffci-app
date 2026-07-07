/**
 * lib/dashboard-stats.ts — Observatoire : agrégation des statistiques (Sprint 5)
 * Calcule tout côté client à partir des collections existantes — aucune
 * nouvelle collection d'événements n'est nécessaire pour cette V1.
 */
import { getExperiences } from './firestore';
import { getAllEstablishmentsAdmin, getAllEventsAdmin } from './partner-firestore';
import { getAllUsersAdmin } from './users-admin';
import { getAllReviewsAdmin } from './reviews-firestore';
import { getAllAdsAdmin } from './ads-firestore';
import { Experience, Establishment, KiffEvent, AppUser, Review, AdCreative } from '@/types';

export type TopItem = { id: string; name: string; value: number; kind: 'experience' | 'establishment' | 'event' };

export type DashboardStats = {
  usersTotal: number;
  usersByRole: Record<string, number>;
  usersSuspended: number;

  establishmentsTotal: number;
  establishmentsByStatus: Record<string, number>;
  establishmentsVerified: number;

  eventsTotal: number;
  eventsByStatus: Record<string, number>;

  experiencesTotal: number;

  totalViews: number;
  totalWhatsappClicks: number;
  totalPhoneClicks: number;

  reviewsTotal: number;
  reviewsAverage: number;
  reviewsFlagged: number;

  adsTotal: number;
  adsActive: number;
  adsViews: number;
  adsClicks: number;

  topExperiences: TopItem[];
  topEstablishments: TopItem[];

  byCity: { city: string; count: number }[];
};

function countBy<T extends string>(items: { }[], get: (i: any) => T): Record<string, number> {
  const out: Record<string, number> = {};
  for (const i of items) {
    const k = get(i);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

export async function computeDashboardStats(): Promise<DashboardStats> {
  const [experiences, establishments, events, users, reviews, ads] = await Promise.all([
    getExperiences(),
    getAllEstablishmentsAdmin(),
    getAllEventsAdmin(),
    getAllUsersAdmin(),
    getAllReviewsAdmin(),
    getAllAdsAdmin(),
  ]) as [Experience[], Establishment[], KiffEvent[], AppUser[], Review[], AdCreative[]];

  const totalViews =
    experiences.reduce((s, e) => s + (e.views ?? 0), 0) +
    establishments.reduce((s, e) => s + e.views, 0) +
    events.reduce((s, e) => s + e.views, 0);

  const totalWhatsappClicks =
    establishments.reduce((s, e) => s + e.whatsappClicks, 0) +
    events.reduce((s, e) => s + e.whatsappClicks, 0);

  const totalPhoneClicks =
    establishments.reduce((s, e) => s + e.phoneClicks, 0) +
    events.reduce((s, e) => s + e.phoneClicks, 0);

  const visibleReviews = reviews.filter(r => !r.isHidden);
  const reviewsAverage = visibleReviews.length > 0
    ? visibleReviews.reduce((s, r) => s + r.rating, 0) / visibleReviews.length
    : 0;

  const topExperiences: TopItem[] = [...experiences]
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, 5)
    .map(e => ({ id: e.id, name: e.title, value: e.views ?? 0, kind: 'experience' as const }));

  const topEstablishments: TopItem[] = [...establishments]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map(e => ({ id: e.id, name: e.name, value: e.views, kind: 'establishment' as const }));

  const cityCounts: Record<string, number> = {};
  [...establishments, ...events].forEach(e => {
    const city = 'city' in e ? e.city : '';
    if (!city) return;
    cityCounts[city] = (cityCounts[city] ?? 0) + 1;
  });
  const byCity = Object.entries(cityCounts)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    usersTotal: users.length,
    usersByRole: countBy(users, u => (u as AppUser).role),
    usersSuspended: users.filter(u => u.isSuspended).length,

    establishmentsTotal: establishments.length,
    establishmentsByStatus: countBy(establishments, e => (e as Establishment).status),
    establishmentsVerified: establishments.filter(e => e.isVerified).length,

    eventsTotal: events.length,
    eventsByStatus: countBy(events, e => (e as KiffEvent).status),

    experiencesTotal: experiences.length,

    totalViews, totalWhatsappClicks, totalPhoneClicks,

    reviewsTotal: visibleReviews.length,
    reviewsAverage: Math.round(reviewsAverage * 10) / 10,
    reviewsFlagged: reviews.filter(r => r.isFlagged && !r.isHidden).length,

    adsTotal: ads.length,
    adsActive: ads.filter(a => a.isActive).length,
    adsViews: ads.reduce((s, a) => s + a.views, 0),
    adsClicks: ads.reduce((s, a) => s + a.clicks, 0),

    topExperiences,
    topEstablishments,
    byCity,
  };
}
