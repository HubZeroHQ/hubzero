import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AssembleStroke, PathBuilder } from './assemble';

describe('PathBuilder', () => {
  it('tracks length across horizontal and vertical moves', () => {
    const builder = new PathBuilder().moveTo(0, 0).h(10).v(4);

    expect(builder.length).toBe(14);
    expect(builder.d).toBe('M 0 0 H 10 V 4 ');
  });

  it('tracks length for a diagonal lineTo', () => {
    const builder = new PathBuilder().moveTo(0, 0).lineTo(3, 4);

    expect(builder.length).toBe(5);
  });

  it('tracks length for a curveTo across all three control-point segments', () => {
    const builder = new PathBuilder().moveTo(0, 0).curveTo(0, 10, 10, 10, 10, 0);

    expect(builder.length).toBeCloseTo(30, 5);
    expect(builder.d).toContain('C 0 10, 10 10, 10 0');
  });

  it('chamfers a horizontal-then-vertical move rather than stair-stepping', () => {
    const builder = new PathBuilder().moveTo(0, 0).hv(20, 20, 6);

    // Horizontal run shortened by the chamfer, a diagonal miter, then the remaining vertical run.
    expect(builder.d).toContain('H 14 ');
    expect(builder.d).toContain('L 20 6 ');
    expect(builder.d).toContain('V 20 ');
  });

  it('clamps the chamfer to half the available distance rather than overshooting the corner', () => {
    const builder = new PathBuilder().moveTo(0, 0).hv(1, 1, 6);

    // Requested chamfer (6) is far larger than the 1x1 move, so it's clamped to 0.5 each side.
    expect(builder.d).toBe('M 0 0 H 0.5 L 1 0.5 V 1 ');
  });

  it('falls back to a square corner when the move is too small to chamfer at all', () => {
    const builder = new PathBuilder().moveTo(0, 0).hv(0.01, 0.01, 6);

    expect(builder.d).toBe('M 0 0 H 0.01 V 0.01 ');
  });
});

describe('AssembleStroke', () => {
  it('renders a path whose dasharray/dashoffset equal the builder length plus two', () => {
    const builder = new PathBuilder().moveTo(0, 0).h(50);
    const markup = renderToStaticMarkup(<AssembleStroke builder={builder} seed={0} />);

    expect(markup).toContain('class="founder-motif-trace"');
    expect(markup).toContain('stroke-dasharray="52"');
    expect(markup).toContain('stroke-dashoffset="52"');
    expect(markup).toContain('d="M 0 0 H 50 "');
  });

  it('appends a supplied className alongside the base class', () => {
    const builder = new PathBuilder().moveTo(0, 0).h(10);
    const markup = renderToStaticMarkup(
      <AssembleStroke builder={builder} seed={0} className="founder-motif-bus" />,
    );

    expect(markup).toContain('class="founder-motif-trace founder-motif-bus"');
  });

  it('gives every stroke a positive dash length even for a zero-length path', () => {
    const builder = new PathBuilder().moveTo(0, 0);
    const markup = renderToStaticMarkup(<AssembleStroke builder={builder} seed={0} />);

    expect(markup).toContain('stroke-dasharray="3"');
  });

  it('derives delay and duration from the seed deterministically', () => {
    const builder = new PathBuilder().moveTo(0, 0).h(10);
    const first = renderToStaticMarkup(<AssembleStroke builder={builder} seed={3} />);
    const second = renderToStaticMarkup(<AssembleStroke builder={builder} seed={3} />);
    const differentSeed = renderToStaticMarkup(<AssembleStroke builder={builder} seed={7} />);

    expect(first).toBe(second);
    expect(first).not.toBe(differentSeed);
  });
});
