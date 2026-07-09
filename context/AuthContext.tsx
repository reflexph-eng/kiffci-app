'use client';
import {
  createContext, useContext, useEffect, useState, ReactNode,
} from 'react';
import {
  onAuthStateChanged, signOut as fbSignOut,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, sendPasswordResetEmail, updateProfile, User,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { createUserDoc, getUserDoc } from '@/lib/firestore';
import { AppUser } from '@/types';

interface AuthContextType {
  firebaseUser: User | null;
  appUser:      AppUser | null;
  loading:      boolean;
  signIn:       (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signUp:       (email: string, password: string, name: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOut:      () => Promise<void>;
  refreshUser:  () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser,      setAppUser]      = useState<AppUser | null>(null);
  const [loading,      setLoading]      = useState(true);

  async function loadAppUser(fbUser: User) {
    try {
      const u = await getUserDoc(fbUser.uid);
      setAppUser(u);
    } catch (error) {
      console.error('[AuthContext] Impossible de charger le profil applicatif.', error);
      setAppUser(null);
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      setFirebaseUser(fbUser);
      try {
        if (fbUser) {
          await loadAppUser(fbUser);
        } else {
          setAppUser(null);
        }
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  async function signUp(email: string, password: string, name: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    await createUserDoc(cred.user.uid, email, name);
  }

  async function signInGoogle() {
    const cred = await signInWithPopup(auth, googleProvider);
    await createUserDoc(
      cred.user.uid,
      cred.user.email ?? '',
      cred.user.displayName ?? ''
    );
  }

  async function signOut() {
    await fbSignOut(auth);
  }

  async function refreshUser() {
    if (firebaseUser) await loadAppUser(firebaseUser);
  }

  return (
    <AuthContext.Provider
      value={{
        firebaseUser, appUser, loading,
        signIn, resetPassword, signUp, signInGoogle, signOut, refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
