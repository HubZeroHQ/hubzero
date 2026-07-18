import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PublicBlueprintSummary, PublicEntityDetail } from '@/lib/public/domain';
import { PublicCollectionDetail } from './PublicCollectionDetail';
import { PublicCollectionIndex } from './PublicCollectionIndex';

const summary: PublicBlueprintSummary = {
  type: 'blueprint',
  title: 'Blueprint-SaaS-Editorial',
  slug: 'blueprint-saas-editorial',
  url: '/blueprints/blueprint-saas-editorial',
  referenceId: 'HZ-BP-101',
  summary: 'A reusable foundation for product-led software documentation.',
  architecture: 'SaaS',
  designLanguage: 'Editorial',
  version: '1.2.0',
  state: '1.2.0',
  technologies: [{ kind: 'technology', label: 'Next.js', slug: 'nextjs' }],
  links: [{ kind: 'live', label: 'Open live preview', url: 'https://example.com/preview' }],
  previewMedia: [],
};

describe('Blueprint public collection', () => {
  it('renders a truthful editorial empty state without fabricated records', () => {
    const markup = renderToStaticMarkup(
      createElement(PublicCollectionIndex, { type: 'blueprint', entries: [] }),
    );

    expect(markup).toContain('Engineering foundations made reusable.');
    expect(markup).toContain('Public record / no eligible entries');
    expect(markup).not.toContain(summary.title);
  });

  it('preserves Blueprint architecture and design-language labels verbatim', () => {
    const markup = renderToStaticMarkup(
      createElement(PublicCollectionIndex, { type: 'blueprint', entries: [summary] }),
    );

    expect(markup).toContain('<dd>SaaS</dd>');
    expect(markup).not.toContain('Saa S');
    expect(markup).toContain('v1.2.0');
  });

  it('renders a versioned reusable system with documentation and typed attribution', () => {
    const detail: Extract<PublicEntityDetail, { type: 'blueprint' }> = {
      ...summary,
      features: ['Composable documentation routes', 'Visibility-safe content adapters'],
      documents: [
        {
          role: 'caseStudy',
          outline: [{ id: 'adoption', level: 2, text: 'Adoption' }],
          blocks: [
            { id: 'adoption', type: 'heading', data: { level: 2, text: 'Adoption' } },
            {
              id: 'guidance',
              type: 'paragraph',
              data: { text: 'Start with the information model before composing a visual layer.' },
            },
          ],
        },
      ],
      relationships: [
        {
          kind: 'artifactUsesBlueprint',
          label: 'Proven in',
          target: { type: 'work', title: 'Public evidence', url: '/work/public-evidence' },
        },
        {
          kind: 'profileFeaturesEvidence',
          label: 'Selected work',
          target: {
            type: 'engineeringProfile',
            title: 'Public Engineer',
            url: '/engineering/public-engineer',
          },
        },
      ],
    };
    const markup = renderToStaticMarkup(createElement(PublicCollectionDetail, { entity: detail }));

    expect(markup).toContain('Blueprint / reusable engineering asset');
    expect(markup).toContain('What is designed to be reused');
    expect(markup).toContain('Version 1.2.0');
    expect(markup).toContain('Composable documentation routes');
    expect(markup).toContain('Implementation guidance');
    expect(markup).toContain('Proven in client work');
    expect(markup).toContain('Engineering attribution');
    expect(markup).toContain('Return to Blueprints');
  });
});
