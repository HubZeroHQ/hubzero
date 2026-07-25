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
 * Raif — Software Architecture. The dependency graph is presented as the
 * literal architecture diagram of this profile's own evidence (what feeds
 * what), placed before the philosophy the way a technical document leads
 * with a system diagram. Identity statements render as a numbered decision
 * record, not a bullet list — deliberate, structured, engineered.
 */
export function RaifComposition({
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
      className="collection-main profile-detail founder-profile founder-profile-dependency-graph"
      style={founderAccentStyle(identity.accent)}
    >
      <header className="profile-hero">
        <PageContainer>
          <PublicBreadcrumbs
            items={[
              { label: 'HubZero', href: '/' },
              { label: 'Engineering profiles', href: '/engineering' },
              { label: profile.title },
            ]}
          />
          <div className="profile-hero-grid founder-hero-compact">
            <div className="profile-identity">
              <p className="home-eyebrow founder-eyebrow">
                Engineering Profile / {profile.referenceId}
              </p>
              <h1>{profile.title}</h1>
              <p className="profile-role">{profile.role}</p>
              <p className="detail-summary">{profile.summary}</p>
            </div>
            {profile.portrait ? (
              <div className="founder-portrait-small">
                <PublicImage media={profile.portrait} priority />
              </div>
            ) : null}
          </div>
        </PageContainer>
      </header>

      <PublicSection
        className="founder-architecture profile-chapter"
        aria-labelledby="founder-architecture-title"
      >
        <PageContainer>
          <header>
            <p className="home-eyebrow">Architecture / evidence graph</p>
            <h2 id="founder-architecture-title">What this profile is built from.</h2>
          </header>
          <div
            className="founder-motif-frame founder-motif-frame-dependency-graph"
            style={founderMotifViewTransitionStyle(identity.slug)}
          >
            <FounderMotif
              motif={identity.motif}
              technologies={profile.technologies}
              description={identity.motifDescription}
            />
          </div>
        </PageContainer>
      </PublicSection>

      <PublicSection
        className="profile-position founder-decision-record profile-chapter"
        aria-labelledby="profile-position-title"
      >
        <PageContainer className="profile-position-grid">
          <header>
            <p className="home-eyebrow">Engineering position / decision record</p>
            <h2 id="profile-position-title">The system is the argument.</h2>
          </header>
          <div className="profile-position-copy">
            <p>{profile.engineeringPhilosophy}</p>
            {profile.engineeringIdentity.length ? (
              <ol aria-label="Engineering identity statements" className="founder-decision-list">
                {profile.engineeringIdentity.map((statement, index) => (
                  <li key={statement}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {statement}
                  </li>
                ))}
              </ol>
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
            title="Follow the dependency into the work."
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
