import Link from 'next/link';
import {
  PUBLIC_ENTITY_ROUTES,
  PUBLIC_HOME,
  PUBLIC_NAVIGATION,
  PUBLIC_SITE,
} from '@/config/public-site';
import type {
  ImmutablePublic,
  PublicHomepageFeature,
  PublicHomepageProjection,
  PublicServiceSummary,
} from '@/lib/public/domain';
import { publicRoute } from '@/lib/public/routes';
import { PageContainer, PublicSection } from '../PageContainer';
import { formatPublicDate, SectionHeader } from '../EditorialPrimitives';
import { AxisDiagram } from '../EvidenceVisuals';
import { EvidenceGraph, EvidenceGraphFocusSync } from '../evidence-graph';
import { EditorialCard } from './EditorialCard';

const relationshipRoutes: Readonly<Record<string, boolean>> = PUBLIC_ENTITY_ROUTES;
const ledgerEnabled = Boolean(PUBLIC_NAVIGATION.find((item) => item.type === 'ledger')?.enabled);

/**
 * The Evidence Graph's node-and-line grammar is reserved for genuine
 * cross-collection relationships (originated in, applied in, generalized
 * as) — never reused for a plain contributor credit, which `EditorialCard`
 * already renders as its own quiet metadata row. Without this filter, the
 * lead feature's `teamContributedToEntry` relationships would render as
 * graph nodes here *and* as a text row on the card below it — the same
 * credit shown twice, at two different visual weights.
 */
function evidenceGraphRelationships(
  relationships: ImmutablePublic<PublicHomepageFeature>['relationships'],
) {
  return relationships.filter((relationship) => relationship.kind !== 'teamContributedToEntry');
}

export function Homepage({
  projection,
  services = [],
}: {
  projection: ImmutablePublic<PublicHomepageProjection>;
  services?: readonly ImmutablePublic<PublicServiceSummary>[];
}) {
  const work = PUBLIC_ENTITY_ROUTES.work ? projection.work : [];
  const builds = PUBLIC_ENTITY_ROUTES.build ? projection.builds : [];
  const labs = PUBLIC_ENTITY_ROUTES.lab ? projection.labs : [];
  const notes = PUBLIC_ENTITY_ROUTES.note ? projection.notes : [];
  const blueprint = PUBLIC_ENTITY_ROUTES.blueprint ? projection.blueprint : undefined;
  const profiles = PUBLIC_ENTITY_ROUTES.engineeringProfile ? projection.profiles : [];
  const hasEvidence = Boolean(
    work.length || builds.length || labs.length || notes.length || blueprint || profiles.length,
  );
  /**
   * The `#evidence` anchor (the Hero's "Inspect the evidence" link) must
   * land on whichever evidence section actually renders first — Builds,
   * Work, Blueprint, and Labs/Notes are each independently conditional, so
   * "first" isn't fixed. Computed once here rather than re-deriving it at
   * each section with a growing chain of negated-sibling checks.
   */
  const firstEvidenceSection = builds.length
    ? 'builds'
    : work.length
      ? 'work'
      : blueprint
        ? 'blueprint'
        : labs.length || notes.length
          ? 'current'
          : undefined;
  const currentTimeline = [
    ...labs.map((feature) => ({
      date: feature.entity.lastMajorUpdate ?? feature.entity.startDate,
      title: feature.entity.title,
      caption: 'Lab',
    })),
    ...notes.map((feature) => ({
      date: feature.entity.publicationDate,
      title: feature.entity.title,
      caption: 'Note',
    })),
  ]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-5);

  return (
    <main id="main-content" tabIndex={-1} className="home-main">
      <Hero hasEvidence={hasEvidence} publishedRecordCount={projection.publishedRecordCount} />

      {builds.length ? (
        <PublicSection
          className="home-feature-section"
          id={firstEvidenceSection === 'builds' ? 'evidence' : undefined}
        >
          <PageContainer>
            <SectionHeader
              eyebrow="Products / shipped"
              title={
                <>
                  Built to remain <em>useful.</em>
                </>
              }
              description="Products designed, engineered, and maintained inside HubZero."
            />
            <EvidenceGraphFocusSync>
              {builds[0] && evidenceGraphRelationships(builds[0].relationships).length ? (
                <div className="home-section-artifact">
                  <EvidenceGraph
                    subject={{ label: builds[0].entity.title, meta: 'Build' }}
                    relationships={evidenceGraphRelationships(builds[0].relationships)}
                  />
                </div>
              ) : null}
              <div className="home-feature-grid">
                {builds.map((feature, index) => (
                  <EditorialCard
                    key={feature.entity.url}
                    feature={feature}
                    routeEnabled
                    relationshipRoutes={relationshipRoutes}
                    prominent={index === 0}
                    priority={index === 0}
                  />
                ))}
              </div>
            </EvidenceGraphFocusSync>
          </PageContainer>
        </PublicSection>
      ) : null}

      <OperatingSystem />

      {work.length ? (
        <PublicSection id={firstEvidenceSection === 'work' ? 'evidence' : undefined}>
          <PageContainer>
            <SectionHeader
              title={
                <>
                  Constraints made <em>legible.</em>
                </>
              }
              description="Client work is shown through the decisions and outcomes that can be verified."
            />
            <EvidenceGraphFocusSync>
              {work[0] && evidenceGraphRelationships(work[0].relationships).length ? (
                <div className="home-section-artifact">
                  <EvidenceGraph
                    subject={{ label: work[0].entity.title, meta: 'Work' }}
                    relationships={evidenceGraphRelationships(work[0].relationships)}
                  />
                </div>
              ) : null}
              {work.map((feature) => (
                <EditorialCard
                  key={feature.entity.url}
                  feature={feature}
                  routeEnabled
                  relationshipRoutes={relationshipRoutes}
                  prominent
                />
              ))}
            </EvidenceGraphFocusSync>
          </PageContainer>
        </PublicSection>
      ) : null}

      {blueprint ? (
        <PublicSection id={firstEvidenceSection === 'blueprint' ? 'evidence' : undefined}>
          <PageContainer>
            <SectionHeader
              eyebrow="Blueprint / reusable foundation"
              title={
                <>
                  A proven pattern, made <em>inspectable.</em>
                </>
              }
              description="Blueprints pair information architecture with a defined design language and a working preview."
            />
            <div className="home-section-artifact">
              <AxisDiagram
                label="System register"
                items={[
                  { label: 'Architecture', value: blueprint.entity.architecture },
                  { label: 'Design language', value: blueprint.entity.designLanguage },
                  { label: 'Version', value: `v${blueprint.entity.version}` },
                ]}
              />
            </div>
            <EditorialCard
              feature={blueprint}
              routeEnabled
              relationshipRoutes={relationshipRoutes}
              prominent
            />
          </PageContainer>
        </PublicSection>
      ) : null}

      {labs.length || notes.length ? (
        <PublicSection id={firstEvidenceSection === 'current' ? 'evidence' : undefined}>
          <PageContainer>
            <SectionHeader
              title={
                <>
                  Work shown in the <em>present tense.</em>
                </>
              }
              description="Dated investigations and technical notes, included only while they remain current."
            />
            {/*
              Ledger doesn't appear in primary navigation (Design
              Specification §5) — this section surfaces the same underlying
              data the Ledger presents in full, so it's the natural place to
              point a visitor toward the complete chronological record.
            */}
            {ledgerEnabled ? (
              <Link href={publicRoute.ledger()} className="home-text-link">
                See the full chronological record <span aria-hidden="true">→</span>
              </Link>
            ) : null}
            {currentTimeline.length ? (
              <div className="home-section-artifact">
                <AxisDiagram
                  label="Publication timeline"
                  items={currentTimeline.map((entry) => ({
                    label: formatPublicDate(entry.date),
                    value: entry.title,
                    caption: entry.caption,
                  }))}
                />
              </div>
            ) : null}
            <div className="home-current-grid">
              {labs.length ? (
                <section aria-labelledby="featured-labs-title">
                  <h3 id="featured-labs-title" className="home-subsection-title">
                    Featured Labs
                  </h3>
                  <div className="home-ledger">
                    {labs.map((feature) => (
                      <EditorialCard
                        key={feature.entity.url}
                        feature={feature}
                        routeEnabled
                        relationshipRoutes={relationshipRoutes}
                        layout="row"
                      />
                    ))}
                  </div>
                </section>
              ) : null}
              {notes.length ? (
                <section aria-labelledby="featured-notes-title">
                  <h3 id="featured-notes-title" className="home-subsection-title">
                    Featured Notes
                  </h3>
                  <div className="home-ledger">
                    {notes.map((feature) => (
                      <EditorialCard
                        key={feature.entity.url}
                        feature={feature}
                        routeEnabled
                        relationshipRoutes={relationshipRoutes}
                        layout="row"
                      />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </PageContainer>
        </PublicSection>
      ) : null}

      {profiles.length ? (
        <PublicSection>
          <PageContainer>
            <SectionHeader
              title={
                <>
                  Judgement has an <em>owner.</em>
                </>
              }
              description="Profiles connect engineering positions to the evidence that supports them."
            />
            <div className="home-profile-grid">
              {profiles.map((feature) => (
                <EditorialCard
                  key={feature.entity.url}
                  feature={feature}
                  routeEnabled
                  relationshipRoutes={relationshipRoutes}
                />
              ))}
            </div>
          </PageContainer>
        </PublicSection>
      ) : null}

      <ServicesPassage services={services} />
      <Closing />
    </main>
  );
}

function ServicesPassage({
  services,
}: {
  services: readonly ImmutablePublic<PublicServiceSummary>[];
}) {
  return (
    <PublicSection className="home-services">
      <PageContainer className="home-services-grid">
        <div>
          <p className="home-eyebrow">Services / evidence by need</p>
          <h2>Capability follows the engineering record.</h2>
        </div>
        <div>
          <p>
            Services organise public evidence around a problem without turning products, client
            work, research, or reusable foundations into sales claims.
          </p>
          {services.length ? (
            <ul aria-label="Published evidence-backed services">
              {services.slice(0, 4).map((service) => (
                <li key={service.title}>{service.title}</li>
              ))}
            </ul>
          ) : null}
          <Link href={publicRoute.collection('service')} className="home-text-link">
            Review services <span aria-hidden="true">→</span>
          </Link>
        </div>
      </PageContainer>
    </PublicSection>
  );
}

function Hero({
  hasEvidence,
  publishedRecordCount,
}: {
  hasEvidence: boolean;
  publishedRecordCount: number;
}) {
  return (
    <section className="home-hero" aria-labelledby="home-title">
      <PageContainer className="home-hero-grid">
        <div className="home-hero-copy">
          <p className="home-eyebrow">{PUBLIC_HOME.eyebrow}</p>
          <h1 id="home-title">
            {PUBLIC_HOME.title.lead} <em>{PUBLIC_HOME.title.emphasis}</em> {PUBLIC_HOME.title.close}
          </h1>
          <p>{PUBLIC_HOME.introduction}</p>
          <a className="home-text-link" href={hasEvidence ? '#evidence' : '#operating-system'}>
            {hasEvidence ? 'Inspect the evidence' : 'See how the studio works'}
            <span aria-hidden="true">↓</span>
          </a>
        </div>
        <aside className="home-hero-register" aria-label="HubZero publication principles">
          <p className="home-eyebrow">Public record / 001</p>
          <dl>
            <div>
              <dt>Published</dt>
              <dd>
                {publishedRecordCount} public {publishedRecordCount === 1 ? 'record' : 'records'}
              </dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>Published Studio records</dd>
            </div>
            <div>
              <dt>Standard</dt>
              <dd>Evidence before claims</dd>
            </div>
            <div>
              <dt>Structure</dt>
              <dd>Four permanent divisions</dd>
            </div>
          </dl>
        </aside>
      </PageContainer>
    </section>
  );
}

function OperatingSystem() {
  return (
    <PublicSection className="home-operating" id="operating-system">
      <PageContainer>
        <SectionHeader
          eyebrow="The operating system"
          title={
            <>
              Four divisions. One body of <em>evidence.</em>
            </>
          }
          description="Ideas can move between research, products, client application, and reusable foundations. Relationships record the paths that actually happened."
        />
        {/*
          Deliberately no diagram here. A numbered, line-connected axis
          (the same primitive used for the Blueprint spec sheet and the
          publication timeline below) would draw this as a sequence with a
          start and an end — but the model is a recurring one: a Blueprint
          can inform new Work, a Lab can restart from a lesson a Note
          surfaced. The plain, ordered list below states the relationship
          in words instead of asserting a tidier shape than what's real.
          Revisit once cross-collection relationship density is real enough
          to render this as an honest, data-derived graph instead.
        */}
        <ol className="home-pillar-list">
          {PUBLIC_HOME.pillars.map((pillar, index) => {
            const enabled = PUBLIC_ENTITY_ROUTES[pillar.type];
            const content = (
              <>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{pillar.label}</h3>
                <p>{pillar.description}</p>
                {enabled ? <span aria-hidden="true">↗</span> : null}
              </>
            );
            return (
              <li key={pillar.label}>
                {enabled ? (
                  <Link href={pillar.href} className="home-pillar-row">
                    {content}
                  </Link>
                ) : (
                  <div className="home-pillar-row">{content}</div>
                )}
              </li>
            );
          })}
        </ol>
      </PageContainer>
    </PublicSection>
  );
}

function Closing() {
  return (
    <PublicSection className="home-closing">
      <PageContainer className="home-closing-grid">
        <p className="home-eyebrow">{PUBLIC_HOME.closing.eyebrow}</p>
        <div>
          <h2>{PUBLIC_HOME.closing.title}</h2>
          <p>{PUBLIC_HOME.closing.body}</p>
          {PUBLIC_SITE.release.contact ? (
            <Link href={publicRoute.contact({ from: 'home' })} className="home-primary-link">
              Start a project conversation <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
      </PageContainer>
    </PublicSection>
  );
}
