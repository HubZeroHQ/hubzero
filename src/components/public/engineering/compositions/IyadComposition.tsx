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
 * Iyad — Product Operations. The traveler motif opens the page as a single
 * continuous spine the whole profile follows — one flowing column (no
 * sidebar register, no grid split) reads as a lifecycle: position, current
 * work, evidence, then the long-form record, each stage following the last.
 */
export function IyadComposition({
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
      className="collection-main profile-detail founder-profile founder-profile-traveler"
      style={founderAccentStyle(identity.accent)}
    >
      <header className="profile-hero founder-hero-spine">
        <PageContainer>
          <PublicBreadcrumbs
            items={[
              { label: 'HubZero', href: '/' },
              { label: 'Engineering profiles', href: '/engineering' },
              { label: profile.title },
            ]}
          />
          <div className="profile-identity">
            <p className="home-eyebrow founder-eyebrow">
              Engineering Profile / {profile.referenceId}
            </p>
            <h1>{profile.title}</h1>
            <p className="profile-role">{profile.role}</p>
            <p className="detail-summary">{profile.summary}</p>
          </div>
          <div
            className="founder-motif-frame founder-motif-frame-traveler"
            style={founderMotifViewTransitionStyle(identity.slug)}
          >
            <FounderMotif
              motif={identity.motif}
              technologies={profile.technologies}
              description={identity.motifDescription}
            />
          </div>
          {profile.portrait ? (
            <div className="founder-portrait-small founder-portrait-inline">
              <PublicImage media={profile.portrait} priority />
            </div>
          ) : null}
        </PageContainer>
      </header>

      <PublicSection
        className="profile-position profile-chapter"
        aria-labelledby="profile-position-title"
      >
        <PageContainer className="founder-spine-column">
          <p className="home-eyebrow">Engineering position / how the product evolves</p>
          <h2 id="profile-position-title">The product keeps moving.</h2>
          <p>{profile.engineeringPhilosophy}</p>
          {profile.engineeringIdentity.length ? (
            <ul aria-label="Engineering identity statements">
              {profile.engineeringIdentity.map((statement) => (
                <li key={statement}>{statement}</li>
              ))}
            </ul>
          ) : null}
        </PageContainer>
      </PublicSection>

      <PublicSection
        className="profile-current profile-chapter"
        aria-labelledby="profile-current-title"
      >
        <PageContainer className="founder-spine-column">
          <p className="home-eyebrow">Current exploration</p>
          <h2 id="profile-current-title">{profile.currentExploration}</h2>
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
            title="Follow the product into the work."
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
