'use client';
import { useAuth } from '@/context/AuthContext';
import { AdminPermission, UserRole } from '@/types';
import { hasPermission, permissionForPath } from '@/lib/permissions';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface Props { children: ReactNode; adminOnly?: boolean; partnerOnly?: boolean; allowedRoles?: UserRole[]; requiredPermission?: AdminPermission; }

export default function AuthGuard({ children, adminOnly = false, partnerOnly = false, allowedRoles, requiredPermission }: Props) {
  const { firebaseUser, appUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const permission = requiredPermission ?? (adminOnly ? permissionForPath(pathname) : undefined);
  const roleAllowed = Boolean(appUser?.role && (
    allowedRoles?.includes(appUser.role) ||
    (adminOnly && (appUser.role === 'admin' || appUser.role === 'super_admin')) ||
    (partnerOnly && (appUser.role === 'partner' || appUser.role === 'admin' || appUser.role === 'super_admin')) ||
    (!allowedRoles && !adminOnly && !partnerOnly)
  ));
  const hasRole = roleAllowed && (!adminOnly || hasPermission(appUser, permission));

  useEffect(() => { if (loading) return; if (!firebaseUser) { router.replace('/login'); return; } if (!hasRole) router.replace('/'); }, [loading, firebaseUser, hasRole, router]);
  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-4 border-solar border-t-transparent rounded-full animate-spin" /></div>;
  if (!firebaseUser || !hasRole) return null;
  return <>{children}</>;
}
