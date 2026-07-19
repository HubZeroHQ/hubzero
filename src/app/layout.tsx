import type { Metadata } from 'next';
import { IBM_Plex_Mono, Instrument_Sans, Instrument_Serif } from 'next/font/google';
import './globals.css';
import { PUBLIC_SITE } from '@/config/public-site';
import { publicEnv } from '@/lib/env';

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument-sans',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv().NEXT_PUBLIC_SITE_URL),
  title: {
    default: PUBLIC_SITE.name,
    template: `%s — ${PUBLIC_SITE.name}`,
  },
  description: PUBLIC_SITE.description,
  alternates: PUBLIC_SITE.release.feed
    ? { types: { 'application/rss+xml': '/feed.xml' } }
    : undefined,
  robots: PUBLIC_SITE.release.live
    ? { index: true, follow: true }
    : { index: false, follow: false },
  openGraph: {
    type: 'website',
    siteName: PUBLIC_SITE.name,
    title: PUBLIC_SITE.name,
    description: PUBLIC_SITE.description,
    images: [
      {
        url: PUBLIC_SITE.socialImage,
        width: PUBLIC_SITE.socialImageWidth,
        height: PUBLIC_SITE.socialImageHeight,
        alt: PUBLIC_SITE.name,
      },
    ],
  },
  appleWebApp: {
    title: PUBLIC_SITE.name,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
