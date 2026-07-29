import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PublicEntityDetail } from '@/lib/public/domain';
import { CareerDetail } from './CareerDetail';

describe('public Career detail', () => {
  it('renders role details, hiring manager credit, and grouped evidence with a matching graph', () => {
    const detail: Extract<PublicEntityDetail, { type: 'career' }> = {
      type: 'career',
      title: 'Senior Backend Engineer',
      slug: 'senior-backend-engineer',
      url: '/careers/senior-backend-engineer',
      referenceId: 'HZ-CR-101',
      summary: 'Own the evidence pipeline that public collections and search both depend on.',
      location: 'Remote',
      employmentType: 'fullTime',
      experienceLevel: 'senior',
      technologies: [{ kind: 'technology', label: 'TypeScript', slug: 'typescript' }],
      documents: [],
      responsibilities: ['Own the relationship projection pipeline.'],
      requirements: ['Experience with public data modeling.'],
      benefits: ['Remote-first.'],
      applicationProcess: 'Apply with a resume and a short note on relevant work.',
      hiringManager: { type: 'teamMember', title: 'Public Engineer', url: '/about' },
      relationships: [
        {
          kind: 'careerHiringManager',
          label: 'Hiring manager',
          target: { type: 'teamMember', title: 'Public Engineer', url: '/about' },
        },
        {
          kind: 'careerRelatesArtifact',
          label: 'Related Build',
          target: { type: 'build', title: 'Release Ledger', url: '/builds/release-ledger' },
        },
      ],
    };
    const markup = renderToStaticMarkup(<CareerDetail career={detail} />);

    expect(markup).toContain('<h1>Senior Backend Engineer</h1>');
    expect(markup).toContain('Hiring manager');
    expect(markup).toContain('Public Engineer');
    expect(markup).toContain('Related Builds');
    expect(markup).toContain('href="/builds/release-ledger"');
    expect(markup).toContain('class="evidence-graph"');

    // Milestone 4 (Relationship Integrity): the hiring-manager credit is
    // shown in the register aside, never re-drawn as an evidence-graph node
    // — the graph's own aria-label must not mention it, while a genuinely
    // graph-worthy relationship still does.
    const graphAriaLabel = markup.match(
      /class="evidence-graph" role="img" aria-label="([^"]*)"/,
    )?.[1];
    expect(graphAriaLabel).toBeDefined();
    expect(graphAriaLabel).not.toContain('Public Engineer');
    expect(graphAriaLabel).toContain('Release Ledger');
  });

  it('omits the relationship section entirely when a role has no evidence beyond its hiring manager', () => {
    const detail: Extract<PublicEntityDetail, { type: 'career' }> = {
      type: 'career',
      title: 'Founding Engineer',
      slug: 'founding-engineer',
      url: '/careers/founding-engineer',
      referenceId: 'HZ-CR-102',
      summary: 'A generalist role for the earliest stage of the platform.',
      location: 'Remote',
      employmentType: 'fullTime',
      experienceLevel: 'lead',
      technologies: [],
      documents: [],
      responsibilities: ['Ship across the stack.'],
      requirements: ['Comfort with ambiguity.'],
      benefits: ['Equity.'],
      applicationProcess: 'Apply with a portfolio.',
      relationships: [],
    };
    const markup = renderToStaticMarkup(<CareerDetail career={detail} />);

    expect(markup).not.toContain('class="evidence-graph"');
    expect(markup).not.toContain('The engineering this role connects to');
  });
});
