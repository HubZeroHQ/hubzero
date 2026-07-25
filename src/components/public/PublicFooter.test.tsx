import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PublicFooter } from './PublicFooter';

describe('PublicFooter', () => {
  it('surfaces every enabled content collection, including Engineering and Ledger, in the Record section', () => {
    const markup = renderToStaticMarkup(<PublicFooter />);
    const recordNav = markup.split('aria-label="Public record"')[1]?.split('</nav>')[0] ?? '';

    expect(recordNav).toContain('href="/work"');
    expect(recordNav).toContain('href="/builds"');
    expect(recordNav).toContain('href="/blueprints"');
    expect(recordNav).toContain('href="/labs"');
    expect(recordNav).toContain('href="/notes"');
    expect(recordNav).toContain('href="/engineering"');
    expect(recordNav).toContain('>Engineering<');
    expect(recordNav).toContain('href="/ledger"');
    expect(recordNav).toContain('>Ledger<');
  });

  it('keeps About in the Studio section, separate from the content collections', () => {
    const markup = renderToStaticMarkup(<PublicFooter />);
    const studioNav = markup.split('aria-label="Studio"')[1]?.split('</nav>')[0] ?? '';

    expect(studioNav).toContain('href="/about"');
    expect(studioNav).not.toContain('href="/engineering"');
    expect(studioNav).not.toContain('href="/ledger"');
  });

  it('never renders a disabled navigation entry (Services, today)', () => {
    const markup = renderToStaticMarkup(<PublicFooter />);

    expect(markup).not.toContain('href="/services"');
  });
});
