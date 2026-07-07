'use client';
import { useState, useEffect } from 'react';
import { addFavorite, removeFavorite, getFavorites } from '@/lib/firestore';
import { useAuth } from '@/context/AuthContext';

export function useFavorite(experienceId: string) {
  const { appUser } = useAuth();
  const [isFav, setIsFav] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!appUser) { setIsFav(false); return; }
    getFavorites(appUser.uid).then((ids) => setIsFav(ids.includes(experienceId)));
  }, [appUser, experienceId]);

  async function toggle() {
    if (!appUser || toggling) return;
    setToggling(true);
    try {
      if (isFav) {
        await removeFavorite(appUser.uid, experienceId);
        setIsFav(false);
      } else {
        await addFavorite(appUser.uid, experienceId);
        setIsFav(true);
      }
    } finally {
      setToggling(false);
    }
  }

  return { isFav, toggle, toggling, loggedIn: !!appUser };
}
