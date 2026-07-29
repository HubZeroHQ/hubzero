import type { Metadata } from 'next';
import { Contact } from '@/components/public/contact/Contact';
import { PublicJsonLd } from '@/components/public/PublicJsonLd';
import { PUBLIC_SITE } from '@/config/public-site';
import { normalizeContactSource } from '@/lib/public/contact';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';
import { breadcrumbJsonLd, contactPageJsonLd } from '@/lib/public/discovery/structured-data';

const description =
  'Share an engineering problem, its context, and the constraints that matter with HubZero.';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPublicMetadata({
  title: 'Contact',
  description,
  path: '/contact',
  noIndex: !PUBLIC_SITE.release.live,
});

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const parameters = await searchParams;
  const source = normalizeContactSource(
    Array.isArray(parameters.from) ? parameters.from[0] : parameters.from,
  );
  return (
    <>
      <PublicJsonLd
        enabled={PUBLIC_SITE.release.live}
        values={[
          breadcrumbJsonLd([
            { name: 'HubZero', path: '/' },
            { name: 'Contact', path: '/contact' },
          ]),
          contactPageJsonLd(description),
        ]}
      />
      <Contact source={source} startedAt={Date.now()} />
    </>
  );
}
