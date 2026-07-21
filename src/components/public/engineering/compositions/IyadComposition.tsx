import {
  founderAccentStyle,
  founderMotifViewTransitionStyle,
  type FounderIdentity,
} from '@/config/founder-identity';
import type { ImmutablePublic } from '@/lib/public/domain';
import { PublicBreadcrumbs, TechnologyList } from '../../EditorialPrimitives';
import { PageContainer, PublicSection } from '../../PageContainer';
import { ProseRenderer } from '../../ProseRenderer';
import { PublicImage } from '../../PublicImage';
import { FounderMotif } from '../motifs';
import {
  ProfileEvidenceGraph,
  ProfileFooter,
  RelationshipGroup,
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
          <p className="home-eyebrow founder-eyebrow">
            Engineering Profile / {profile.referenceId}
          </p>
          <h1>{profile.title}</h1>
          <p className="profile-role">{profile.role}</p>
          <p className="detail-summary">{profile.summary}</p>
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

      <PublicSection className="profile-position" aria-labelledby="profile-position-title">
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

      <PublicSection className="profile-current" aria-labelledby="profile-current-title">
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
            <TechnologyList technologies={profile.technologies} />
          </div>
        </PageContainer>
      </PublicSection>

      {profile.hero ? (
        <PublicSection className="profile-hero-media" aria-label="Profile lead media">
          <PageContainer>
            <PublicImage media={profile.hero} />
          </PageContainer>
        </PublicSection>
      ) : null}

      {groups.length ? (
        <PublicSection className="profile-evidence" aria-labelledby="profile-evidence-title">
          <PageContainer className="profile-evidence-grid">
            <header>
              <p className="home-eyebrow">Evidence / demonstrated contribution</p>
              <h2 id="profile-evidence-title">Follow the product into the work.</h2>
              <p>
                Every connection below is explicit in the public record. Internal creator metadata
                is never treated as contribution credit.
              </p>
              <ProfileEvidenceGraph profile={profile} />
            </header>
            <div className="detail-relation-groups">
              {groups.map((group) => (
                <RelationshipGroup
                  key={group.type}
                  title={group.title}
                  relationships={group.relationships}
                />
              ))}
            </div>
          </PageContainer>
        </PublicSection>
      ) : null}

      {documents.map(({ document, eyebrow, title }) => (
        <PublicSection
          key={document.role}
          className="profile-document"
          aria-labelledby={`profile-document-${document.role}`}
        >
          <PageContainer className="profile-document-grid">
            <header>
              <p className="home-eyebrow">{eyebrow}</p>
              <h2 id={`profile-document-${document.role}`}>{title}</h2>
              {document.outline?.length && document.outline.length > 1 ? (
                <nav className="detail-outline" aria-label={`${title} contents`}>
                  <ol>
                    {document.outline.map((item) => (
                      <li key={item.id}>
                        <a href={`#${item.id}`}>{item.text}</a>
                      </li>
                    ))}
                  </ol>
                </nav>
              ) : null}
            </header>
            <ProseRenderer document={document} headingOffset={1} as="div" />
          </PageContainer>
        </PublicSection>
      ))}

      {profile.gallery.length ? (
        <PublicSection className="profile-gallery" aria-labelledby="profile-gallery-title">
          <PageContainer>
            <header className="detail-section-header">
              <p className="home-eyebrow">Media / supporting evidence</p>
              <h2 id="profile-gallery-title">Artifacts from the work</h2>
            </header>
            <div className="detail-gallery-grid">
              {profile.gallery.map((media) => (
                <PublicImage key={media.url} media={media} />
              ))}
            </div>
          </PageContainer>
        </PublicSection>
      ) : null}

      <ProfileFooter profile={profile} />
    </article>
  );
}
