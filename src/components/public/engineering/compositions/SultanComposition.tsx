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
 * Sultan — Communication / Documentation / Knowledge. The editorial grid
 * motif doubles as the page's own functional outline: a persistent numbered
 * rail listing every real section, not decoration beside the content. This
 * is the one composition that reads as a documentation system rather than
 * a diagram of nodes and edges.
 */
export function SultanComposition({
  profile,
  identity,
}: {
  profile: ImmutablePublic<EngineeringProfile>;
  identity: FounderIdentity;
}) {
  const documents = resolveDocuments(profile);
  const groups = resolveRelationshipGroups(profile);

  const outlineSections = [
    { id: 'profile-position-title', label: 'Position and practice' },
    { id: 'profile-current-title', label: 'Current exploration' },
    ...(groups.length ? [{ id: 'profile-evidence-title', label: 'Evidence' }] : []),
    ...documents.map(({ document, title }) => ({
      id: `profile-document-${document.role}`,
      label: title,
    })),
  ];

  return (
    <article
      id="main-content"
      role="main"
      tabIndex={-1}
      className="collection-main profile-detail founder-profile founder-profile-editorial-grid"
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

      <PublicSection className="founder-editorial-body" aria-label="Profile contents">
        <PageContainer className="founder-editorial-grid">
          <nav
            className="founder-editorial-outline"
            style={founderMotifViewTransitionStyle(identity.slug)}
            aria-label="Profile outline"
          >
            <FounderMotif
              motif={identity.motif}
              technologies={profile.technologies}
              description={identity.motifDescription}
            />
            <ol>
              {outlineSections.map((section, index) => (
                <li key={section.id}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <a href={`#${section.id}`}>{section.label}</a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="founder-editorial-content">
            <section aria-labelledby="profile-position-title">
              <p className="home-eyebrow">Engineering position / how it&apos;s communicated</p>
              <h2 id="profile-position-title">Clarity is the deliverable.</h2>
              <p>{profile.engineeringPhilosophy}</p>
              {profile.engineeringIdentity.length ? (
                <ul aria-label="Engineering identity statements">
                  {profile.engineeringIdentity.map((statement) => (
                    <li key={statement}>{statement}</li>
                  ))}
                </ul>
              ) : null}
            </section>

            <section aria-labelledby="profile-current-title">
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
            </section>
          </div>
        </PageContainer>
      </PublicSection>

      <ProfileHeroMedia profile={profile} />

      {groups.length ? (
        <EvidenceGraphFocusSync>
          <RelatedRecordsSection
            id="profile-evidence-title"
            eyebrow="Evidence / demonstrated contribution"
            title="Follow the record into the work."
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
