import { z } from "zod";

/**
 * Validated at module load, so a misconfigured environment fails fast at
 * build/boot time instead of surfacing as a runtime bug in production.
 *
 * Convention (per `ARCHITECTURE/19_CMS_FOUNDATION.md` §12): not every env var
 * belongs here. Two tiers exist —
 *   - **Always-validated (this file):** vars every request path touches
 *     regardless of which page/route is hit — `AUTH_SECRET` is read by
 *     middleware on every `/studio/**` request, so it belongs here.
 *   - **Lazily-read-where-used (e.g. `MONGODB_URI` in `src/lib/db.ts`):**
 *     vars only load-bearing for code paths that actually touch that
 *     resource. `MONGODB_URI` deliberately stays out of this schema so pages
 *     that never touch the database still build without a live URI — see
 *     `db.ts`'s own comment. Don't move it here "for consistency"; that
 *     would reintroduce the exact coupling this split avoids.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  AUTH_SECRET: z
    .string()
    .min(32, "AUTH_SECRET must be at least 32 characters — generate one with `npx auth secret`."),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
});
