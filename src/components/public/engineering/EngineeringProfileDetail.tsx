import { getFounderIdentity } from '@/config/founder-identity';
import type { ImmutablePublic } from '@/lib/public/domain';
import { publicRoute } from '@/lib/public/routes';
import { PublicBreadcrumbs, TechnologyList } from '../EditorialPrimitives';
import { PageContainer, PublicSection } from '../PageContainer';
import { ProseRenderer } from '../ProseRenderer';
import { PublicImage } from '../PublicImage';
import { FOUNDER_COMPOSITIONS } from './compositions';
import {
  ProfileEvidenceGraph,
  ProfileFooter,
  RelationshipGroup,
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

      {profile.hero ? (
        <PublicSection className="profile-hero-media" aria-label="Profile lead media">
          <PageContainer>
            <PublicImage media={profile.hero} />
          </PageContainer>
        </PublicSection>
      ) : null}

      <PublicSection className="profile-position" aria-labelledby="profile-position-title">
        <PageContainer className="profile-position-grid">
          <header>
            <p className="home-eyebrow">Engineering position / current practice</p>
            <h2 id="profile-position-title">How the work is approached.</h2>
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
            <TechnologyList technologies={profile.technologies} />
          </div>
        </PageContainer>
      </PublicSection>

      {groups.length ? (
        <PublicSection className="profile-evidence" aria-labelledby="profile-evidence-title">
          <PageContainer className="profile-evidence-grid">
            <header>
              <p className="home-eyebrow">Evidence / demonstrated contribution</p>
              <h2 id="profile-evidence-title">Follow the contribution into the work.</h2>
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
