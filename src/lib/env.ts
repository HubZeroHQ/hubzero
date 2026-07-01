import { z } from "zod";

/**
 * Validated at module load, so a misconfigured environment fails fast at
 * build/boot time instead of surfacing as a runtime bug in production.
 * Extend this schema as new server/client env vars are introduced
 * (database URI, auth secret, etc. — see ARCHITECTURE/14_IMPLEMENTATION_ROADMAP.md Phase 0/1).
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});
