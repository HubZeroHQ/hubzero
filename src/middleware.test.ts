import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-auth', () => ({
  default: () => ({ auth: (handler: unknown) => handler }),
}));

import { config } from './middleware';

describe('middleware boundary', () => {
  it('matches only Studio routes', () => {
    expect(config.matcher).toEqual(['/studio/:path*', '/api/studio/:path*']);
  });

  it('never imports the public data layer or its cache APIs', () => {
    const source = readFileSync(new URL('./middleware.ts', import.meta.url), 'utf8');

    expect(source).not.toMatch(/(?:from|import\()\s*['"]@\/lib\/public\//);
    expect(source).not.toMatch(/import\s*\{\s*unstable_cache\s*\}/);
    expect(source).not.toContain('getPublicDetail');
  });
});
