'use client';
/**
 * Footer — éditable depuis l'admin (Sprint 1).
 * Réglages (description, contacts, réseaux) : appSettings/footer.
 * Liens légaux : pages publiées avec showInFooter=true.
 */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Instagram, Facebook, Youtube, Phone, Mail } from 'lucide-react';
import { getFooterSettings, getFooterPages, DEFAULT_FOOTER } from '@/lib/pages-firestore';
import { FooterSettings, SitePage } from '@/types';

/** Icône TikTok (absente de lucide) */
function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.9 2.9 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );
}

/** Icône WhatsApp (absente de lucide) */
function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.11 3.22 5.1 4.51.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35z"/>
      <path d="M12.05 2a9.94 9.94 0 0 0-8.6 14.92L2 22l5.23-1.37A9.94 9.94 0 1 0 12.05 2zm0 18.2a8.25 8.25 0 0 1-4.2-1.15l-.3-.18-3.1.81.83-3.02-.2-.31a8.26 8.26 0 1 1 6.97 3.85z"/>
    </svg>
  );
}

export default function Footer() {
  const [settings, setSettings] = useState<FooterSettings>(DEFAULT_FOOTER);
  const [legalPages, setLegalPages] = useState<SitePage[]>([]);

  useEffect(() => {
    getFooterSettings().then(setSettings).catch(() => {});
    getFooterPages().then(setLegalPages).catch(() => {});
  }, []);

  const socials = [
    { url: settings.instagram, label: 'Instagram', icon: <Instagram size={16} aria-hidden /> },
    { url: settings.tiktok,    label: 'TikTok',    icon: <TikTokIcon /> },
    { url: settings.facebook,  label: 'Facebook',  icon: <Facebook size={16} aria-hidden /> },
    { url: settings.youtube,   label: 'YouTube',   icon: <Youtube size={16} aria-hidden /> },
    { url: settings.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}` : '', label: 'WhatsApp', icon: <WhatsAppIcon /> },
  ].filter(s => s.url);

  return (
    <footer className="mt-24 bg-anthracite text-white py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-10 mb-10">

          {/* Marque */}
          <div>
            <div className="mb-4">
              <img src="/logo-light.png" alt="Kiffci — Vis. Explore. Kiffe." width={180} height={78} style={{ objectFit: 'contain' }} />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{settings.description}</p>
          </div>

          {/* Explorer */}
          <div>
            <h3 className="font-display font-bold mb-4 text-sm uppercase tracking-wider text-gray-400">Explorer</h3>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li><Link href="/experiences"    className="hover:text-solar transition">Expériences</Link></li>
              <li><Link href="/establishments" className="hover:text-solar transition">Créateurs</Link></li>
              <li><Link href="/events"         className="hover:text-solar transition">Événements</Link></li>
              <li><Link href="/map"            className="hover:text-solar transition">Carte interactive</Link></li>
              <li><Link href="/challenges"     className="hover:text-solar transition">Défis Kiffci</Link></li>
              <li><Link href="/recompenses"    className="hover:text-solar transition">Récompenses</Link></li>
            </ul>
          </div>

          {/* Informations (pages éditables) */}
          <div>
            <h3 className="font-display font-bold mb-4 text-sm uppercase tracking-wider text-gray-400">Informations</h3>
            <ul className="space-y-2.5 text-sm text-gray-300">
              {legalPages.map(p => (
                <li key={p.id}>
                  <Link href={`/p/${p.slug}`} className="hover:text-solar transition">{p.title}</Link>
                </li>
              ))}
              <li><Link href="/register" className="hover:text-solar transition">Devenir créateur</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-bold mb-4 text-sm uppercase tracking-wider text-gray-400">Contact</h3>
            <ul className="space-y-2.5 text-sm">
              {settings.email && (
                <li>
                  <a href={`mailto:${settings.email}`} className="flex items-center gap-2 text-solar hover:underline">
                    <Mail size={14} aria-hidden /> {settings.email}
                  </a>
                </li>
              )}
              {settings.phone && (
                <li>
                  <a href={`tel:${settings.phone}`} className="flex items-center gap-2 text-gray-300 hover:text-solar transition">
                    <Phone size={14} aria-hidden /> {settings.phone}
                  </a>
                </li>
              )}
            </ul>
            {socials.length > 0 && (
              <div className="mt-4 flex gap-3">
                {socials.map(s => (
                  <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                    aria-label={s.label} title={s.label}
                    className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center hover:bg-solar transition">
                    {s.icon}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Kiffci · Fait avec ❤️ pour la Côte d&apos;Ivoire</p>
          <p>
            <Link href="/login"    className="hover:text-solar transition mr-4">Connexion</Link>
            <Link href="/register" className="hover:text-solar transition">Créer un compte</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
