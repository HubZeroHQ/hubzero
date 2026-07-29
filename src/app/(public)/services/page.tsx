import type { Metadata } from 'next';
import { PublicJsonLd } from '@/components/public/PublicJsonLd';
import { Services } from '@/components/public/services/Services';
import { PUBLIC_SITE } from '@/config/public-site';
import type { ImmutablePublic, PublicServiceSummary } from '@/lib/public/domain';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';
import { breadcrumbJsonLd, servicesPageJsonLd } from '@/lib/public/discovery/structured-data';
import { listPublicSummaries } from '@/lib/public/queries';

const description =
  'How HubZero approaches products, software systems, developer tools, AI systems, websites, and digital infrastructure—grounded in public engineering evidence.';

export const revalidate = 86_400;

export const metadata: Metadata = createPublicMetadata({
  title: 'Services',
  description,
  path: '/services',
  noIndex: !PUBLIC_SITE.release.live,
});

export default async function ServicesPage() {
  const services = await safeServices();
  const eligible = services.filter((service) => service.evidence.length > 0);
  const unsupported = services.filter((service) => service.evidence.length === 0);
  if (unsupported.length) {
    console.error(
      'Published Services require editorial evidence before public rendering:',
      unsupported.map((service) => service.title),
    );
  }

  return (
    <>
      <PublicJsonLd
        enabled={PUBLIC_SITE.release.live}
        values={[
          breadcrumbJsonLd([
            { name: 'HubZero', path: '/' },
            { name: 'Services', path: '/services' },
          ]),
          servicesPageJsonLd(eligible, description),
        ]}
      />
      <Services services={eligible} />
    </>
  );
}

async function safeServices(): Promise<readonly ImmutablePublic<PublicServiceSummary>[]> {
  try {
    const entries = await listPublicSummaries('service');
    return entries.filter(
      (entry): entry is ImmutablePublic<PublicServiceSummary> => entry.type === 'service',
    );
  } catch (error) {
    console.error('Services public read failed.', error);
    return [];
  }
}
