import Link from 'next/link';
import { PUBLIC_ENTITY_ROUTES } from '@/config/public-site';
import type { ImmutablePublic, PublicEntityDetail, PublicRelationship } from '@/lib/public/domain';
import {
  ContributorList,
  formatMetadata,
  formatPublicDate,
  PublicBreadcrumbs,
  RelationshipCard,
  relationshipKey,
  TechnologyList,
} from '../EditorialPrimitives';
import { PageContainer, PublicSection } from '../PageContainer';
import { ProseRenderer } from '../ProseRenderer';
import { PublicImage } from '../PublicImage';
import { BlueprintFeatureList } from './BlueprintFeatureList';

type BuildDetail = Extract<PublicEntityDetail, { type: 'build' }>;
type BlueprintDetail = Extract<PublicEntityDetail, { type: 'blueprint' }>;
type LabDetail = Extract<PublicEntityDetail, { type: 'lab' }>;
type WorkDetail = Extract<PublicEntityDetail, { type: 'work' }>;
type CollectionDetail = WorkDetail | BuildDetail | BlueprintDetail | LabDetail;

const DOCUMENT_LABELS: Record<string, { eyebrow: string; title: string }> = {
  caseStudy: { eyebrow: 'Product lens', title: 'Product story' },
  technical: { eyebrow: 'Technical lens', title: 'Architecture and decisions' },
  overview: { eyebrow: 'Research record', title: 'Overview' },
  engineeringJournal: { eyebrow: 'Research record', title: 'Engineering journal' },
  findings: { eyebrow: 'Research record', title: 'Findings' },
  researchNotes: { eyebrow: 'Research record', title: 'Research notes' },
};

export function PublicCollectionDetail({ entity }: { entity: ImmutablePublic<CollectionDetail> }) {
  const collection =
    entity.type === 'work'
      ? 'Work'
      : entity.type === 'build'
        ? 'Builds'
        : entity.type === 'blueprint'
          ? 'Blueprints'
          : 'Labs';
  const collectionHref =
    entity.type === 'work'
      ? '/work'
      : entity.type === 'build'
        ? '/builds'
        : entity.type === 'blueprint'
          ? '/blueprints'
          : '/labs';
  const lineage = entity.relationships.filter(
    (relationship) => relationship.kind === 'labGraduatedToBuild',
  );
  const connected = entity.relationships.filter(
    (relationship) => relationship.kind !== 'labGraduatedToBuild',
  );
  const workRelationshipGroups =
    entity.type === 'work'
      ? [
          {
            title: 'Engineering foundations',
            relationships: connected.filter((item) => item.target.type === 'build'),
          },
          {
            title: 'Reusable foundations',
            relationships: connected.filter((item) => item.target.type === 'blueprint'),
          },
          {
            title: 'Connected investigations',
            relationships: connected.filter((item) => item.target.type === 'lab'),
          },
          {
            title: 'Engineering notes',
            relationships: connected.filter((item) => item.target.type === 'note'),
          },
        ].filter((group) => group.relationships.length)
      : [];
  const buildRelationshipGroups =
    entity.type === 'build'
      ? [
          {
            title: 'Applied in client work',
            relationships: connected.filter((item) => item.target.type === 'work'),
          },
          {
            title: 'Connected investigations',
            relationships: connected.filter((item) => item.target.type === 'lab'),
          },
        ].filter((group) => group.relationships.length)
      : [];
  const labRelationshipGroups =
    entity.type === 'lab'
      ? [
          {
            title: 'Related Builds',
            relationships: connected.filter((item) => item.target.type === 'build'),
          },
          {
            title: 'Related Blueprints',
            relationships: connected.filter((item) => item.target.type === 'blueprint'),
          },
        ].filter((group) => group.relationships.length)
      : [];
  const blueprintRelationshipGroups =
    entity.type === 'blueprint'
      ? [
          {
            title: 'Proven in client work',
            relationships: connected.filter((item) => item.target.type === 'work'),
          },
          {
            title: 'Connected products',
            relationships: connected.filter((item) => item.target.type === 'build'),
          },
          {
            title: 'Explored in Labs',
            relationships: connected.filter((item) => item.target.type === 'lab'),
          },
          {
            title: 'Engineering notes',
            relationships: connected.filter((item) => item.target.type === 'note'),
          },
        ].filter((group) => group.relationships.length)
      : [];

  return (
    <main id="main-content" tabIndex={-1} className="collection-main detail-main">
      <header className="detail-hero">
        <PageContainer>
          <PublicBreadcrumbs
            items={[
              { label: 'HubZero', href: '/' },
              { label: collection, href: collectionHref },
              { label: entity.title },
            ]}
          />
          <div className="detail-hero-grid">
            <div className="detail-title-block">
              <p className="home-eyebrow">
                {entity.type === 'work'
                  ? 'Work / engineering case study'
                  : entity.type === 'build'
                    ? 'Build / shipped product'
                    : entity.type === 'blueprint'
                      ? 'Blueprint / reusable engineering asset'
                      : 'Lab / active investigation'}
              </p>
              <h1>{entity.title}</h1>
              <p className="detail-summary">{entity.summary}</p>
              {entity.links.length ? (
                <ul className="detail-actions" aria-label="External destinations">
                  {entity.links.map((link) => (
                    <li key={`${link.kind}-${link.url}`}>
                      <a href={link.url} target="_blank" rel="noreferrer">
                        {link.label} <span aria-hidden="true">↗</span>
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <DetailRegister entity={entity} />
          </div>
        </PageContainer>
      </header>

      {entity.hero ? (
        <PublicSection className="detail-hero-media" aria-label="Lead media">
          <PageContainer>
            <PublicImage media={entity.hero} priority />
          </PageContainer>
        </PublicSection>
      ) : null}

      {lineage.length ? (
        <RelationshipSection title="Product lineage" relationships={lineage} />
      ) : null}

      {entity.type === 'lab' ? <LabProgress entity={entity} /> : null}

      {entity.type === 'blueprint' ? <BlueprintSpecification entity={entity} /> : null}

      {entity.documents.map((document) => {
        const label =
          entity.type === 'work' && document.role === 'caseStudy'
            ? { eyebrow: 'Case study / engineering record', title: 'Context to consequence' }
            : entity.type === 'blueprint' && document.role === 'caseStudy'
              ? {
                  eyebrow: 'Documentation / implementation reference',
                  title: 'Implementation guidance',
                }
              : (DOCUMENT_LABELS[document.role] ?? {
                  eyebrow: 'Document',
                  title: formatMetadata(document.role),
                });
        const sectionId = `document-${document.role}`;
        return (
          <PublicSection
            key={document.role}
            className="detail-document"
            aria-labelledby={sectionId}
          >
            <PageContainer className="detail-document-grid">
              <header>
                <p className="home-eyebrow">{label.eyebrow}</p>
                <h2 id={sectionId}>{label.title}</h2>
                {document.outline?.length && document.outline.length > 1 ? (
                  <nav aria-label={`${label.title} contents`} className="detail-outline">
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
              <ProseRenderer document={document} headingOffset={1} />
            </PageContainer>
          </PublicSection>
        );
      })}

      {'gallery' in entity && entity.gallery.length ? (
        <PublicSection className="detail-gallery" aria-labelledby="detail-gallery-title">
          <PageContainer>
            <header className="detail-section-header">
              <p className="home-eyebrow">Media / evidence</p>
              <h2 id="detail-gallery-title">Recorded views</h2>
            </header>
            <div className="detail-gallery-grid">
              {entity.gallery.map((media) => (
                <PublicImage key={media.url} media={media} />
              ))}
            </div>
          </PageContainer>
        </PublicSection>
      ) : null}

      {entity.type === 'blueprint' && entity.previewMedia.length ? (
        <PublicSection className="detail-gallery" aria-labelledby="blueprint-preview-title">
          <PageContainer>
            <header className="detail-section-header">
              <p className="home-eyebrow">Implementation / recorded views</p>
              <h2 id="blueprint-preview-title">Preview the system</h2>
            </header>
            <div className="detail-gallery-grid">
              {entity.previewMedia.map((media) => (
                <PublicImage key={media.url} media={media} />
              ))}
            </div>
          </PageContainer>
        </PublicSection>
      ) : null}

      {entity.type === 'work' && workRelationshipGroups.length ? (
        <GroupedRelationshipSection
          title="Continue through the engineering record"
          groups={workRelationshipGroups}
        />
      ) : null}

      {entity.type === 'blueprint' && blueprintRelationshipGroups.length ? (
        <GroupedRelationshipSection
          title="Evidence and connected systems"
          groups={blueprintRelationshipGroups}
        />
      ) : null}

      {entity.type === 'build' && buildRelationshipGroups.length ? (
        <GroupedRelationshipSection
          title="Continue through the engineering record"
          groups={buildRelationshipGroups}
        />
      ) : null}

      {entity.type === 'lab' && labRelationshipGroups.length ? (
        <GroupedRelationshipSection
          title="Continue through the engineering record"
          groups={labRelationshipGroups}
        />
      ) : null}

      <footer className="detail-footer">
        <PageContainer className="detail-footer-grid">
          <div>
            <p className="home-eyebrow">Publication record</p>
            <p>
              {entity.referenceId} / {formatMetadata(entity.state ?? entity.type)}
            </p>
          </div>
          <Link href={collectionHref}>
            Return to {collection} <span aria-hidden="true">→</span>
          </Link>
        </PageContainer>
      </footer>
    </main>
  );
}

function DetailRegister({ entity }: { entity: ImmutablePublic<CollectionDetail> }) {
  const values =
    entity.type === 'work'
      ? [
          ['Reference', entity.referenceId],
          ['Client', entity.clientType],
          ['Timeline', entity.timeline],
          ['HubZero role', entity.hubZeroRole],
        ]
      : entity.type === 'build'
        ? [
            ['Reference', entity.referenceId],
            ['State', formatMetadata(entity.deploymentState)],
            [
              'Technology',
              entity.technologies.length ? `${entity.technologies.length} listed` : 'Not listed',
            ],
          ]
        : entity.type === 'blueprint'
          ? [
              ['Reference', entity.referenceId],
              ['Version', `v${entity.version}`],
              ['Architecture', entity.architecture],
              ['Design language', entity.designLanguage],
            ]
          : [
              ['Reference', entity.referenceId],
              ['Stage', formatMetadata(entity.stage)],
              ['Started', formatPublicDate(entity.startDate)],
              [
                'Updated',
                entity.lastMajorUpdate
                  ? formatPublicDate(entity.lastMajorUpdate)
                  : 'No major update listed',
              ],
            ];
  const contributors = entity.relationships.filter(
    (relationship) => relationship.kind === 'teamContributedToEntry',
  );
  return (
    <aside className="detail-register" aria-label={`${entity.title} publication metadata`}>
      <dl>
        {values.map(([term, value]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <TechnologyList technologies={entity.technologies} />
      {entity.type === 'work' ? (
        <TechnologyList technologies={entity.categories} label="Categories" />
      ) : null}
      <ContributorList contributors={contributors} />
    </aside>
  );
}

function BlueprintSpecification({ entity }: { entity: ImmutablePublic<BlueprintDetail> }) {
  return (
    <PublicSection
      className="detail-progress blueprint-specification"
      aria-labelledby="blueprint-specification-title"
    >
      <PageContainer>
        <header className="detail-section-header">
          <p className="home-eyebrow">System specification / v{entity.version}</p>
          <h2 id="blueprint-specification-title">What is designed to be reused</h2>
        </header>
        <dl className="blueprint-system-register">
          <div>
            <dt>Information architecture</dt>
            <dd>{entity.architecture}</dd>
          </div>
          <div>
            <dt>Design language</dt>
            <dd>{entity.designLanguage}</dd>
          </div>
          <div>
            <dt>Revision</dt>
            <dd>Version {entity.version}</dd>
          </div>
        </dl>
        {entity.features.length ? <BlueprintFeatureList features={entity.features} /> : null}
      </PageContainer>
    </PublicSection>
  );
}

function LabProgress({ entity }: { entity: ImmutablePublic<LabDetail> }) {
  return (
    <PublicSection className="detail-progress" aria-labelledby="detail-progress-title">
      <PageContainer>
        <header className="detail-section-header">
          <p className="home-eyebrow">Current state / {formatMetadata(entity.stage)}</p>
          <h2 id="detail-progress-title">What the investigation is moving toward</h2>
        </header>
        <div className="detail-progress-grid">
          <section>
            <h3>Research direction</h3>
            <p>{entity.researchDirection}</p>
          </section>
          <section>
            <h3>Current milestone</h3>
            <p>{entity.currentMilestone}</p>
          </section>
          <section>
            <h3>Graduation criteria</h3>
            <p>{entity.graduationCriteria}</p>
          </section>
        </div>
        {entity.milestones.length ? (
          <ol className="detail-milestones" aria-label="Lab milestones">
            {entity.milestones.map((milestone) => (
              <li key={`${milestone.date}-${milestone.title}`}>
                <time dateTime={milestone.date}>{formatPublicDate(milestone.date)}</time>
                <h3>{milestone.title}</h3>
                <p>{milestone.summary}</p>
              </li>
            ))}
          </ol>
        ) : null}
      </PageContainer>
    </PublicSection>
  );
}

function RelationshipSection({
  title,
  relationships,
}: {
  title: string;
  relationships: readonly ImmutablePublic<PublicRelationship>[];
}) {
  return (
    <PublicSection className="detail-relations" aria-labelledby={`relations-${slugify(title)}`}>
      <PageContainer className="detail-relations-grid">
        <header>
          <p className="home-eyebrow">Relationships / typed links</p>
          <h2 id={`relations-${slugify(title)}`}>{title}</h2>
        </header>
        <div className="home-relationships" aria-label={title}>
          {relationships.map((relationship) => (
            <RelationshipCard
              key={relationshipKey(relationship)}
              relationship={relationship}
              enabled={PUBLIC_ENTITY_ROUTES[relationship.target.type]}
            />
          ))}
        </div>
      </PageContainer>
    </PublicSection>
  );
}

function GroupedRelationshipSection({
  title,
  groups,
}: {
  title: string;
  groups: Array<{
    title: string;
    relationships: readonly ImmutablePublic<PublicRelationship>[];
  }>;
}) {
  return (
    <PublicSection className="detail-relations" aria-labelledby="grouped-connections-title">
      <PageContainer className="detail-relations-grid">
        <header>
          <p className="home-eyebrow">Relationships / typed links</p>
          <h2 id="grouped-connections-title">{title}</h2>
        </header>
        <div className="detail-relation-groups">
          {groups.map((group) => (
            <section key={group.title} className="detail-relation-group">
              <h3>{group.title}</h3>
              <div className="home-relationships" aria-label={group.title}>
                {group.relationships.map((relationship) => (
                  <RelationshipCard
                    key={relationshipKey(relationship)}
                    relationship={relationship}
                    enabled={PUBLIC_ENTITY_ROUTES[relationship.target.type]}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </PageContainer>
    </PublicSection>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replaceAll(' ', '-');
}
