import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import ServiceWorkerUpdateManager from '@/components/ServiceWorkerUpdateManager';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

// Title, description, manifest and theme colour are per city and are set by
// app/[city]/page.tsx. Only the city-agnostic shell lives here.
export const metadata: Metadata = {
  title: 'People Are Strange',
  description: 'City industry maps — every company, lab and studio, mapped.',
  applicationName: 'People Are Strange',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'People Are Strange',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased">
        <ServiceWorkerUpdateManager />
        <div id="app-root">{children}</div>
      </body>
    </html>
  );
}
