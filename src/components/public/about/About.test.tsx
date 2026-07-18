import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PublicTeamMemberSummary } from '@/lib/public/domain';
import { About } from './About';

describe('public About experience', () => {
  it('keeps the operating model complete when no public Team records exist', () => {
    const markup = renderToStaticMarkup(<About team={[]} profiles={[]} />);
    expect(markup).toContain('Engineering is a');
    expect(markup).toContain('Ideas move by evidence, not ceremony.');
    expect(markup).toContain('Investigate');
    expect(markup).toContain('Ship');
    expect(markup).toContain('Apply');
    expect(markup).toContain('Generalize');
    expect(markup).toContain('Roster / no approved public records');
  });

  it('renders only approved Team identity and withholds an ineligible Profile link', () => {
    const member: PublicTeamMemberSummary = {
      type: 'teamMember',
      title: 'Ari Rao',
      url: '/about',
      summary: 'Builds systems around explicit ownership.',
      role: 'Systems engineer',
      group: 'Engineering',
      technologies: [],
      profile: {
        type: 'engineeringProfile',
        title: 'Ari Rao',
        url: '/engineering/ari-rao',
      },
    };
    const markup = renderToStaticMarkup(<About team={[member]} profiles={[]} />);
    expect(markup).toContain('Ari Rao');
    expect(markup).toContain('Systems engineer');
    expect(markup).not.toContain('href="/engineering/ari-rao"');
  });
});
