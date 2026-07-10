import { AdminPermission, AppUser } from '@/types';

export const ADMIN_PERMISSIONS: { key: AdminPermission; label: string; description: string }[] = [
  { key: 'dashboard.view', label: 'Tableau de bord', description: 'Accéder au cockpit et aux indicateurs principaux.' },
  { key: 'content.manage', label: 'Contenus', description: 'Gérer expériences, défis, catégories, rubriques et pages.' },
  { key: 'moderation.manage', label: 'Modération', description: 'Valider ou refuser établissements, événements et avis.' },
  { key: 'partners.manage', label: 'Partenaires', description: 'Gérer les annonceurs, leurs offres Premium et la sponsorisation.' },
  { key: 'marketing.manage', label: 'Visibilité & campagnes', description: 'Gérer campagnes, bannières, publicités et mises en avant.' },
  { key: 'analytics.view', label: 'Statistiques', description: 'Consulter l’observatoire et les performances.' },
  { key: 'users.manage', label: 'Utilisateurs & rôles', description: 'Gérer comptes, rôles, suspensions et permissions.' },
  { key: 'settings.manage', label: 'Configuration', description: 'Gérer identité, menu, footer et paramètres.' },
  { key: 'system.manage', label: 'Outils système', description: 'Exécuter migrations, synchronisations et données démo.' },
  { key: 'audit.view', label: 'Journal d’audit', description: 'Consulter les actions administratives sensibles.' },
];

export const ALL_ADMIN_PERMISSIONS = ADMIN_PERMISSIONS.map(item => item.key);

export function hasPermission(user: AppUser | null | undefined, permission?: AdminPermission): boolean {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  if (user.role !== 'admin') return false;
  if (!permission) return true;
  // Compatibilité avec les comptes admin existants : sans champ permissions, accès historique conservé.
  if (!Array.isArray(user.permissions)) return true;
  return user.permissions.includes(permission);
}

export function permissionForPath(pathname: string): AdminPermission {
  if (pathname === '/admin') return 'dashboard.view';
  if (pathname.startsWith('/admin/moderation') || pathname.startsWith('/admin/reviews')) return 'moderation.manage';
  if (pathname.startsWith('/admin/partners')) return 'partners.manage';
  if (pathname.startsWith('/admin/users')) return 'users.manage';
  if (pathname.startsWith('/admin/stats')) return 'analytics.view';
  if (pathname.startsWith('/admin/campaigns') || pathname.startsWith('/admin/banners') || pathname.startsWith('/admin/ads') || pathname.startsWith('/admin/highlights') || pathname.startsWith('/admin/raffle')) return 'marketing.manage';
  if (pathname.startsWith('/admin/settings') || pathname.startsWith('/admin/menu') || pathname.startsWith('/admin/footer')) return 'settings.manage';
  return 'content.manage';
}
