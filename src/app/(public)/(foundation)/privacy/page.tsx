import type { Metadata } from 'next';
import { Privacy } from '@/components/public/privacy/Privacy';
import { PublicJsonLd } from '@/components/public/PublicJsonLd';
import { PUBLIC_SITE } from '@/config/public-site';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';
import { breadcrumbJsonLd } from '@/lib/public/discovery/structured-data';

const description =
  'What HubZero collects through the Contact and Career Interest forms, why, and how it is handled.';

export const metadata: Metadata = createPublicMetadata({
  title: 'Privacy',
  description,
  path: '/privacy',
  noIndex: !PUBLIC_SITE.release.live,
});

export default function PrivacyPage() {
  return (
    <>
      <PublicJsonLd
        enabled={PUBLIC_SITE.release.live}
        values={[
          breadcrumbJsonLd([
            { name: 'HubZero', path: '/' },
            { name: 'Privacy', path: '/privacy' },
          ]),
        ]}
      />
      <Privacy />
    </>
  );
}
