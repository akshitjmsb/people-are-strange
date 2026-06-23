import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Vibrant Montreal palette ──────────────────────────────
        'plateau-pink': '#E84393',
        'montroyal-amber': '#F39C12',
        'jazz-blue': '#0984E3',
        'mileend-violet': '#6C5CE7',
        'parc-emerald': '#00B894',
        'stlaurent-red': '#FF6B6B',
        'metro-orange': '#E17055',
        'snow-white': '#F8F9FA',
        'asphalt': '#2D3436',
        'bagel-gold': '#FDCB6E',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'sheet-up': 'sheetUp 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-in': 'fadeIn 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        sheetUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0.4' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
