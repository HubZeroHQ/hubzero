import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PublicHomepageProjection } from '@/lib/public/domain';
import { Homepage } from './Homepage';

const emptyProjection: PublicHomepageProjection = {
  work: [],
  builds: [],
  labs: [],
  notes: [],
  profiles: [],
};

describe('Homepage', () => {
  it('keeps the complete narrative rhythm without rendering empty content chapters', () => {
    const markup = renderToStaticMarkup(<Homepage projection={emptyProjection} />);

    expect(markup).toContain('<main id="main-content"');
    expect(markup).toContain('<h1 id="home-title"');
    expect(markup).toContain('Four divisions. One body of');
    expect(markup).toContain('Bring the problem, not a prepared solution.');
    expect(markup).not.toContain('Featured Labs');
    expect(markup).not.toContain('Featured Notes');
    expect(markup).not.toContain('Products / shipped');
  });

  it('uses one h1 and preserves ordered pillar headings', () => {
    const markup = renderToStaticMarkup(<Homepage projection={emptyProjection} />);

    expect(markup.match(/<h1/g)).toHaveLength(1);
    expect(markup.indexOf('Labs')).toBeLessThan(markup.indexOf('Builds'));
    expect(markup.indexOf('Builds')).toBeLessThan(markup.indexOf('Work'));
    expect(markup.indexOf('Work')).toBeLessThan(markup.indexOf('Blueprints'));
  });
});
