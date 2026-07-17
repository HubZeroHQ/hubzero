import type { ReactNode } from 'react';
import { PUBLIC_SITE } from '@/config/public-site';
import { PublicShell } from '@/components/public/PublicShell';
import { organizationJsonLd, websiteJsonLd } from '@/lib/public/discovery/structured-data';

export default function PublicLayout({ children }: { children: ReactNode }) {
  const structuredData = PUBLIC_SITE.release.live ? [organizationJsonLd(), websiteJsonLd()] : [];
  return (
    <PublicShell>
      {structuredData.map((value, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(value).replaceAll('<', '\\u003c') }}
        />
      ))}
      {children}
    </PublicShell>
  );
}
