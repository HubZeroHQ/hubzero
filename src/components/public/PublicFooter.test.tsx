import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PUBLIC_NAVIGATION } from '@/config/public-site';
import { PublicFooter } from './PublicFooter';

describe('PublicFooter', () => {
  it('lists the full content record — including Notes and Ledger, which primary navigation no longer carries', () => {
    const markup = renderToStaticMarkup(<PublicFooter />);
    const recordNav = markup.split('aria-label="Record"')[1]?.split('</nav>')[0] ?? '';

    expect(recordNav).toContain('href="/work"');
    expect(recordNav).toContain('href="/builds"');
    expect(recordNav).toContain('href="/blueprints"');
    expect(recordNav).toContain('href="/labs"');
    expect(recordNav).toContain('href="/notes"');
    expect(recordNav).toContain('href="/ledger"');
    expect(recordNav).toContain('>Ledger<');
  });

  it('groups About, Engineering, Services, Careers, and Contact under Company, separate from the content record', () => {
    const markup = renderToStaticMarkup(<PublicFooter />);
    const companyNav = markup.split('aria-label="Company"')[1]?.split('</nav>')[0] ?? '';

    expect(companyNav).toContain('href="/about"');
    expect(companyNav).toContain('href="/engineering"');
    expect(companyNav).toContain('href="/services"');
    expect(companyNav).toContain('>Services<');
    expect(companyNav).toContain('href="/careers"');
    expect(companyNav).toContain('>Careers<');
    expect(companyNav).toContain('>Contact<');
    expect(companyNav).not.toContain('href="/work"');
    expect(companyNav).not.toContain('href="/ledger"');
  });

  it('lists Search under Resources, and never a GitHub or Studio entry with nothing real behind it', () => {
    const markup = renderToStaticMarkup(<PublicFooter />);
    const resourcesNav = markup.split('aria-label="Resources"')[1]?.split('</nav>')[0] ?? '';

    expect(resourcesNav).toContain('href="/search"');
    expect(markup).not.toContain('>GitHub<');
    expect(markup).not.toContain('>Status<');
    expect(markup).not.toContain('>Documentation<');
  });

  it('omits RSS while the feed is not released', () => {
    const markup = renderToStaticMarkup(<PublicFooter />);

    expect(markup).not.toContain('feed.xml');
  });

  it('never renders a disabled navigation entry', () => {
    const markup = renderToStaticMarkup(<PublicFooter />);

    for (const item of PUBLIC_NAVIGATION) {
      if (!item.enabled) expect(markup).not.toContain(`href="${item.href}"`);
    }
  });

  it('links to the Privacy policy from the copyright line', () => {
    const markup = renderToStaticMarkup(<PublicFooter />);

    expect(markup).toContain('href="/privacy"');
    expect(markup).toContain('>Privacy<');
  });
});
