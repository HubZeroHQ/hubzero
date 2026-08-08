import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PublicDocument } from '@/lib/public/domain';
import { ProseRenderer } from './ProseRenderer';

describe('ProseRenderer rich text sanitization', () => {
  it('removes executable attributes and unsafe URI schemes', () => {
    const document = {
      role: 'body',
      blocks: [
        {
          id: 'rich',
          type: 'richText',
          data: {
            html: [
              '<p onclick="alert(1)">Safe copy</p>',
              '<a href="javascript:alert(1)" action="javascript:alert(2)" formaction="javascript:alert(3)">Unsafe</a>',
              '<a href="https://example.com">Safe link</a>',
            ].join(''),
          },
        },
      ],
    } as unknown as PublicDocument;

    const markup = renderToStaticMarkup(<ProseRenderer document={document} />);

    expect(markup).toContain('Safe copy');
    expect(markup).toContain('href="https://example.com"');
    expect(markup).not.toContain('javascript:');
    expect(markup).not.toContain('onclick=');
    expect(markup).not.toContain('action=');
    expect(markup).not.toContain('formaction=');
  });
});
