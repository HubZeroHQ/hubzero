import {
  founderAccentStyle,
  founderMotifViewTransitionStyle,
  type FounderIdentity,
} from '@/config/founder-identity';
import type { ImmutablePublic } from '@/lib/public/domain';
import { DetailGallery } from '../../DetailGallery';
import { PublicBreadcrumbs, TechnologyList } from '../../EditorialPrimitives';
import { EvidenceGraphFocusSync } from '../../evidence-graph';
import { PageContainer, PublicSection } from '../../PageContainer';
import { PublicImage } from '../../PublicImage';
import { RelatedRecordsSection } from '../../RelatedRecordsSection';
import { FounderMotif } from '../motifs';
import {
  ProfileDocuments,
  ProfileEvidenceGraph,
  ProfileFooter,
  ProfileHeroMedia,
  resolveDocuments,
  resolveRelationshipGroups,
  type EngineeringProfile,
} from '../profile-shared';

/**
 * Rifaque — Vision / Systems / Products. The network motif IS the hero, not
 * an illustration beside it: identity and the diagram of his own technology
 * network sit in the same frame, because his engineering identity is about
 * designing interconnected systems rather than isolated software.
 */
export function RifaqueComposition({
  profile,
  identity,
}: {
  profile: ImmutablePublic<EngineeringProfile>;
  identity: FounderIdentity;
}) {
  const documents = resolveDocuments(profile);
  const groups = resolveRelationshipGroups(profile);

  return (
    <article
      id="main-content"
      role="main"
      tabIndex={-1}
      className="collection-main profile-detail founder-profile founder-profile-network"
      style={founderAccentStyle(identity.accent)}
    >
      <header className="profile-hero founder-hero-network">
        <PageContainer>
          <PublicBreadcrumbs
            items={[
              { label: 'HubZero', href: '/' },
              { label: 'Engineering profiles', href: '/engineering' },
              { label: profile.title },
            ]}
          />
          <div className="founder-hero-network-grid">
            <div className="profile-identity">
              <p className="home-eyebrow founder-eyebrow">
                Engineering Profile / {profile.referenceId}
              </p>
              <h1>{profile.title}</h1>
              <p className="profile-role">{profile.role}</p>
              <p className="detail-summary">{profile.summary}</p>
              {profile.portrait ? (
                <div className="founder-portrait-small">
                  <PublicImage media={profile.portrait} priority />
                </div>
              ) : null}
            </div>
            <div
              className="founder-motif-frame founder-motif-frame-network"
              style={founderMotifViewTransitionStyle(identity.slug)}
            >
              <FounderMotif
                motif={identity.motif}
                technologies={profile.technologies}
                description={identity.motifDescription}
              />
            </div>
          </div>
        </PageContainer>
      </header>

      <PublicSection
        className="profile-position profile-chapter"
        aria-labelledby="profile-position-title"
      >
        <PageContainer className="profile-position-grid">
          <header>
            <p className="home-eyebrow">Engineering position / systems view</p>
            <h2 id="profile-position-title">How the systems connect.</h2>
          </header>
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
          <div>
            <p className="home-eyebrow">Current exploration</p>
            <h2 id="profile-current-title">{profile.currentExploration}</h2>
          </div>
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

      <ProfileHeroMedia profile={profile} />

      {groups.length ? (
        <EvidenceGraphFocusSync>
          <RelatedRecordsSection
            id="profile-evidence-title"
            eyebrow="Evidence / demonstrated contribution"
            title="Follow the network into the work."
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
