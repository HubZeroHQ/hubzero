import Link from 'next/link';
import { PUBLIC_ENTITY_ROUTES } from '@/config/public-site';
import type { ImmutablePublic, PublicEngineeringProfileIndexEntry } from '@/lib/public/domain';
import { PublicEmptyState, TechnologyList } from '../EditorialPrimitives';
import { PageContainer, PublicSection } from '../PageContainer';
import { PublicImage } from '../PublicImage';

export function EngineeringProfilesIndex({
  entries,
}: {
  entries: readonly ImmutablePublic<PublicEngineeringProfileIndexEntry>[];
}) {
  const evidenceCount = new Set(
    entries.flatMap(({ relationships }) =>
      relationships.map((relationship) => relationship.target.url),
    ),
  ).size;

  return (
    <main id="main-content" tabIndex={-1} className="collection-main engineering-main">
      <header className="collection-hero engineering-hero">
        <PageContainer className="collection-hero-grid">
          <div className="collection-hero-copy">
            <p className="home-eyebrow">Engineering Profiles / earned identity</p>
            <h1>Expertise documented through the work.</h1>
            <p>
              Profiles connect engineering judgement, current investigation, and authored records to
              the products and systems that demonstrate them.
            </p>
          </div>
          <dl className="collection-register" aria-label="Engineering Profile collection metadata">
            <div>
              <dt>Published profiles</dt>
              <dd>{entries.length}</dd>
            </div>
            <div>
              <dt>Evidence links</dt>
              <dd>{evidenceCount}</dd>
            </div>
            <div>
              <dt>Standard</dt>
              <dd>Substantive and evidence-backed</dd>
            </div>
          </dl>
        </PageContainer>
      </header>

      <PublicSection className="engineering-index" aria-labelledby="engineering-index-title">
        <PageContainer>
          <header className="collection-index-header engineering-index-header">
            <p className="home-eyebrow">People / documented contribution</p>
            <h2 id="engineering-index-title">Published engineering records</h2>
            {entries.length ? (
              <p>
                Each profile is selected for the evidence it can connect, not for résumé breadth.
              </p>
            ) : null}
          </header>

          {entries.length ? (
            <ol className="engineering-ledger">
              {entries.map(({ profile, areasOfExpertise, relationships }) => (
                <li key={profile.url}>
                  <article>
                    <div className="engineering-ledger-identity">
                      {profile.portrait ? <PublicImage media={profile.portrait} /> : null}
                      <div>
                        <p className="home-eyebrow">{profile.referenceId}</p>
                        <Link href={profile.url}>
                          <h3>{profile.title}</h3>
                          <span aria-hidden="true">→</span>
                        </Link>
                        <p>{profile.role}</p>
                      </div>
                    </div>
                    <div className="engineering-ledger-position">
                      <p>{profile.summary}</p>
                      {areasOfExpertise.length ? (
                        <ul className="engineering-expertise" aria-label="Areas of expertise">
                          {areasOfExpertise.map((area) => (
                            <li key={area}>{area}</li>
                          ))}
                        </ul>
                      ) : null}
                      <TechnologyList technologies={profile.technologies} />
                    </div>
                    <nav aria-label={`${profile.title} selected evidence`}>
                      <p className="home-eyebrow">Selected evidence / {relationships.length}</p>
                      <ul>
                        {relationships.slice(0, 5).map((relationship) => (
                          <li key={`${relationship.kind}-${relationship.target.url}`}>
                            <span>{relationship.label}</span>
                            {PUBLIC_ENTITY_ROUTES[relationship.target.type] ? (
                              <Link href={relationship.target.url}>
                                {relationship.target.title}
                              </Link>
                            ) : (
                              <span>{relationship.target.title}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </article>
                </li>
              ))}
            </ol>
          ) : (
            <PublicEmptyState
              id="engineering-empty-title"
              eyebrow="Profiles / no eligible entries"
              title="A profile is published when the evidence earns it."
              className="engineering-empty"
            >
              A profile is only created for a Team member who has earned that eligibility and has an
              approved public Team identity. Nothing is inferred from an internal account or résumé.
            </PublicEmptyState>
          )}
        </PageContainer>
      </PublicSection>
    </main>
  );
}
