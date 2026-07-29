import type { ReactNode } from 'react';
import { PUBLIC_SITE } from '@/config/public-site';
import { PreviewBanner } from '@/components/public/PreviewBanner';
import { PublicShell } from '@/components/public/PublicShell';
import { organizationJsonLd, websiteJsonLd } from '@/lib/public/discovery/structured-data';
import { isPreviewRequest } from '@/lib/public/preview';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const structuredData = PUBLIC_SITE.release.live ? [organizationJsonLd(), websiteJsonLd()] : [];
  const preview = await isPreviewRequest();
  return (
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
      </PublicShell>
    </div>
  );
}
