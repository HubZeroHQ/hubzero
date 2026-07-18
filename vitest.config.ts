import path from 'node:path';
import { defineConfig } from 'vitest/config';

/**
 * Pure-logic coverage only (no React rendering, no jsdom) — the Document
 * Engine's editing behavior (`lib/documents/*`) is deliberately implemented
 * as plain functions over `Block[]` precisely so it's testable without a
 * DOM or a component harness. UI coverage stays manual/browser-verified per
 * the repo's existing conventions; this config exists to unit-test the
 * logic, not to introduce a full component-testing setup.
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
    include: ['src/**/*.test.ts'],
  },
});
