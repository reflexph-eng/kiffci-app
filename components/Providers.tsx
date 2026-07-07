'use client';
import { AuthProvider } from '@/context/AuthContext';
import { CmsProvider } from '@/context/CmsContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CmsProvider>{children}</CmsProvider>
    </AuthProvider>
  );
}
