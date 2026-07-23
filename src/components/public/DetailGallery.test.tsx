import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PublicMedia } from '@/lib/public/domain';
import { DetailGallery } from './DetailGallery';

function media(url: string): PublicMedia {
  return {
    url,
    width: 1600,
    height: 1000,
    alt: 'Screenshot',
    role: 'gallery',
    responsive: { srcSet: '', sizes: '' },
    placeholder: { kind: 'color', value: '#141414' },
  };
}

describe('DetailGallery', () => {
  it('renders nothing when there is no media', () => {
    const markup = renderToStaticMarkup(
      <DetailGallery
        id="detail-gallery-title"
        eyebrow="Media / evidence"
        title="Recorded views"
        media={[]}
        sectionClassName="detail-gallery"
      />,
    );

    expect(markup).toBe('');
  });

  it('renders the shared heading with the caller-supplied section class', () => {
    const markup = renderToStaticMarkup(
      <DetailGallery
        id="blueprint-preview-title"
        eyebrow="Implementation / recorded views"
        title="Preview the system"
        media={[media('/media/one.png')]}
        sectionClassName="detail-gallery"
      />,
    );

    expect(markup).toContain('class="public-section detail-gallery"');
    expect(markup).toContain('<header class="detail-section-header">');
    expect(markup).toContain('Preview the system');
  });

  it('defaults the grid class to detail-gallery-grid but allows overriding it', () => {
    const withDefault = renderToStaticMarkup(
      <DetailGallery
        id="note-gallery-title"
        eyebrow="Supporting media / recorded evidence"
        title="Views from the work"
        media={[media('/media/one.png')]}
        sectionClassName="note-gallery"
      />,
    );
    const withOverride = renderToStaticMarkup(
      <DetailGallery
        id="note-gallery-title"
        eyebrow="Supporting media / recorded evidence"
        title="Views from the work"
        media={[media('/media/one.png')]}
        sectionClassName="note-gallery"
        gridClassName="custom-grid"
      />,
    );

    expect(withDefault).toContain('class="detail-gallery-grid"');
    expect(withOverride).toContain('class="custom-grid"');
  });
});
