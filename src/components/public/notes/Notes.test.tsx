import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type {
  PublicEntityDetail,
  PublicNoteIndexEntry,
  PublicNoteSummary,
} from '@/lib/public/domain';
import { NoteDetail } from './NoteDetail';
import { NotesIndex } from './NotesIndex';

const summary: PublicNoteSummary = {
  type: 'note',
  title: 'Cache invalidation needs an ownership model',
  slug: 'cache-invalidation-ownership',
  url: '/notes/cache-invalidation-ownership',
  referenceId: 'HZ-NT-101',
  summary: 'Why invalidation becomes predictable only after dependencies have explicit owners.',
  publicationDate: '2026-07-18T00:00:00.000Z',
  state: '2026-07-18T00:00:00.000Z',
  author: { kind: 'organization', name: 'HubZero', url: '/about' },
  technologies: [{ kind: 'technology', label: 'Next.js', slug: 'nextjs' }],
};

describe('public Notes experience', () => {
  it('renders an editorial empty state without fabricating articles', () => {
    const markup = renderToStaticMarkup(<NotesIndex entries={[]} />);
    expect(markup).toContain('Small records of consequential decisions.');
    expect(markup).toContain('Journal / no eligible entries');
    expect(markup).not.toContain(summary.title);
  });

  it('renders chronological journal rows with metadata, technologies, and relationships', () => {
    const entry: PublicNoteIndexEntry = {
      note: summary,
      relationships: [
        {
          kind: 'noteDiscussesArtifact',
          label: 'Discusses',
          target: { type: 'build', title: 'Release Ledger', url: '/builds/release-ledger' },
        },
      ],
    };
    const markup = renderToStaticMarkup(<NotesIndex entries={[entry]} />);
    expect(markup).toContain('Chronology / newest first');
    expect(markup).toContain('dateTime="2026-07-18T00:00:00.000Z"');
    expect(markup).toContain('HZ-NT-101 / HubZero');
    expect(markup).toContain('Next.js');
    expect(markup).toContain('href="/builds/release-ledger"');
  });

  it('renders one semantic article with a readable body, references, and typed continuation', () => {
    const detail: Extract<PublicEntityDetail, { type: 'note' }> = {
      ...summary,
      readingTimeMinutes: 4,
      documents: [
        {
          role: 'body',
          outline: [{ id: 'ownership', level: 2, text: 'Ownership before invalidation' }],
          blocks: [
            {
              id: 'ownership',
              type: 'heading',
              data: { level: 2, text: 'Ownership before invalidation' },
            },
            {
              id: 'reasoning',
              type: 'paragraph',
              data: {
                text: 'A cache key is useful only when its dependency boundary is explicit.',
              },
            },
            {
              id: 'reference',
              type: 'fileAttachment',
              data: { url: 'https://example.com/decision.pdf', fileName: 'Decision record.pdf' },
            },
          ],
        },
      ],
      gallery: [],
      relationships: [
        {
          kind: 'noteDiscussesArtifact',
          label: 'Discusses',
          target: { type: 'work', title: 'Release review', url: '/work/release-review' },
        },
        {
          kind: 'teamContributedToEntry',
          label: 'Engineering contributor',
          target: {
            type: 'engineeringProfile',
            title: 'Public Engineer',
            url: '/engineering/public-engineer',
            role: 'Backend Engineer',
          },
        },
      ],
    };
    const markup = renderToStaticMarkup(<NoteDetail note={detail} />);
    expect(markup.match(/<article/g)).toHaveLength(1);
    expect(markup).toContain('<h1>Cache invalidation needs an ownership model</h1>');
    expect(markup).toContain('<h3 id="ownership">Ownership before invalidation</h3>');
    expect(markup).toContain('4 min');
    expect(markup).toContain('Decision record.pdf');
    expect(markup).toContain('Related Work');
    expect(markup).toContain('Attribution / engineering profile');
    expect(markup).toContain('Return to Notes');

    // Contributors render as publication metadata, before the write-up body.
    expect(markup).toContain('Contributors');
    expect(markup).toContain('Public Engineer');
    expect(markup).toContain('Backend Engineer');
    expect(markup.indexOf('Contributors')).toBeLessThan(
      markup.indexOf('Ownership before invalidation'),
    );
  });
});
