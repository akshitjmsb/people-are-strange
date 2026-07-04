import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'People Are Strange MTL — Montreal Industry Map',
  description:
    "Montreal's AI, aerospace, energy and marine scenes on one living map. Every lab, startup, plant and port — what they're building, where they are.",
  manifest: '/manifest.json',
  applicationName: 'People Are Strange MTL',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PAS MTL',
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
  themeColor: '#E84393',
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
