'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface Props {
  children:     ReactNode;
  adminOnly?:   boolean;
  partnerOnly?: boolean;
}

export default function AuthGuard({ children, adminOnly = false, partnerOnly = false }: Props) {
  const { firebaseUser, appUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser)                    { router.replace('/login');  return; }
    if (adminOnly   && appUser?.role !== 'admin')   { router.replace('/'); return; }
    if (partnerOnly && appUser?.role !== 'partner' && appUser?.role !== 'admin') {
      router.replace('/');
    }
  }, [loading, firebaseUser, appUser, adminOnly, partnerOnly, router]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-solar border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!firebaseUser) return null;
  if (adminOnly   && appUser?.role !== 'admin') return null;
  if (partnerOnly && appUser?.role !== 'partner' && appUser?.role !== 'admin') return null;

  return <>{children}</>;
}
