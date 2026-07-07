'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  User, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword,
  signInWithPopup, signOut, updateProfile
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase';
import { AppUser } from '@/types';
import { createUserIfMissing, getAppUser } from '@/lib/firestore';

type AuthContextValue = {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  isAdmin: boolean;
  isPartner: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadAppUser(u: User | null) {
    if (!u || !isFirebaseConfigured) {
      setAppUser(null);
      return;
    }
    await createUserIfMissing(u);
    setAppUser(await getAppUser(u.uid));
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      await loadAppUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    appUser,
    loading,
    isAdmin: appUser?.role === 'admin',
    isPartner: appUser?.role === 'partner' || appUser?.role === 'admin',
    async login(email, password) {
      const res = await signInWithEmailAndPassword(auth, email, password);
      await loadAppUser(res.user);
    },
    async register(name, email, password) {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, { displayName: name });
      await createUserIfMissing({ ...res.user, displayName: name });
      await loadAppUser(res.user);
    },
    async loginWithGoogle() {
      const res = await signInWithPopup(auth, googleProvider);
      await loadAppUser(res.user);
    },
    async logout() { await signOut(auth); },
    async refreshUser() { await loadAppUser(user); },
  }), [user, appUser, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
}
