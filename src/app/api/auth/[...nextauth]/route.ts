import { handlers } from "@/lib/cms/auth";

/**
 * Auth.js's own required Route Handler (`ARCHITECTURE/19_CMS_FOUNDATION.md`
 * §4) — the one legitimate Route Handler this phase introduces beyond the
 * existing "webhooks/RSS only" rule (`ARCHITECTURE/08_TECHNICAL_ARCHITECTURE.md`
 * §2), since Auth.js's sign-in/callback/session endpoints are a genuine
 * external-callback shape, not ordinary form submission.
 */
export const { GET, POST } = handlers;
