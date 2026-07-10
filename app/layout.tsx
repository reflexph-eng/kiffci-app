import './globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';

// Polices auto-hébergées : chargement instantané, aucune dépendance à Google Fonts.
const syne = localFont({
  src: [
    { path: './fonts/syne-latin-400-normal.woff2', weight: '400' },
    { path: './fonts/syne-latin-600-normal.woff2', weight: '600' },
    { path: './fonts/syne-latin-700-normal.woff2', weight: '700' },
    { path: './fonts/syne-latin-800-normal.woff2', weight: '800' },
  ],
  variable: '--font-display', display: 'swap',
});
const dmSans = localFont({
  src: [
    { path: './fonts/dm-sans-latin-300-normal.woff2', weight: '300' },
    { path: './fonts/dm-sans-latin-400-normal.woff2', weight: '400' },
    { path: './fonts/dm-sans-latin-500-normal.woff2', weight: '500' },
  ],
  variable: '--font-body', display: 'swap',
});
import Nav from '@/components/Nav';
import { AuthProvider } from '@/context/AuthContext';
import { CmsProvider } from '@/context/CmsContext';
import Footer from '@/components/Footer';
import BetaRibbon from '@/components/BetaRibbon';

export const metadata: Metadata = {
  metadataBase: new URL('https://kiffci-prod.vercel.app'),
  title: { default: 'Kiffci – Vis. Explore. Kiffe.', template: '%s | Kiffci' },
  description: "Les meilleures expériences à vivre en Côte d'Ivoire.",
  keywords: ["Côte d'Ivoire", 'Abidjan', 'expériences', 'sorties', 'loisirs', 'kiffci'],
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png',      sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Kiffci',
    title: 'Kiffci – Vis. Explore. Kiffe.',
    description: "Les meilleures expériences à vivre en Côte d'Ivoire.",
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Kiffci' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kiffci – Vis. Explore. Kiffe.',
    description: "Les meilleures expériences à vivre en Côte d'Ivoire.",
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${syne.variable} ${dmSans.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">Aller au contenu</a>
        <AuthProvider>
          <CmsProvider>
            <BetaRibbon />
            <Nav />
            <div id="main-content" tabIndex={-1}>{children}</div>
            <Footer />
          </CmsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
