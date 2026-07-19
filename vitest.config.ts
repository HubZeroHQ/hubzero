import path from 'node:path';
import { defineConfig } from 'vitest/config';

/**
 * `environment: 'node'`, not jsdom — the Document Engine's editing behavior
 * (`lib/documents/*`) is deliberately implemented as plain functions over
 * `Block[]` precisely so it's testable without a DOM or a component
 * harness. Public component tests (`**\/*.test.tsx`) render through
 * `react-dom/server`'s `renderToStaticMarkup`, which needs no DOM either,
 * so they run under this same `node` environment rather than requiring a
 * separate jsdom-based config. `include` covers both extensions — a
 * narrower `*.test.ts`-only pattern previously left every `.test.tsx` file
 * unrun by `npm test` silently.
 */
export default defineConfig({
  oxc: {
    jsx: { runtime: 'automatic' },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
