import { z } from 'zod';

/**
 * Every env var the app depends on, validated once at module load instead of
 * failing with an obscure error deep inside whichever module first reads
 * `process.env`. Server-only secrets live here, never in a `NEXT_PUBLIC_*` var.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required'),
  AUTH_TRUST_HOST: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
  GEMINI_API_KEY: z.string().optional(),
  AI_PROVIDER_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(120_000).default(30_000),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type PublicEnv = z.infer<typeof publicEnvSchema>;

let cachedServerEnv: ServerEnv | undefined;

/**
 * Lazily validated so importing this module never triggers a connection or a
 * crash — only calling `serverEnv()` does. Safe to import from shared code
 * that also runs in contexts (like `next build`'s client bundle analysis)
 * where server secrets aren't relevant yet.
 */
export function serverEnv(): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error(
      'serverEnv() was called from client code. Server secrets must never reach the browser.',
    );
  }

  if (!cachedServerEnv) {
    cachedServerEnv = serverEnvSchema.parse(process.env);
  }

  return cachedServerEnv;
}

export function publicEnv(): PublicEnv {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });
}
