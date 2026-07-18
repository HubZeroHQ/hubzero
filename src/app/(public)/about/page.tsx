import type { Metadata } from 'next';
import { About } from '@/components/public/about/About';
import { PublicJsonLd } from '@/components/public/PublicJsonLd';
import { PUBLIC_SITE } from '@/config/public-site';
import type {
  ImmutablePublic,
  PublicEngineeringProfileIndexEntry,
  PublicTeamMemberSummary,
} from '@/lib/public/domain';
import { createPublicMetadata } from '@/lib/public/discovery/metadata';
import { aboutPageJsonLd, breadcrumbJsonLd } from '@/lib/public/discovery/structured-data';
import {
  listPublicEngineeringProfileIndexEntries,
  listPublicSummaries,
} from '@/lib/public/queries';

const description =
  'How HubZero approaches engineering: its operating model, evidence standards, technical culture, and the people accountable for the work.';

export const revalidate = 86_400;

export const metadata: Metadata = createPublicMetadata({
  title: 'About',
  description,
  path: '/about',
  noIndex: !PUBLIC_SITE.release.live,
});

export default async function AboutPage() {
  const [team, profiles] = await Promise.all([safeTeam(), safeProfiles()]);
  return (
    <>
      <PublicJsonLd
        enabled={PUBLIC_SITE.release.live}
        values={[
          breadcrumbJsonLd([
            { name: 'HubZero', path: '/' },
            { name: 'About', path: '/about' },
          ]),
          aboutPageJsonLd(team),
        ]}
      />
      <About team={team} profiles={profiles} />
    </>
  );
}

async function safeTeam(): Promise<readonly ImmutablePublic<PublicTeamMemberSummary>[]> {
  try {
    const entries = await listPublicSummaries('teamMember');
    return entries.filter(
      (entry): entry is ImmutablePublic<PublicTeamMemberSummary> => entry.type === 'teamMember',
    );
  } catch (error) {
    console.error('About public Team read failed.', error);
    return [];
  }
}

async function safeProfiles(): Promise<
  readonly ImmutablePublic<PublicEngineeringProfileIndexEntry>[]
> {
  try {
    return await listPublicEngineeringProfileIndexEntries();
  } catch (error) {
    console.error('About public Engineering Profile read failed.', error);
    return [];
  }
}
