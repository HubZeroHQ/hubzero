import { z } from "zod";

/**
 * The one password-strength rule, shared by `scripts/create-admin.ts` (the
 * disaster-recovery bootstrap path) and the Studio Users screen (the normal
 * path) — `docs/operations/ADMIN_BOOTSTRAP.md` documents this same number,
 * so it must stay in sync with this constant rather than be restated.
 */
export const PASSWORD_MIN_LENGTH = 12;

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);

/** `bcryptjs`'s cost factor — `ARCHITECTURE/19_CMS_FOUNDATION.md` §2 already settles on 12 for this threat model. */
export const PASSWORD_HASH_COST = 12;
