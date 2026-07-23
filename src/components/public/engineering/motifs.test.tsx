import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { FounderMotifId } from '@/config/founder-identity';
import { FounderMotif } from './motifs';

const ALL_MOTIFS: readonly FounderMotifId[] = [
  'network',
  'dependencyGraph',
  'traveler',
  'editorialGrid',
  'pcbTrace',
];

const SIX_TECHNOLOGIES = Array.from({ length: 6 }, (_, index) => ({
  label: `Technology ${index + 1}`,
}));

/**
 * Regression coverage for the `PathBuilder`/`AssembleStroke` extraction
 * (see `../motion/assemble`) — every assertion here describes behavior
 * `motifs.tsx` already had before the extraction. Nothing here should ever
 * need to change just because the drawing mechanism moved to a shared
 * module.
 */
describe('FounderMotif', () => {
  it.each(ALL_MOTIFS)('renders %s as an accessible, correctly framed diagram', (motif) => {
    const markup = renderToStaticMarkup(
      <FounderMotif
        motif={motif}
        technologies={SIX_TECHNOLOGIES}
        description="A diagram description"
      />,
    );

    expect(markup).toContain('role="img"');
    expect(markup).toContain('aria-label="A diagram description"');
    expect(markup).toContain('viewBox="0 0 520 200"');
    expect(markup).toContain(`class="founder-motif founder-motif-${motif}"`);
    expect(markup).toMatch(/<path class="founder-motif-trace[^"]*" d="M [^"]+"/);
  });

  it('renders a genuinely different diagram per motif at the same technology count', () => {
    const renders = ALL_MOTIFS.map((motif) =>
      renderToStaticMarkup(
        <FounderMotif motif={motif} technologies={SIX_TECHNOLOGIES} description="Diagram" />,
      ),
    );

    expect(new Set(renders).size).toBe(ALL_MOTIFS.length);
  });

  it.each(ALL_MOTIFS)(
    '%s responds to technology count instead of rendering a fixed diagram',
    (motif) => {
      const withOne = renderToStaticMarkup(
        <FounderMotif
          motif={motif}
          technologies={SIX_TECHNOLOGIES.slice(0, 1)}
          description="Diagram"
        />,
      );
      const withSix = renderToStaticMarkup(
        <FounderMotif motif={motif} technologies={SIX_TECHNOLOGIES} description="Diagram" />,
      );

      expect(withOne).not.toBe(withSix);
    },
  );

  it('caps node count at six technologies rather than growing without bound', () => {
    const tenTechnologies = Array.from({ length: 10 }, (_, index) => ({
      label: `Technology ${index + 1}`,
    }));
    const withTen = renderToStaticMarkup(
      <FounderMotif motif="network" technologies={tenTechnologies} description="Diagram" />,
    );
    const withSix = renderToStaticMarkup(
      <FounderMotif motif="network" technologies={SIX_TECHNOLOGIES} description="Diagram" />,
    );

    expect(withTen).toBe(withSix);
  });

  it('renders nothing when there are no technologies to diagram', () => {
    const markup = renderToStaticMarkup(
      <FounderMotif motif="network" technologies={[]} description="Diagram" />,
    );

    expect(markup).toBe('');
  });

  it('renders identically across repeated calls with the same props (no hidden randomness)', () => {
    const first = renderToStaticMarkup(
      <FounderMotif motif="pcbTrace" technologies={SIX_TECHNOLOGIES} description="Diagram" />,
    );
    const second = renderToStaticMarkup(
      <FounderMotif motif="pcbTrace" technologies={SIX_TECHNOLOGIES} description="Diagram" />,
    );

    expect(first).toBe(second);
  });

  it('appends a supplied className and switches preserveAspectRatio when edge-anchored', () => {
    const markup = renderToStaticMarkup(
      <FounderMotif
        motif="traveler"
        technologies={SIX_TECHNOLOGIES}
        description="Diagram"
        className="founder-motif-mini"
        edgeAnchored
      />,
    );

    expect(markup).toContain('class="founder-motif founder-motif-traveler founder-motif-mini"');
    expect(markup).toContain('preserveAspectRatio="xMaxYMid slice"');
  });
});
