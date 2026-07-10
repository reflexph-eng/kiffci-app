'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Compass, Map, Trophy, BookOpen, User, Shield,
  Menu, X, Heart, LogOut, LogIn, Store, Calendar, Building2, LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getNavItems, DEFAULT_NAV_ITEMS } from '@/lib/nav-firestore';
import NotificationBell from './NotificationBell';

/** Icône par défaut associée à chaque route connue ; toute nouvelle entrée retombe sur Compass. */
const ICONS_BY_HREF: Record<string, LucideIcon> = {
  '/experiences':    Compass,
  '/establishments': Building2,
  '/events':         Calendar,
  '/map':            Map,
  '/challenges':     Trophy,
};

/** Visible uniquement une fois connecté — non piloté par l'admin */
const AUTH_ITEMS = [
  { href: '/passport',  label: 'Passeport', icon: BookOpen },
  { href: '/favorites', label: 'Favoris',   icon: Heart },
  { href: '/profile',   label: 'Profil',    icon: User },
] as const;

export default function Nav() {
  const pathname = usePathname();
  const router   = useRouter();
  const { appUser, firebaseUser, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [publicItems, setPublicItems] = useState(
    DEFAULT_NAV_ITEMS.filter(i => i.isVisible).map(i => ({ href: i.href, label: i.label, icon: ICONS_BY_HREF[i.href] ?? Compass }))
  );

  useEffect(() => {
    getNavItems()
      .then(navItems => setPublicItems(
        navItems.filter(i => i.isVisible).map(i => ({ href: i.href, label: i.label, icon: ICONS_BY_HREF[i.href] ?? Compass }))
      ))
      .catch(() => {});
  }, []);

  async function handleSignOut() {
    await signOut();
    router.push('/');
    setOpen(false);
  }

  const items = [
    ...publicItems,
    ...(firebaseUser ? AUTH_ITEMS : []),
    ...(appUser?.role === 'partner' || (appUser?.role === 'admin' || appUser?.role === 'super_admin')
      ? [{ href: '/partner/dashboard' as const, label: 'Espace Annonceur', icon: Store }]
      : []),
    ...((appUser?.role === 'admin' || appUser?.role === 'super_admin')
      ? [{ href: '/admin' as const, label: 'Admin', icon: Shield }]
      : []),
    ...(appUser?.role === 'moderator'
      ? [{ href: '/admin/moderation' as const, label: 'Modération', icon: Shield }]
      : []),
  ];

  return (
    <nav aria-label="Navigation principale" className="sticky top-0 z-50 bg-white/92 backdrop-blur-xl border-b border-black/5 supports-[backdrop-filter]:bg-white/80">
      <div className="site-container py-3 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
          <img src="/logo.png" alt="Kiffci" width={38} height={38} style={{ objectFit: 'contain' }} />
          <div className="hidden sm:block">
            <p className="font-display font-bold text-lg leading-none text-anthracite">kiffci</p>
            <p className="text-gray-400 leading-none text-[10px] tracking-[0.15em]">VIS · EXPLORE · KIFFE</p>
          </div>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  active ? 'text-solar' : 'text-gray-600 hover:text-anthracite'
                }`}>
                <Icon size={15} />{label}
              </Link>
            );
          })}
          <NotificationBell />
          {firebaseUser ? (
            <button onClick={handleSignOut}
              className="flex items-center gap-1.5 px-2.5 py-2 text-sm font-medium text-gray-600 hover:text-anthracite transition-colors ml-1">
              <LogOut size={15} /> Déconnexion
            </button>
          ) : (
            <Link href="/login"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold bg-solar text-white hover:bg-orange-600 transition-colors ml-2">
              <LogIn size={15} /> Connexion
            </Link>
          )}
        </div>

        <button type="button" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open} className="md:hidden min-h-11 min-w-11 p-2 rounded-lg hover:bg-gray-100 transition" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="site-container py-3 grid grid-cols-1 gap-1">
            {items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link key={href} href={href} onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active ? 'bg-solar/10 text-solar' : 'text-gray-700 hover:bg-gray-50'
                  }`}>
                  <Icon size={16} />{label}
                </Link>
              );
            })}
            {firebaseUser ? (
              <button onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-gray-50 text-gray-700 justify-center">
                <LogOut size={16} /> Déconnexion
              </button>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-solar text-white justify-center">
                <LogIn size={16} /> Se connecter
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
