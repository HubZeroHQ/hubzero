import { getFounderIdentity } from '@/config/founder-identity';
import type { ImmutablePublic } from '@/lib/public/domain';
import { publicRoute } from '@/lib/public/routes';
import { DetailGallery } from '../DetailGallery';
import { DetailSectionHeading, PublicBreadcrumbs, TechnologyList } from '../EditorialPrimitives';
import { EvidenceGraphFocusSync } from '../evidence-graph';
import { PageContainer, PublicSection } from '../PageContainer';
import { PublicImage } from '../PublicImage';
import { RelatedRecordsSection } from '../RelatedRecordsSection';
import { FOUNDER_COMPOSITIONS } from './compositions';
import {
  ProfileDocuments,
  ProfileEvidenceGraph,
  ProfileFooter,
  ProfileHeroMedia,
  resolveDocuments,
  resolveRelationshipGroups,
  type EngineeringProfile as Profile,
} from './profile-shared';

/**
 * Every profile passes through this component. A profile whose slug has an
 * entry in `FOUNDER_IDENTITIES` (Phase 23's founders, today) delegates to
 * its bespoke composition; every other profile — including any future
 * Engineering Profile leadership hasn't yet designed an identity for —
 * renders through this generic template. This is deliberate: a new profile
 * is complete and launch-ready the moment it's published, with or without
 * a designed identity.
 */
export function EngineeringProfileDetail({ profile }: { profile: ImmutablePublic<Profile> }) {
  const identity = getFounderIdentity(profile.slug);
  if (identity) {
    const Composition = FOUNDER_COMPOSITIONS[identity.motif];
    return <Composition profile={profile} identity={identity} />;
  }

  const documents = resolveDocuments(profile);
  const groups = resolveRelationshipGroups(profile);

  return (
    <article id="main-content" role="main" tabIndex={-1} className="collection-main profile-detail">
      <header className="profile-hero">
        <PageContainer>
          <PublicBreadcrumbs
            items={[
              { label: 'HubZero', href: publicRoute.home() },
              {
                label: 'Engineering profiles',
                href: publicRoute.collection('engineeringProfile'),
              },
              { label: profile.title },
            ]}
          />
          <div className="profile-hero-grid">
            <div className="profile-identity">
              <p className="home-eyebrow">Engineering Profile / {profile.referenceId}</p>
              <h1>{profile.title}</h1>
              <p className="profile-role">{profile.role}</p>
              <p className="detail-summary">{profile.summary}</p>
            </div>
            {profile.portrait ? (
              <PublicImage media={profile.portrait} priority />
            ) : (
              <aside className="profile-register" aria-label={`${profile.title} profile metadata`}>
                <dl>
                  <div>
                    <dt>Reference</dt>
                    <dd>{profile.referenceId}</dd>
                  </div>
                  <div>
                    <dt>Role</dt>
                    <dd>{profile.role}</dd>
                  </div>
                  <div>
                    <dt>Evidence</dt>
                    <dd>{profile.relationships.length} selected links</dd>
                  </div>
                </dl>
              </aside>
            )}
          </div>
        </PageContainer>
      </header>

      <ProfileHeroMedia profile={profile} />

      <PublicSection
        className="profile-position profile-chapter"
        aria-labelledby="profile-position-title"
      >
        <PageContainer className="profile-position-grid">
          <DetailSectionHeading
            id="profile-position-title"
            eyebrow="Engineering position / current practice"
            title="How the work is approached."
          />
          <div className="profile-position-copy">
            <p>{profile.engineeringPhilosophy}</p>
            {profile.engineeringIdentity.length ? (
              <ul aria-label="Engineering identity statements">
                {profile.engineeringIdentity.map((statement) => (
                  <li key={statement}>{statement}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </PageContainer>
      </PublicSection>

      <PublicSection
        className="profile-current profile-chapter"
        aria-labelledby="profile-current-title"
      >
        <PageContainer className="profile-current-grid">
          <DetailSectionHeading
            id="profile-current-title"
            eyebrow="Current exploration"
            title={profile.currentExploration}
          />
          <div className="profile-current-register">
            {profile.areasOfExpertise.length ? (
              <section aria-labelledby="profile-expertise-title">
                <h3 id="profile-expertise-title">Areas of expertise</h3>
                <ul className="engineering-expertise">
                  {profile.areasOfExpertise.map((area) => (
                    <li key={area}>{area}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            {profile.currentInterests.length ? (
              <section aria-labelledby="profile-interests-title">
                <h3 id="profile-interests-title">Current interests</h3>
                <ul>
                  {profile.currentInterests.map((interest) => (
                    <li key={interest}>{interest}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            {profile.technologies.length ? (
              <section aria-labelledby="profile-technology-title">
                <h3 id="profile-technology-title">Technology path</h3>
                <TechnologyList technologies={profile.technologies} />
              </section>
            ) : null}
          </div>
        </PageContainer>
      </PublicSection>

      {groups.length ? (
        <EvidenceGraphFocusSync>
          <RelatedRecordsSection
            id="profile-evidence-title"
            eyebrow="Evidence / demonstrated contribution"
            title="Follow the contribution into the work."
            description="Every connection below is explicit in the public record. Internal creator metadata is never treated as contribution credit."
            headerContent={<ProfileEvidenceGraph profile={profile} />}
            groups={groups}
            sectionClassName="profile-evidence profile-chapter"
            containerClassName="profile-evidence-grid"
          />
        </EvidenceGraphFocusSync>
      ) : null}

      <ProfileDocuments documents={documents} />

      <DetailGallery
        id="profile-gallery-title"
        eyebrow="Media / supporting evidence"
        title="Artifacts from the work"
        media={profile.gallery}
        sectionClassName="profile-gallery profile-chapter"
      />

      <ProfileFooter profile={profile} />
    </article>
  );
}
