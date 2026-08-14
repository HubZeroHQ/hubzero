import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { PUBLIC_SITE, PUBLIC_TITLE_TEMPLATE } from '@/config/public-site';
import { PreviewBanner } from '@/components/public/PreviewBanner';
import { PublicShell } from '@/components/public/PublicShell';
import { RootDocument } from '@/app/root-document';
import { publicEnv } from '@/lib/env';
import { organizationJsonLd, websiteJsonLd } from '@/lib/public/discovery/structured-data';
import { isPreviewRequest } from '@/lib/public/preview';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv().NEXT_PUBLIC_SITE_URL),
  title: {
    default: PUBLIC_SITE.name,
    template: PUBLIC_TITLE_TEMPLATE,
  },
  description: PUBLIC_SITE.description,
  alternates: PUBLIC_SITE.release.feed
    ? { types: { 'application/rss+xml': '/feed.xml' } }
    : undefined,
  // Index/follow is the browser default. Omitting it on a live release lets
  // Next's automatic 404 noindex be the only robots directive on missing pages.
  robots: PUBLIC_SITE.release.live ? undefined : { index: false, follow: false },
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

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const structuredData = PUBLIC_SITE.release.live ? [organizationJsonLd(), websiteJsonLd()] : [];
  const preview = await isPreviewRequest();
  return (
    <RootDocument>
      <div className={preview ? 'public-preview-active' : undefined}>
        {preview ? <PreviewBanner /> : null}
        <PublicShell>
          {structuredData.map((value, index) => (
            <script
              key={index}
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(value).replaceAll('<', '\\u003c') }}
            />
          ))}
          {children}
          <SpeedInsights />
        </PublicShell>
      </div>
    </RootDocument>
  );
}
