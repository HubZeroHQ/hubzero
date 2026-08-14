import type { Metadata } from 'next';
import { Ledger } from '@/components/public/ledger/Ledger';
import { PublicJsonLd } from '@/components/public/PublicJsonLd';
import { PUBLIC_SITE } from '@/config/public-site';
import type { ImmutablePublic } from '@/lib/public/domain';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';
import { breadcrumbJsonLd, collectionPageJsonLd } from '@/lib/public/discovery/structured-data';
import type { LedgerEntry } from '@/lib/public/ledger-projection';
import { getPublicLedger } from '@/lib/public/queries';

const description =
  'A reverse-chronological record of published HubZero activity: Notes and Lab updates, newest first.';

export const revalidate = 86_400;

export const metadata: Metadata = createPublicMetadata({
  title: 'Ledger',
  description,
  path: '/ledger',
  noIndex: !PUBLIC_SITE.release.live,
});

export default async function LedgerPage() {
  const entries = await safeLedgerEntries();
  return (
    <>
      <PublicJsonLd
        enabled={PUBLIC_SITE.release.live}
        values={[
          breadcrumbJsonLd([
            { name: 'HubZero', path: '/' },
            { name: 'Ledger', path: '/ledger' },
          ]),
          collectionPageJsonLd({
            name: 'HubZero Ledger',
            description,
            path: '/ledger',
            entries: entries.map((entry) => entry.entity),
          }),
        ]}
      />
      <Ledger entries={entries} />
    </>
  );
}

async function safeLedgerEntries(): Promise<readonly ImmutablePublic<LedgerEntry>[]> {
  try {
    return await getPublicLedger();
  } catch (error) {
    console.error('Ledger public read failed.', error);
    return [];
  }
}
