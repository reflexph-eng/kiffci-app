'use client';
/**
 * context/CmsContext.tsx
 * Fournit les settings CMS à toute l'application.
 * Chargé une seule fois au démarrage, mis en cache côté client.
 */
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  getHomepageSettings, getActiveBanners, getVisibleCategories, getActiveCampaigns,
  DEFAULT_HOMEPAGE,
} from '@/lib/cms-firestore';
import { HomepageSettings, Banner, Category, Campaign } from '@/types';

interface CmsContextType {
  settings:   HomepageSettings;
  banners:    Banner[];
  categories: Category[];
  campaigns:  Campaign[];
  loading:    boolean;
  refresh:    () => Promise<void>;
}

const CmsContext = createContext<CmsContextType | null>(null);

export function CmsProvider({ children }: { children: ReactNode }) {
  const [settings,   setSettings]   = useState<HomepageSettings>(DEFAULT_HOMEPAGE);
  const [banners,    setBanners]    = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [campaigns,  setCampaigns]  = useState<Campaign[]>([]);
  const [loading,    setLoading]    = useState(true);

  async function load() {
    try {
      const [s, b, c, ca] = await Promise.all([
        getHomepageSettings(),
        getActiveBanners(),
        getVisibleCategories(),
        getActiveCampaigns(),
      ]);
      setSettings(s);
      setBanners(b);
      setCategories(c);
      setCampaigns(ca);
    } catch {
      // Si Firebase n'est pas encore configuré, on utilise les valeurs par défaut
      console.warn('CMS: Firebase non configuré, utilisation des valeurs par défaut.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <CmsContext.Provider value={{ settings, banners, categories, campaigns, loading, refresh: load }}>
      {children}
    </CmsContext.Provider>
  );
}

export function useCms() {
  const ctx = useContext(CmsContext);
  if (!ctx) throw new Error('useCms must be used inside CmsProvider');
  return ctx;
}
