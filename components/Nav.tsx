"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Compass,
  Map,
  Trophy,
  BookOpen,
  User,
  Shield,
  Menu,
  X,
  Heart,
  LogOut,
  LogIn,
  Store,
  Calendar,
  Building2,
  Gift,
  LucideIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getNavItems, DEFAULT_NAV_ITEMS } from "@/lib/nav-firestore";
import { NavItem } from "@/types";
import NotificationBell from "./NotificationBell";

const ICONS_BY_HREF: Record<string, LucideIcon> = {
  "/experiences": Compass,
  "/establishments": Building2,
  "/events": Calendar,
  "/map": Map,
  "/challenges": Trophy,
  "/recompenses": Gift,
  "/passport": BookOpen,
  "/favorites": Heart,
  "/profile": User,
  "/partner/dashboard": Store,
  "/admin": Shield,
  "/admin/moderation": Shield,
};

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { appUser, firebaseUser, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const [navItems, setNavItems] = useState<NavItem[]>(DEFAULT_NAV_ITEMS);

  useEffect(() => {
    getNavItems()
      .then(setNavItems)
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node))
        setMoreOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  async function handleSignOut() {
    await signOut();
    router.push("/");
    setMobileOpen(false);
    setMoreOpen(false);
  }

  // L'accès réel reste toujours vérifié ici, quoi que l'admin ait configuré
  // en visibilité/placement — la configuration ne fait jamais exception à
  // ces règles, elle ne fait que choisir où un élément accessible apparaît.
  function hasAccess(scope: NavItem["scope"]): boolean {
    if (scope === "public") return true;
    if (scope === "auth") return !!firebaseUser;
    if (scope === "partner")
      return (
        appUser?.role === "partner" ||
        appUser?.role === "admin" ||
        appUser?.role === "super_admin"
      );
    if (scope === "admin")
      return appUser?.role === "admin" || appUser?.role === "super_admin";
    if (scope === "moderator") return appUser?.role === "moderator";
    return false;
  }

  const accessible = navItems
    .filter((i) => i.isVisible && hasAccess(i.scope))
    .sort((a, b) => a.order - b.order)
    .map((i) => ({
      href: i.href,
      label: i.label,
      icon: ICONS_BY_HREF[i.href] ?? Compass,
      placement: i.placement,
    }));

  const primaryHrefs = ["/experiences", "/establishments", "/challenges"];
  const desktopPrimary = primaryHrefs
    .map((href) => accessible.find((item) => item.href === href))
    .filter((item): item is (typeof accessible)[number] => Boolean(item));
  const desktopSecondary = accessible.filter(
    (item) => !primaryHrefs.includes(item.href),
  );
  const mobileItems = accessible;

  const navLinkClass = (href: string, menu = false) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return menu
      ? `flex min-h-11 items-center gap-2.5 px-3 py-2.5 text-sm font-medium transition ${active ? "bg-solar/10 text-solar" : "text-gray-700 hover:bg-gray-50 hover:text-anthracite"}`
      : `flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${active ? "text-solar" : "text-gray-600 hover:text-anthracite"}`;
  };

  return (
    <nav
      aria-label="Navigation principale"
      className="sticky top-0 z-50 border-b border-black/5 bg-white/92 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80"
    >
      <div className="site-container flex items-center justify-between py-2.5 sm:py-3">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          aria-label="Retour à l'accueil KIFFCI"
          className="flex shrink-0 items-center transition-opacity hover:opacity-85"
        >
          <img
            src="/logo.png"
            alt="KIFFCI"
            width={280}
            height={80}
            className="h-10 w-auto max-w-[170px] object-contain sm:h-12 sm:max-w-[210px] lg:h-14 lg:max-w-[240px]"
          />
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {desktopPrimary.map(({ href, label }) => (
            <Link key={href} href={href} className={navLinkClass(href)}>
              {label}
            </Link>
          ))}

          <NotificationBell />

          <div className="relative" ref={moreRef}>
            <button
              type="button"
              aria-label="Ouvrir le menu"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((value) => !value)}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-anthracite transition hover:bg-gray-50"
            >
              <Menu size={20} />
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] w-64 overflow-hidden border border-black/5 bg-white py-2 shadow-xl">
                {desktopSecondary.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    className={navLinkClass(href, true)}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {firebaseUser ? (
            <button
              onClick={handleSignOut}
              className="ml-1 flex items-center gap-1.5 px-2.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-anthracite"
            >
              <LogOut size={15} /> Déconnexion
            </button>
          ) : (
            <Link
              href="/login"
              className="ml-2 flex items-center gap-1.5 rounded-lg bg-solar px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
            >
              <LogIn size={15} /> Connexion
            </Link>
          )}
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={mobileOpen}
          className="min-h-11 min-w-11 rounded-lg p-2 transition hover:bg-gray-100 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white md:hidden">
          <div className="site-container grid grid-cols-1 gap-1 py-3">
            {mobileItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={navLinkClass(href, true)}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            {firebaseUser ? (
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-2 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700"
              >
                <LogOut size={16} /> Déconnexion
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 bg-solar px-4 py-3 text-sm font-medium text-white"
              >
                <LogIn size={16} /> Se connecter
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
