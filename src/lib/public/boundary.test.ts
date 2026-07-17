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
    ];
    const forbidden = [
      '@/types/studio',
      '@/lib/db/',
      "from 'mongodb'",
      '@/lib/public/source',
      '@/lib/public/mongodb-source',
    ];
    const violations = roots.flatMap(filesUnder).flatMap((file) => {
      const content = readFileSync(file, 'utf8');
      return forbidden
        .filter((pattern) => content.includes(pattern))
        .map((pattern) => `${file}: ${pattern}`);
    });
    expect(violations).toEqual([]);
  });
});
