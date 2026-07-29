import Link from 'next/link';
import { PUBLIC_CAREERS } from '@/config/public-site';
import type { ImmutablePublic, PublicCareerSummary } from '@/lib/public/domain';
import { CareerInterestForm } from './CareerInterestForm';
import { PageContainer, PublicSection } from '../PageContainer';
import { PublicEmptyState, TechnologyList } from '../EditorialPrimitives';

const EMPLOYMENT_TYPE_LABEL: Record<PublicCareerSummary['employmentType'], string> = {
  fullTime: 'Full-time',
  partTime: 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
};

const EXPERIENCE_LEVEL_LABEL: Record<PublicCareerSummary['experienceLevel'], string> = {
  entry: 'Entry',
  mid: 'Mid',
  senior: 'Senior',
  lead: 'Lead',
};

/**
 * Careers is a permanent Company destination (Experience v3 Careers
 * milestone) — the hiring-philosophy copy above the listing renders
 * regardless of how many roles are currently open, and the "no openings"
 * state is an honest explanation plus the same interest form every listing
 * page offers, never a hidden or blank page.
 */
export function Careers({
  openings,
}: {
  openings: readonly ImmutablePublic<PublicCareerSummary>[];
}) {
  return (
    <main id="main-content" tabIndex={-1} className="collection-main about-main">
      <header className="about-hero">
        <PageContainer className="about-hero-grid">
          <div className="about-hero-copy">
            <p className="home-eyebrow">{PUBLIC_CAREERS.eyebrow}</p>
            <h1>
              {PUBLIC_CAREERS.title.lead} <em>{PUBLIC_CAREERS.title.emphasis}</em>{' '}
              {PUBLIC_CAREERS.title.close}
            </h1>
            <p>{PUBLIC_CAREERS.introduction}</p>
          </div>
          <dl className="about-register" aria-label="Careers overview">
            <div>
              <dt>Open roles</dt>
              <dd>{openings.length}</dd>
            </div>
            <div>
              <dt>Review</dt>
              <dd>Every submission read by a person</dd>
            </div>
          </dl>
        </PageContainer>
      </header>

      <PublicSection className="about-principles" aria-labelledby="careers-approach-title">
        <PageContainer>
          <header className="about-section-heading about-section-heading-wide">
            <p className="home-eyebrow">Approach / before you apply</p>
            <h2 id="careers-approach-title">What to expect before you apply.</h2>
          </header>
          <div className="about-principle-grid">
            {PUBLIC_CAREERS.approach.map((item) => (
              <article key={item.label}>
                <p className="home-eyebrow">{item.label}</p>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </PageContainer>
      </PublicSection>

      <PublicSection className="collection-index" aria-labelledby="careers-openings-title">
        <PageContainer>
          <header className="collection-index-header">
            <p className="home-eyebrow">Collection / published Studio records</p>
            <h2 id="careers-openings-title">Current openings</h2>
            {openings.length ? (
              <p>
                {openings.length} open {openings.length === 1 ? 'role' : 'roles'}.
              </p>
            ) : null}
          </header>

          {openings.length ? (
            <ol className="collection-list" aria-label="Open roles">
              {openings.map((career) => (
                <li key={career.url}>
                  <article className="collection-row">
                    <div className="collection-row-body">
                      <dl className="home-metadata" aria-label={`${career.title} metadata`}>
                        <div>
                          <dt className="sr-only">Reference</dt>
                          <dd>{career.referenceId}</dd>
                        </div>
                        <div>
                          <dt className="sr-only">Location</dt>
                          <dd>{career.location}</dd>
                        </div>
                        <div>
                          <dt className="sr-only">Employment type</dt>
                          <dd>{EMPLOYMENT_TYPE_LABEL[career.employmentType]}</dd>
                        </div>
                        <div>
                          <dt className="sr-only">Experience level</dt>
                          <dd>{EXPERIENCE_LEVEL_LABEL[career.experienceLevel]}</dd>
                        </div>
                      </dl>
                      <Link href={career.url} className="collection-row-title">
                        <h3>{career.title}</h3>
                        <span aria-hidden="true">→</span>
                      </Link>
                      <p className="collection-row-summary">{career.summary}</p>
                      <TechnologyList technologies={career.technologies} />
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          ) : (
            <PublicEmptyState
              id="careers-empty-title"
              eyebrow="Openings / none right now"
              title={PUBLIC_CAREERS.noOpeningsTitle}
            >
              {PUBLIC_CAREERS.noOpeningsBody}
            </PublicEmptyState>
          )}
        </PageContainer>
      </PublicSection>

      <PublicSection className="careers-interest" aria-labelledby="careers-interest-title">
        <PageContainer className="careers-interest-grid">
          <div>
            <p className="home-eyebrow">Introduce yourself</p>
            <h2 id="careers-interest-title">No listing fits yet? Say hello anyway.</h2>
            <p>
              Submissions are reviewed as new work opens up — this is read by a person, not filed
              away.
            </p>
          </div>
          <CareerInterestForm startedAt={Date.now()} />
        </PageContainer>
      </PublicSection>
    </main>
  );
}
