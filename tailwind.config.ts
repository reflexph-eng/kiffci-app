import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        solar: '#F97316',       // Orange chaud
        tropical: '#10B981',    // Vert tropical
        anthracite: '#1F2937',  // Sombre
        sand: '#FEF3C7',        // Sable clair
        lagoon: '#0EA5E9',      // Bleu lagon
        ivory: '#FFFBEB',       // Ivoire doux
      },
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px rgba(0,0,0,0.08)',
        card: '0 2px 12px rgba(0,0,0,0.06)',
        glow: '0 0 30px rgba(249,115,22,0.25)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
