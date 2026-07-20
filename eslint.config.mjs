import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    // `.claude/worktrees/**` holds other agent sessions' full nested repo
    // checkouts (their own `.next/`, `node_modules/`, etc.) — without this,
    // `eslint .` also lints their build output as if it were this repo's
    // own source, which is both wrong and enormously noisy.
    ignores: ['client/**', '.next/**', 'node_modules/**', 'next-env.d.ts', '.claude/**'],
  },
];

export default eslintConfig;
