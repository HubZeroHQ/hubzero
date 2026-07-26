import Link from 'next/link';
import type {
  PublicBlueprintSummary,
  ImmutablePublic,
  PublicBuildSummary,
  PublicLabSummary,
  PublicTaxonomyTerm,
  PublicWorkSummary,
} from '@/lib/public/domain';
import { publicRoute } from '@/lib/public/routes';
import {
  formatMetadata,
  MetadataRow,
  PublicationMetadata,
  PublicEmptyState,
  TechnologyList,
} from '../EditorialPrimitives';
import { PageContainer, PublicSection } from '../PageContainer';
import { PublicImage } from '../PublicImage';

type CollectionSummary =
  PublicWorkSummary | PublicBuildSummary | PublicBlueprintSummary | PublicLabSummary;

/** Fixed lifecycle order for Labs' stage-led grouping — most-advanced stage first, mirroring Builds' live-before-retired precedent (a more-resolved state is given prominence). */
const STAGE_ORDER: readonly PublicLabSummary['stage'][] = ['testing', 'building', 'exploring'];

const COPY = {
  work: {
    eyebrow: 'Work / client engineering',
    title: 'Consequences, decisions, and the work between them.',
    introduction:
      'Work documents how a real constraint was understood, what HubZero was responsible for, and which engineering decisions changed the outcome.',
    collectionLabel: 'Client case studies',
    indexTitle: 'Published case studies',
    emptyTitle: 'The public record begins with verified evidence.',
    emptyBody:
      'Case studies will appear here when the client work is approved for publication and its context, decisions, outcome, and lessons form a complete engineering record.',
  },
  build: {
    eyebrow: 'Builds / product portfolio',
    title: 'Products built to remain useful.',
    introduction:
      'Builds are finished products created inside HubZero. Each record documents what the product does, how it works, and the decisions that shaped it.',
    collectionLabel: 'Finished internal products',
    indexTitle: 'Published products',
    emptyTitle: 'The product record starts with shipped work.',
    emptyBody:
      'Builds will appear here when a finished HubZero product has a complete public record: product context, technical evidence, and an honest current state.',
  },
  blueprint: {
    eyebrow: 'Blueprints / reusable systems',
    title: 'Engineering foundations made reusable.',
    introduction:
      'Blueprints are versioned foundations for recurring product and website problems. Each publication defines its information architecture, design language, implementation guidance, and evidence of use.',
    collectionLabel: 'Reusable engineering assets',
    indexTitle: 'Published foundations',
    emptyTitle: 'A Blueprint is published when the system is reusable.',
    emptyBody:
      'Blueprints will appear here when a versioned foundation has a working implementation, structured documentation, and enough evidence for another team to evaluate and reuse it.',
  },
  lab: {
    eyebrow: 'Labs / current engineering',
    title: 'Engineering shown in the present tense.',
    introduction:
      'Labs documents active investigation before the result becomes a finished product. Stage, milestones, evidence, and blockers remain visible as the work changes.',
    collectionLabel: 'Active investigations',
    indexTitle: 'Published investigations',
    emptyTitle: 'A Lab begins when there is evidence to follow.',
    emptyBody:
      'Investigations will appear here once their objective, current stage, dated progress, and next direction form a useful public engineering record.',
  },
} as const;

export function PublicCollectionIndex({
  type,
  entries,
  categoryFilters = [],
  activeCategory,
  architectureFilters = [],
  activeArchitecture,
  designLanguageFilters = [],
  activeDesignLanguage,
  stageFilters = [],
  activeStage,
}: {
  type: CollectionSummary['type'];
  entries: readonly ImmutablePublic<CollectionSummary>[];
  categoryFilters?: readonly ImmutablePublic<PublicTaxonomyTerm>[];
  activeCategory?: string;
  architectureFilters?: readonly string[];
  activeArchitecture?: string;
  designLanguageFilters?: readonly string[];
  activeDesignLanguage?: string;
  stageFilters?: readonly PublicLabSummary['stage'][];
  activeStage?: string;
}) {
  const copy = COPY[type];
  const taxonomyCount = new Set(
    entries.flatMap((entry) => entry.technologies.map((term) => term.slug)),
  ).size;

  return (
    <main id="main-content" tabIndex={-1} className="collection-main">
      <section className="collection-hero" aria-labelledby="collection-title">
        <PageContainer className="collection-hero-grid">
          <div className="collection-hero-copy">
            <p className="home-eyebrow">{copy.eyebrow}</p>
            <h1 id="collection-title">{copy.title}</h1>
            <p>{copy.introduction}</p>
          </div>
          <dl className="collection-register" aria-label="Collection metadata">
            <div>
              <dt>Collection</dt>
              <dd>{copy.collectionLabel}</dd>
            </div>
            <div>
              <dt>Records</dt>
              <dd>{entries.length}</dd>
            </div>
            <div>
              <dt>Technologies</dt>
              <dd>{taxonomyCount}</dd>
            </div>
          </dl>
        </PageContainer>
      </section>

      <PublicSection className="collection-index" aria-labelledby="collection-index-title">
        <PageContainer>
          <header className="collection-index-header">
            <p className="home-eyebrow">Collection / published Studio records</p>
            <h2 id="collection-index-title">{copy.indexTitle}</h2>
            {entries.length ? (
              <p>
                {entries.length} eligible published {entries.length === 1 ? 'record' : 'records'}.
                {type === 'lab' ? (
                  <>
                    {' '}
                    Lab activity alongside Notes forms the{' '}
                    <Link href={publicRoute.ledger()}>full Ledger</Link>.
                  </>
                ) : null}
              </p>
            ) : null}
          </header>

          {type === 'work' && categoryFilters.length > 1 ? (
            <nav className="collection-filters" aria-label="Filter Work by category">
              <Link
                href={publicRoute.workCategory()}
                className="collection-filter"
                aria-current={!activeCategory ? 'page' : undefined}
              >
                All
              </Link>
              {categoryFilters.map((category) => (
                <Link
                  key={category.slug}
                  href={publicRoute.workCategory(category.slug)}
                  className="collection-filter"
                  aria-current={activeCategory === category.slug ? 'page' : undefined}
                >
                  {category.label}
                </Link>
              ))}
            </nav>
          ) : null}

          {type === 'blueprint' && architectureFilters.length > 1 ? (
            <nav className="collection-filters" aria-label="Filter Blueprints by architecture">
              <Link
                href={publicRoute.blueprintFilter({ designLanguage: activeDesignLanguage })}
                className="collection-filter"
                aria-current={!activeArchitecture ? 'page' : undefined}
              >
                All
              </Link>
              {architectureFilters.map((architecture) => (
                <Link
                  key={architecture}
                  href={publicRoute.blueprintFilter({
                    architecture,
                    designLanguage: activeDesignLanguage,
                  })}
                  className="collection-filter"
                  aria-current={activeArchitecture === architecture ? 'page' : undefined}
                >
                  {architecture}
                </Link>
              ))}
            </nav>
          ) : null}

          {type === 'blueprint' && designLanguageFilters.length > 1 ? (
            <nav className="collection-filters" aria-label="Filter Blueprints by design language">
              <Link
                href={publicRoute.blueprintFilter({ architecture: activeArchitecture })}
                className="collection-filter"
                aria-current={!activeDesignLanguage ? 'page' : undefined}
              >
                All
              </Link>
              {designLanguageFilters.map((designLanguage) => (
                <Link
                  key={designLanguage}
                  href={publicRoute.blueprintFilter({
                    architecture: activeArchitecture,
                    designLanguage,
                  })}
                  className="collection-filter"
                  aria-current={activeDesignLanguage === designLanguage ? 'page' : undefined}
                >
                  {designLanguage}
                </Link>
              ))}
            </nav>
          ) : null}

          {type === 'lab' && stageFilters.length > 1 ? (
            <nav className="collection-filters" aria-label="Filter Labs by stage">
              <Link
                href={publicRoute.labStage()}
                className="collection-filter"
                aria-current={!activeStage ? 'page' : undefined}
              >
                All
              </Link>
              {stageFilters.map((stage) => (
                <Link
                  key={stage}
                  href={publicRoute.labStage(stage)}
                  className="collection-filter"
                  aria-current={activeStage === stage ? 'page' : undefined}
                >
                  {formatMetadata(stage)}
                </Link>
              ))}
            </nav>
          ) : null}

          {entries.length ? (
            type === 'work' ? (
              <WorkCaseFileList
                entries={entries as readonly ImmutablePublic<PublicWorkSummary>[]}
              />
            ) : type === 'build' ? (
              <BuildShelf entries={entries as readonly ImmutablePublic<PublicBuildSummary>[]} />
            ) : type === 'lab' ? (
              <LabStageList entries={entries as readonly ImmutablePublic<PublicLabSummary>[]} />
            ) : (
              <div className="collection-grid">
                {entries.map((entry, index) => (
                  <CollectionCard key={entry.url} entry={entry} priority={index === 0} />
                ))}
              </div>
            )
          ) : (
            <PublicEmptyState
              id="collection-empty-title"
              eyebrow="Public record / no eligible entries"
              title={copy.emptyTitle}
            >
              {copy.emptyBody}
            </PublicEmptyState>
          )}
        </PageContainer>
      </PublicSection>
    </main>
  );
}

function CollectionCard({
  entry,
  priority,
}: {
  entry: ImmutablePublic<CollectionSummary>;
  priority: boolean;
}) {
  return (
    <article className="home-card collection-card">
      {entry.hero ? (
        <div className="home-card-media">
          <PublicImage media={entry.hero} priority={priority} />
        </div>
      ) : null}
      <div className="home-card-body">
        <MetadataRow entity={entry} />
        <Link href={entry.url} className="home-card-title">
          <h3>{entry.title}</h3>
          <span aria-hidden="true">↗</span>
        </Link>
        <p className="home-card-summary">{entry.summary}</p>
        <PublicationMetadata entity={entry} />
        <TechnologyList technologies={entry.technologies} />
      </div>
    </article>
  );
}

/** Work's index form: a case-file list, not a card shelf — the summary (an outcome sentence, by editorial convention) leads each row as prose, the reference/client/timeline register sits above it like a case-file header, and the hero image is a small secondary element instead of the dominant lead. */
function WorkCaseFileList({ entries }: { entries: readonly ImmutablePublic<PublicWorkSummary>[] }) {
  return (
    <ol className="collection-list" aria-label="Case studies">
      {entries.map((entry) => (
        <li key={entry.url}>
          <WorkCaseFileRow entry={entry} />
        </li>
      ))}
    </ol>
  );
}

function WorkCaseFileRow({ entry }: { entry: ImmutablePublic<PublicWorkSummary> }) {
  return (
    <article className="collection-row">
      <div className="collection-row-body">
        <MetadataRow entity={entry} />
        <Link href={entry.url} className="collection-row-title">
          <h3>{entry.title}</h3>
          <span aria-hidden="true">→</span>
        </Link>
        <p className="collection-row-summary">{entry.summary}</p>
        <TechnologyList technologies={entry.technologies} />
        <TechnologyList technologies={entry.categories} label="Categories" />
      </div>
      {entry.hero ? (
        <div className="collection-row-media">
          <PublicImage media={entry.hero} />
        </div>
      ) : null}
    </article>
  );
}

/** Builds' index form: a product shelf grouped by deployment state — retired products are never hidden, only grouped under their own heading below the live shelf. */
function BuildShelf({ entries }: { entries: readonly ImmutablePublic<PublicBuildSummary>[] }) {
  const live = entries.filter((entry) => entry.deploymentState === 'live');
  const retired = entries.filter((entry) => entry.deploymentState === 'retired');

  return (
    <>
      {live.length ? (
        <div className="collection-group">
          <h3 className="collection-group-heading">Live products</h3>
          <div className="collection-grid">
            {live.map((entry, index) => (
              <CollectionCard key={entry.url} entry={entry} priority={index === 0} />
            ))}
          </div>
        </div>
      ) : null}
      {retired.length ? (
        <div className="collection-group">
          <h3 className="collection-group-heading">Retired products</h3>
          <div className="collection-grid">
            {retired.map((entry, index) => (
              <CollectionCard
                key={entry.url}
                entry={entry}
                priority={live.length === 0 && index === 0}
              />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

/** Labs' index form: stage-led groups (most-advanced first), recency-sorted within each — a distinct structure from the reverse-chronological Ledger, which mixes Labs and Notes together. */
function LabStageList({ entries }: { entries: readonly ImmutablePublic<PublicLabSummary>[] }) {
  const groups = STAGE_ORDER.map((stage) => ({
    stage,
    entries: entries
      .filter((entry) => entry.stage === stage)
      .slice()
      .sort((a, b) => labRecency(b) - labRecency(a)),
  })).filter((group) => group.entries.length);

  return (
    <>
      {groups.map((group) => (
        <div key={group.stage} className="collection-group">
          <h3 className="collection-group-heading">{formatMetadata(group.stage)}</h3>
          <ol
            className="collection-list"
            aria-label={`${formatMetadata(group.stage)} investigations`}
          >
            {group.entries.map((entry) => (
              <li key={entry.url}>
                <LabStageRow entry={entry} />
              </li>
            ))}
          </ol>
        </div>
      ))}
    </>
  );
}

function labRecency(entry: ImmutablePublic<PublicLabSummary>): number {
  return new Date(entry.lastMajorUpdate ?? entry.startDate).getTime();
}

function LabStageRow({ entry }: { entry: ImmutablePublic<PublicLabSummary> }) {
  return (
    <article className="collection-row">
      <div className="collection-row-body">
        <MetadataRow entity={entry} />
        <Link href={entry.url} className="collection-row-title">
          <h3>{entry.title}</h3>
          <span aria-hidden="true">→</span>
        </Link>
        <p className="collection-row-summary">{entry.summary}</p>
        <PublicationMetadata entity={entry} />
        <TechnologyList technologies={entry.technologies} />
      </div>
      {entry.hero ? (
        <div className="collection-row-media">
          <PublicImage media={entry.hero} />
        </div>
      ) : null}
    </article>
  );
}
