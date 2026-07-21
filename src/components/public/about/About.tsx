import Link from 'next/link';
import { PUBLIC_ABOUT } from '@/config/public-site';
import {
  founderAccentStyle,
  founderMotifViewTransitionStyle,
  getFounderIdentity,
} from '@/config/founder-identity';
import type {
  ImmutablePublic,
  PublicEngineeringProfileIndexEntry,
  PublicTeamMemberSummary,
} from '@/lib/public/domain';
import { formatPublicDate, PublicEmptyState } from '../EditorialPrimitives';
import { PageContainer, PublicSection } from '../PageContainer';
import { PublicImage } from '../PublicImage';
import { FounderMotif } from '../engineering/motifs';
import { FounderProfileLink } from '../engineering/FounderProfileLink';
import { slugFromProfileUrl } from '../engineering/profile-url';

export function About({
  team,
  profiles,
}: {
  team: readonly ImmutablePublic<PublicTeamMemberSummary>[];
  profiles: readonly ImmutablePublic<PublicEngineeringProfileIndexEntry>[];
}) {
  const eligibleProfileUrls = new Set(profiles.map(({ profile }) => profile.url));
  /**
   * Leadership keeps the premium Founder-card treatment and, with it, the
   * existing "prefer omission over approximation" rule: a record with no
   * real portrait has nothing to show here and simply doesn't appear,
   * rather than falling back to an initials placeholder. This also removes
   * any sample/verification records that predate real photography.
   */
  const leadership = team.filter(
    (member) => member.publicCategory === 'leadership' && member.portrait,
  );
  /**
   * The Engineering Team's compact card carries no portrait requirement —
   * it was never designed to hinge on photography the way the premium
   * Founder card does.
   */
  const engineeringTeam = team.filter((member) => member.publicCategory === 'team');

  return (
    <main id="main-content" tabIndex={-1} className="collection-main about-main">
      <header className="about-hero">
        <PageContainer className="about-hero-grid">
          <div className="about-hero-copy">
            <p className="home-eyebrow">{PUBLIC_ABOUT.eyebrow}</p>
            <h1>
              {PUBLIC_ABOUT.title.lead} <em>{PUBLIC_ABOUT.title.emphasis}</em>{' '}
              {PUBLIC_ABOUT.title.close}
            </h1>
            <p>{PUBLIC_ABOUT.introduction}</p>
          </div>
          <dl className="about-register" aria-label="HubZero operating model">
            <div>
              <dt>Structure</dt>
              <dd>Four permanent divisions</dd>
            </div>
            <div>
              <dt>Method</dt>
              <dd>Artifacts, decisions, and current state</dd>
            </div>
            <div>
              <dt>Public profiles</dt>
              <dd>{profiles.length}</dd>
            </div>
          </dl>
        </PageContainer>
      </header>

      <PublicSection className="about-operating" aria-labelledby="about-operating-title">
        <PageContainer>
          <header className="about-section-heading">
            <p className="home-eyebrow">Operating model / recurring practice</p>
            <h2 id="about-operating-title">Ideas move by evidence, not ceremony.</h2>
            <p>
              This is a recurring model, not a mandatory funnel. Typed relationships record when one
              piece of work actually informed another.
            </p>
          </header>
          <ol className="about-operating-ledger">
            {PUBLIC_ABOUT.operatingModel.map((item, index) => (
              <li key={item.label}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <p>{item.label}</p>
                  <h3>{item.verb}</h3>
                </div>
                <p>{item.description}</p>
                <Link href={item.href} aria-label={`Explore ${item.label}`}>
                  Explore <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ol>
        </PageContainer>
      </PublicSection>

      <PublicSection className="about-principles" aria-labelledby="about-principles-title">
        <PageContainer>
          <header className="about-section-heading about-section-heading-wide">
            <p className="home-eyebrow">Technical culture / principles in practice</p>
            <h2 id="about-principles-title">The engineering identity is the record itself.</h2>
          </header>
          <div className="about-principle-grid">
            {PUBLIC_ABOUT.principles.map((principle) => (
              <article key={principle.label}>
                <p className="home-eyebrow">{principle.label}</p>
                <h3>{principle.title}</h3>
                <p>{principle.body}</p>
              </article>
            ))}
          </div>
        </PageContainer>
      </PublicSection>

      <PublicSection className="about-team" aria-labelledby="about-team-title">
        <PageContainer>
          <header className="about-section-heading">
            <p className="home-eyebrow">People / accountable work</p>
            <h2 id="about-team-title">Leadership.</h2>
            <p>
              Public Team records establish identity. Engineering Profiles go deeper only when a
              person has a substantive, evidence-backed record to publish.
            </p>
          </header>

          {leadership.length ? (
            <div className="about-roster">
              {leadership.map((member) => {
                const identity = member.profile
                  ? getFounderIdentity(slugFromProfileUrl(member.profile.url) ?? '')
                  : undefined;
                const linkEligible = Boolean(
                  member.profile && eligibleProfileUrls.has(member.profile.url),
                );
                const technologies = member.profile?.technologies ?? [];

                return (
                  <article
                    key={`${member.group}-${member.title}`}
                    className="about-person"
                    style={identity ? founderAccentStyle(identity.accent) : undefined}
                  >
                    <div className="about-person-portrait">
                      {member.portrait ? <PublicImage media={member.portrait} /> : null}
                    </div>
                    <div className="about-person-content">
                      {identity && technologies.length ? (
                        <div
                          className="about-person-motif"
                          aria-hidden="true"
                          style={founderMotifViewTransitionStyle(identity.slug)}
                        >
                          <FounderMotif
                            motif={identity.motif}
                            technologies={technologies}
                            description={identity.motifDescription}
                            edgeAnchored
                          />
                        </div>
                      ) : null}
                      <p className="home-eyebrow">{member.group}</p>
                      <h3>{member.title}</h3>
                      <p className="about-person-role">{member.role}</p>
                      <p className="about-person-intro">{member.summary}</p>
                      {linkEligible && member.profile ? (
                        identity ? (
                          <FounderProfileLink href={member.profile.url}>
                            Read engineering profile <span aria-hidden="true">→</span>
                          </FounderProfileLink>
                        ) : (
                          <Link href={member.profile.url}>
                            Read engineering profile <span aria-hidden="true">→</span>
                          </Link>
                        )
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <PublicEmptyState
              id="about-empty-title"
              eyebrow="Roster / no approved public records"
              title="People appear when their public identity is approved."
              className="about-empty"
            >
              HubZero does not infer a public team from internal accounts or publish provisional
              biographies. The operating model remains available without inventing a roster.
            </PublicEmptyState>
          )}
        </PageContainer>
      </PublicSection>

      <PublicSection
        className="about-engineering-team"
        aria-labelledby="about-engineering-team-title"
      >
        <PageContainer>
          <header className="about-section-heading">
            <p className="home-eyebrow">Engineering Team / building alongside leadership</p>
            <h2 id="about-engineering-team-title">Engineering Team.</h2>
          </header>

          {engineeringTeam.length ? (
            <div className="about-team-compact">
              {engineeringTeam.map((member) => (
                <article
                  key={`${member.group}-${member.title}`}
                  className="about-team-compact-card"
                >
                  <p className="about-team-compact-name">{member.title}</p>
                  <p className="about-team-compact-role">{member.role}</p>
                  {member.summary ? (
                    <p className="about-team-compact-summary">{member.summary}</p>
                  ) : null}
                  {member.joinedAt ? (
                    <p className="about-team-compact-joined">
                      Joined {formatPublicDate(member.joinedAt)}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <PublicEmptyState
              id="about-engineering-team-empty-title"
              eyebrow="Engineering Team / no approved public records"
              title="Team profiles appear as people join publicly."
              className="about-empty"
            >
              The Engineering Team roster grows independently of Leadership — no placeholder records
              are published in the meantime.
            </PublicEmptyState>
          )}
        </PageContainer>
      </PublicSection>

      <footer className="about-close">
        <PageContainer className="about-close-grid">
          <div>
            <p className="home-eyebrow">Engineering Profiles / demonstrated practice</p>
            <h2>Follow the work through the people accountable for it.</h2>
          </div>
          <Link href="/engineering">
            Browse engineering profiles <span aria-hidden="true">→</span>
          </Link>
        </PageContainer>
      </footer>
    </main>
  );
}
