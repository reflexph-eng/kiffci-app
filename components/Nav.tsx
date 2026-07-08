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
    ...(appUser?.role === 'partner' || appUser?.role === 'admin'
      ? [{ href: '/partner/dashboard' as const, label: 'Espace Partenaire', icon: Store }]
      : []),
    ...(appUser?.role === 'admin'
      ? [{ href: '/admin' as const, label: 'Admin', icon: Shield }]
      : []),
    ...(appUser?.role === 'moderator'
      ? [{ href: '/admin/moderation' as const, label: 'Modération', icon: Shield }]
      : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
          <img src="/logo.png" alt="Kiffci" width={38} height={38} style={{ objectFit: 'contain' }} />
          <div className="hidden sm:block">
            <p className="font-display font-bold text-xl leading-none text-anthracite">kiffci</p>
          </div>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  active ? 'bg-solar/10 text-solar' : 'text-gray-600 hover:bg-gray-100'
                }`}>
                <Icon size={15} />{label}
              </Link>
            );
          })}
          <NotificationBell />
          {firebaseUser ? (
            <button onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all ml-1">
              <LogOut size={15} /> Déconnexion
            </button>
          ) : (
            <Link href="/login"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-solar text-white hover:bg-orange-600 transition-all ml-2">
              <LogIn size={15} /> Connexion
            </Link>
          )}
        </div>

        <button className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 gap-2">
            {items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link key={href} href={href} onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                    active ? 'bg-solar text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}>
                  <Icon size={16} />{label}
                </Link>
              );
            })}
            {firebaseUser ? (
              <button onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium bg-gray-50 text-gray-700 col-span-2 justify-center">
                <LogOut size={16} /> Déconnexion
              </button>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium bg-solar text-white col-span-2 justify-center">
                <LogIn size={16} /> Se connecter
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
