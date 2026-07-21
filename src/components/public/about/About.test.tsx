import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PublicMedia, PublicTeamMemberSummary } from '@/lib/public/domain';
import { About } from './About';

const portrait: PublicMedia = {
  url: 'https://example.com/portrait.jpg',
  width: 900,
  height: 1200,
  alt: 'Portrait of Ari Rao',
  role: 'portrait',
  responsive: { srcSet: '', sizes: '' },
  placeholder: { kind: 'color', value: '#141414' },
};

describe('public About experience', () => {
  it('keeps the operating model complete when no public Team records exist', () => {
    const markup = renderToStaticMarkup(<About team={[]} profiles={[]} />);
    expect(markup).toContain('Engineering is a');
    expect(markup).toContain('Ideas move by evidence, not ceremony.');
    expect(markup).toContain('Investigate');
    expect(markup).toContain('Ship');
    expect(markup).toContain('Apply');
    expect(markup).toContain('Generalise');
    expect(markup).toContain('Roster / no approved public records');
  });

  it('omits a Leadership record with no real portrait rather than showing a placeholder identity', () => {
    const member: PublicTeamMemberSummary = {
      type: 'teamMember',
      title: 'Ari Rao',
      url: '/about',
      summary: 'Builds systems around explicit ownership.',
      role: 'Systems engineer',
      group: 'Engineering',
      publicCategory: 'leadership',
      founder: false,
      technologies: [],
    };
    const markup = renderToStaticMarkup(<About team={[member]} profiles={[]} />);
    expect(markup).not.toContain('Ari Rao');
    expect(markup).toContain('Roster / no approved public records');
  });

  it('renders a photographed Leadership identity and withholds an ineligible Profile link', () => {
    const member: PublicTeamMemberSummary = {
      type: 'teamMember',
      title: 'Ari Rao',
      url: '/about',
      summary: 'Builds systems around explicit ownership.',
      role: 'Systems engineer',
      group: 'Engineering',
      publicCategory: 'leadership',
      founder: false,
      technologies: [],
      portrait,
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

  it('renders Engineering Team members as compact cards, without a portrait or profile link', () => {
    const member: PublicTeamMemberSummary = {
      type: 'teamMember',
      title: 'Sam Okafor',
      url: '/about',
      summary: 'Ships the platform edges nobody else sees.',
      role: 'Backend Engineer',
      group: 'Engineering Team',
      publicCategory: 'team',
      founder: false,
      technologies: [],
      joinedAt: '2025-03-01T00:00:00.000Z',
    };
    const markup = renderToStaticMarkup(<About team={[member]} profiles={[]} />);
    expect(markup).toContain('Sam Okafor');
    expect(markup).toContain('Backend Engineer');
    expect(markup).toContain('Joined');
    expect(markup).not.toContain('Engineering Team / no approved public records');
  });

  it('shows the Engineering Team empty state independently of Leadership', () => {
    const markup = renderToStaticMarkup(<About team={[]} profiles={[]} />);
    expect(markup).toContain('Roster / no approved public records');
    expect(markup).toContain('Engineering Team / no approved public records');
  });
});
