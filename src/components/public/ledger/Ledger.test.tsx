import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PublicLabSummary, PublicNoteSummary } from '@/lib/public/domain';
import { buildLedger } from '@/lib/public/ledger-projection';
import { Ledger } from './Ledger';

function note(title: string, publicationDate: string): PublicNoteSummary {
  return {
    type: 'note',
    title,
    slug: title,
    url: `/notes/${title}`,
    summary: 'A note.',
    referenceId: `NT-${title}`,
    publicationDate,
    author: { kind: 'organization', name: 'HubZero', url: '/about' },
    technologies: [],
  };
}

function lab(title: string, startDate: string, lastMajorUpdate?: string): PublicLabSummary {
  return {
    type: 'lab',
    title,
    slug: title,
    url: `/labs/${title}`,
    summary: 'A lab.',
    referenceId: `LB-${title}`,
    stage: 'exploring',
    researchDirection: 'Direction.',
    currentMilestone: 'Milestone.',
    startDate,
    ...(lastMajorUpdate ? { lastMajorUpdate } : {}),
    links: [],
    technologies: [],
  };
}

describe('Ledger', () => {
  it('renders an editorial empty state without fabricating entries', () => {
    const markup = renderToStaticMarkup(<Ledger entries={[]} />);

    expect(markup).toContain('The ledger begins with a published record.');
    expect(markup).toContain('Ledger / no eligible entries');
    expect(markup).not.toContain('<ol class="home-ledger">');
  });

  it('groups mixed Note and Lab entries under descending year headings, newest first', () => {
    const entries = buildLedger([
      note('2026 note', '2026-05-01T00:00:00.000Z'),
      lab('2026 lab', '2020-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
      note('2025 note', '2025-11-01T00:00:00.000Z'),
    ]);
    const markup = renderToStaticMarkup(<Ledger entries={entries} />);

    expect(markup).toContain('<h3 id="ledger-year-2026" class="home-subsection-title">2026</h3>');
    expect(markup).toContain('<h3 id="ledger-year-2025" class="home-subsection-title">2025</h3>');
    expect(markup.indexOf('2026</h3>')).toBeLessThan(markup.indexOf('2025</h3>'));
    expect(markup.indexOf('2026 note')).toBeLessThan(markup.indexOf('2026 lab'));
    expect(markup.indexOf('2026 lab')).toBeLessThan(markup.indexOf('2025 note'));
  });

  it('renders one semantic, keyboard-linear ordered list per year, matching document order', () => {
    const entries = buildLedger([
      note('Alpha', '2026-01-01T00:00:00.000Z'),
      note('Beta', '2026-02-01T00:00:00.000Z'),
    ]);
    const markup = renderToStaticMarkup(<Ledger entries={entries} />);

    expect(markup.match(/<ol class="home-ledger">/g)).toHaveLength(1);
    expect(markup).toContain('href="/notes/Beta"');
    expect(markup).toContain('href="/notes/Alpha"');
  });

  it('reports the real entry and year counts in the header register', () => {
    const entries = buildLedger([
      note('2026 note', '2026-05-01T00:00:00.000Z'),
      note('2025 note', '2025-11-01T00:00:00.000Z'),
    ]);
    const markup = renderToStaticMarkup(<Ledger entries={entries} />);

    expect(markup).toContain('<dt>Entries</dt><dd>2</dd>');
    expect(markup).toContain('<dt>Years</dt><dd>2</dd>');
  });
});
