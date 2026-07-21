import {
  founderAccentStyle,
  founderMotifViewTransitionStyle,
  type FounderIdentity,
} from '@/config/founder-identity';
import type { ImmutablePublic } from '@/lib/public/domain';
import { PublicBreadcrumbs } from '../../EditorialPrimitives';
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
 * Salsabeel — Hardware Precision. Technologies render as a routed pinout
 * table, not a pill list — each entry numbered like a component pad. The
 * PCB trace motif sits above it as the routing diagram those pads belong
 * to. Tight grid, monospace-forward, minimal motion beyond the trace draw.
 */
export function SalsabeelComposition({
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
      className="collection-main profile-detail founder-profile founder-profile-pcb-trace"
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

      <PublicSection className="founder-routing" aria-labelledby="founder-routing-title">
        <PageContainer>
          <header>
            <p className="home-eyebrow">Routing / component pads</p>
            <h2 id="founder-routing-title">Precision is the constraint.</h2>
          </header>
          <div
            className="founder-motif-frame founder-motif-frame-pcb-trace"
            style={founderMotifViewTransitionStyle(identity.slug)}
          >
            <FounderMotif
              motif={identity.motif}
              technologies={profile.technologies}
              description={identity.motifDescription}
            />
          </div>
          {profile.technologies.length ? (
            <table className="founder-pinout" aria-label="Technology pinout">
              <thead>
                <tr>
                  <th scope="col">Pad</th>
                  <th scope="col">Technology</th>
                </tr>
              </thead>
              <tbody>
                {profile.technologies.map((technology, index) => (
                  <tr key={`${technology.kind}-${technology.slug}`}>
                    <td>{String(index + 1).padStart(2, '0')}</td>
                    <td>{technology.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </PageContainer>
      </PublicSection>

      <PublicSection className="profile-position" aria-labelledby="profile-position-title">
        <PageContainer className="profile-position-grid">
          <header>
            <p className="home-eyebrow">Engineering position / current practice</p>
            <h2 id="profile-position-title">Understand before you build.</h2>
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

      <PublicSection className="profile-current" aria-labelledby="profile-current-title">
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
              <h2 id="profile-evidence-title">Follow the routing into the work.</h2>
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
