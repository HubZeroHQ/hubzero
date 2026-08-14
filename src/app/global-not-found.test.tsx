import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import GlobalNotFound, { metadata } from './global-not-found';

vi.mock('@/app/root-document', () => ({
  RootDocument: ({ children }: { children: React.ReactNode }) => (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  ),
}));
vi.mock('@/components/public/PublicShell', () => ({
  PublicShell: ({ children }: { children: React.ReactNode }) => (
    <div className="public-shell">{children}</div>
  ),
}));

describe('global unmatched-route document', () => {
  it('is a complete accessible HubZero 404 without canonical or manual robots metadata', () => {
    const markup = renderToStaticMarkup(<GlobalNotFound />);
    expect(markup).toContain('<html lang="en">');
    expect(markup).toContain('<main id="main-content"');
    expect(markup).toContain('<h1>This page is not available.</h1>');
    expect(markup).toContain('class="public-shell"');
    expect(metadata).toMatchObject({ title: 'Page not found — HubZero' });
    expect(metadata).not.toHaveProperty('alternates');
    expect(metadata).not.toHaveProperty('robots');
  });
});
