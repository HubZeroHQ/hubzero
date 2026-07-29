import Link from 'next/link';
import type { ImmutablePublic, PublicEntityDetail } from '@/lib/public/domain';
import { publicRoute } from '@/lib/public/routes';
import {
  DetailSectionHeading,
  groupRelationshipsByType,
  PublicBreadcrumbs,
  TechnologyList,
} from '../EditorialPrimitives';
import { EvidenceGraph, EvidenceGraphFocusSync } from '../evidence-graph';
import { PageContainer, PublicSection } from '../PageContainer';
import { ProseRenderer } from '../ProseRenderer';
import { RelatedRecordsSection } from '../RelatedRecordsSection';
import { CareerInterestForm } from './CareerInterestForm';

type Career = Extract<PublicEntityDetail, { type: 'career' }>;

const EMPLOYMENT_TYPE_LABEL: Record<Career['employmentType'], string> = {
  fullTime: 'Full-time',
  partTime: 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
};

const EXPERIENCE_LEVEL_LABEL: Record<Career['experienceLevel'], string> = {
  entry: 'Entry',
  mid: 'Mid',
  senior: 'Senior',
  lead: 'Lead',
};

const RELATIONSHIP_GROUPS = [
  { type: 'work', title: 'Related Work' },
  { type: 'build', title: 'Related Builds' },
  { type: 'lab', title: 'Related Labs' },
  { type: 'note', title: 'Related Notes' },
] as const;

export function CareerDetail({ career }: { career: ImmutablePublic<Career> }) {
  const overview = career.documents.find((document) => document.role === 'overview');
  const groups = groupRelationshipsByType(career.relationships, RELATIONSHIP_GROUPS);
  /**
   * Excludes the hiring-manager credit — shown separately in the register
   * aside above — so the graph and its adjacent `groups` list describe the
   * same relationships (mirrors `PublicCollectionDetail.tsx`'s `connected`).
   */
  const graphRelationships = career.relationships.filter(
    (relationship) => relationship.kind !== 'careerHiringManager',
  );

  return (
    <main id="main-content" tabIndex={-1} className="collection-main detail-main">
      <header className="detail-hero">
        <PageContainer>
          <PublicBreadcrumbs
            items={[
              { label: 'HubZero', href: publicRoute.home() },
              { label: 'Careers', href: publicRoute.collection('career') },
              { label: career.title },
            ]}
          />
          <div className="detail-hero-grid">
            <div className="detail-title-block">
              <p className="home-eyebrow">Career / open role</p>
              <h1>{career.title}</h1>
              <p className="detail-summary">{career.summary}</p>
            </div>
            <aside className="detail-register" aria-label={`${career.title} role details`}>
              <dl>
                <div>
                  <dt>Reference</dt>
                  <dd>{career.referenceId}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{career.location}</dd>
                </div>
                <div>
                  <dt>Employment type</dt>
                  <dd>{EMPLOYMENT_TYPE_LABEL[career.employmentType]}</dd>
                </div>
                <div>
                  <dt>Experience level</dt>
                  <dd>{EXPERIENCE_LEVEL_LABEL[career.experienceLevel]}</dd>
                </div>
                {career.compensation ? (
                  <div>
                    <dt>Compensation</dt>
                    <dd>{career.compensation}</dd>
                  </div>
                ) : null}
              </dl>
              <TechnologyList technologies={career.technologies} />
              {career.hiringManager ? (
                <div className="detail-register-contributors">
                  <p className="home-eyebrow">Hiring manager</p>
                  <p>{career.hiringManager.title}</p>
                </div>
              ) : null}
            </aside>
          </div>
        </PageContainer>
      </header>

      <PublicSection className="detail-document" aria-labelledby="career-requirements-title">
        <PageContainer className="detail-document-grid">
          <DetailSectionHeading
            id="career-requirements-title"
            eyebrow="Role / what this involves"
            title="Responsibilities, requirements, and benefits"
          />
          <div className="detail-progress-grid">
            <CareerList title="Responsibilities" items={career.responsibilities} />
            <CareerList title="Requirements" items={career.requirements} />
            <CareerList title="Benefits" items={career.benefits} />
          </div>
        </PageContainer>
      </PublicSection>

      <PublicSection className="detail-document" aria-labelledby="career-apply-title">
        <PageContainer className="detail-document-grid">
          <DetailSectionHeading
            id="career-apply-title"
            eyebrow="Application / how to apply"
            title="How to apply"
          />
          <p className="detail-summary">{career.applicationProcess}</p>
        </PageContainer>
      </PublicSection>

      {overview ? (
        <PublicSection className="detail-document" aria-labelledby="career-overview-title">
          <PageContainer className="detail-document-grid">
            <DetailSectionHeading
              id="career-overview-title"
              eyebrow="Overview / the role in full"
              title="Overview"
            />
            <ProseRenderer document={overview} headingOffset={1} />
          </PageContainer>
        </PublicSection>
      ) : null}

      {groups.length ? (
        <EvidenceGraphFocusSync>
          <RelatedRecordsSection
            id="career-relations-title"
            eyebrow="Evidence / what this role touches"
            title="The engineering this role connects to"
            description="Each link is a real, publicly recorded relationship — the kind of work this role would actually touch."
            headerContent={
              <EvidenceGraph
                subject={{ label: career.title, meta: 'Career' }}
                relationships={graphRelationships}
              />
            }
            groups={groups}
            sectionClassName="detail-relations"
            containerClassName="detail-relations-grid"
          />
        </EvidenceGraphFocusSync>
      ) : null}

      <PublicSection className="careers-interest" aria-labelledby="career-interest-title">
        <PageContainer className="careers-interest-grid">
          <div>
            <p className="home-eyebrow">Interested in this role</p>
            <h2 id="career-interest-title">Introduce yourself for this role.</h2>
            <p>Reviewed by a person, linked directly to this listing.</p>
          </div>
          <CareerInterestForm careerSlug={career.slug} startedAt={Date.now()} />
        </PageContainer>
      </PublicSection>

      <footer className="detail-footer">
        <PageContainer className="detail-footer-grid">
          <div>
            <p className="home-eyebrow">Publication record</p>
            <p>{career.referenceId}</p>
          </div>
          <Link href={publicRoute.collection('career')}>
            Return to Careers <span aria-hidden="true">→</span>
          </Link>
        </PageContainer>
      </footer>
    </main>
  );
}

function CareerList({ title, items }: { title: string; items: readonly string[] }) {
  if (!items.length) return null;
  return (
    <section>
      <h3>{title}</h3>
      <ul className="career-detail-list">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
