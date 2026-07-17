import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function filesUnder(root: string): string[] {
  return readdirSync(root).flatMap((name) => {
    const path = join(root, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

describe('public consumer boundary', () => {
  it('prevents public routes and components from importing Studio persistence', () => {
    const roots = [
      join(process.cwd(), 'src', 'app', '(public)'),
      join(process.cwd(), 'src', 'components', 'public'),
      join(process.cwd(), 'src', 'lib', 'public', 'discovery'),
    ];
    const forbidden = [
      '@/types/studio',
      '@/lib/db/',
      "from 'mongodb'",
      '@/lib/public/source',
      '@/lib/public/mongodb-source',
    ];
    const files = [
      ...roots.flatMap(filesUnder),
      join(process.cwd(), 'src', 'app', 'robots.ts'),
      join(process.cwd(), 'src', 'app', 'sitemap.ts'),
    ];
    const violations = files.flatMap((file) => {
      const content = readFileSync(file, 'utf8');
      return forbidden
        .filter((pattern) => content.includes(pattern))
        .map((pattern) => `${file}: ${pattern}`);
    });
    expect(violations).toEqual([]);
  });

  it('keeps the shared accessibility and reduced-motion primitives wired into the shell', () => {
    const components = join(process.cwd(), 'src', 'components', 'public');
    const shell = readFileSync(join(components, 'PublicShell.tsx'), 'utf8');
    const skipLink = readFileSync(join(components, 'SkipLink.tsx'), 'utf8');
    const routeEffects = readFileSync(join(components, 'PublicRouteEffects.tsx'), 'utf8');
    const styles = readFileSync(join(process.cwd(), 'src', 'app', 'globals.css'), 'utf8');

    expect(shell).toContain('<SkipLink />');
    expect(shell).toContain('<PublicNavigation />');
    expect(shell).toContain('<PublicFooter />');
    expect(skipLink).toContain('href="#main-content"');
    expect(skipLink).toContain('focus:top-3');
    expect(routeEffects).toContain("document.getElementById('main-content')");
    expect(routeEffects).toContain('main?.focus({ preventScroll: true })');
    expect(routeEffects).toContain('aria-live="polite"');
    expect(styles).toContain(':focus-visible');
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)');
    expect(styles).toContain('transition-duration: 0.01ms !important');
    expect(styles).toContain('animation: none');
  });

  it('keeps public media sizing and placeholders in the rendering boundary', () => {
    const image = readFileSync(
      join(process.cwd(), 'src', 'components', 'public', 'PublicImage.tsx'),
      'utf8',
    );
    expect(image).toContain('backgroundColor: media.placeholder.value');
    expect(image).toContain('width={media.width}');
    expect(image).toContain('height={media.height}');
    expect(image).toContain('sizes={media.responsive.sizes}');
  });
});
