import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { getCity } from '@/lib/cities';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const city = getCity();

export const metadata: Metadata = {
  title: city.metaTitle,
  description: city.metaDescription,
  manifest: '/manifest.json',
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
  themeColor: city.themeColor,
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
        <div id="app-root">{children}</div>
      </body>
    </html>
  );
}
