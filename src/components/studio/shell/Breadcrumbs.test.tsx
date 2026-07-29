import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { getBreadcrumbItems } from '@/lib/studio/navigation';
import { Breadcrumbs } from './Breadcrumbs';

describe('Breadcrumbs', () => {
  it('renders semantic non-page ancestors as text and valid ancestors as links', () => {
    const markup = renderToStaticMarkup(
      <Breadcrumbs items={getBreadcrumbItems('/studio/content/builds/entry-1/edit')} />,
    );

    expect(markup).toContain('<span class="text-text-primary">Content</span>');
    expect(markup).not.toContain('href="/studio/content"');
    expect(markup).toContain('href="/studio/content/builds"');
    expect(markup).toContain('href="/studio/content/builds/entry-1"');
    expect(markup).toContain('aria-current="page">Edit</span>');
  });
});
