/**
 * Development-only bootstrap for a Head Admin Studio account.
 *
 * There is no in-app way to create a Studio user yet (Settings → Users,
 * PLANNING.md §26.9/§29, is still a `CollectionPlaceholder`), so a local
 * developer has no route to a first session. This script exists solely to
 * fill that gap for local manual verification — it is never imported by any
 * page, API route, or Server Action, so it ships no HTTP-reachable surface;
 * it only runs when a developer invokes it directly from a terminal.
 *
 * Safety:
 * - Refuses to run unless `NODE_ENV` is `development` (or unset, which is
 *   treated as the local-shell default) — any other value, most importantly
 *   `production`, is a hard refusal.
 * - Never bypasses the app's own validation or writes to MongoDB directly —
 *   it goes through `userRepository` (`lib/db/repositories/user.ts`), the
 *   same Zod-validated (`lib/validation/user.ts`) path every other Studio
 *   mutation uses, and hashes the password with the app's own
 *   `hashPassword` (`lib/auth/password.ts`, bcrypt) — the identical
 *   authentication flow `providers/credentials.ts` checks against.
 * - Idempotent: re-running with the same email updates that user's name/
 *   password/role in place rather than creating a duplicate account.
 *
 * Usage:
 *   npm run bootstrap:dev-admin -- --email you@example.com --password "…" [--name "…"]
 * or via env vars:
 *   DEV_ADMIN_EMAIL=you@example.com DEV_ADMIN_PASSWORD="…" npm run bootstrap:dev-admin
 */
import { hashPassword } from '@/lib/auth/password';
import { userRepository } from '@/lib/db/repositories/user';

function readArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index !== -1 ? process.argv[index + 1] : undefined;
}

async function main(): Promise<void> {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  if (nodeEnv !== 'development') {
    console.error(
      `Refusing to run: NODE_ENV is "${nodeEnv}", not "development". This bootstrap utility is a local development tool only and must never run in production.`,
    );
    process.exit(1);
  }

  const email = readArg('--email') ?? process.env.DEV_ADMIN_EMAIL;
  const password = readArg('--password') ?? process.env.DEV_ADMIN_PASSWORD;
  const name = readArg('--name') ?? process.env.DEV_ADMIN_NAME ?? 'Local Development Admin';

  if (!email || !password) {
    console.error(
      'Usage: npm run bootstrap:dev-admin -- --email you@example.com --password "…" [--name "…"]\n' +
        'Or set DEV_ADMIN_EMAIL / DEV_ADMIN_PASSWORD / DEV_ADMIN_NAME.',
    );
    process.exit(1);
  }
  if (password.length < 12) {
    console.error('Password must be at least 12 characters.');
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const existing = await userRepository.findByEmail(email.trim().toLowerCase());

  if (existing) {
    await userRepository.update(existing._id.toString(), {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'headAdmin',
      passwordHash,
    });
    console.log(`Updated existing Head Admin: ${email} (${existing._id.toString()})`);
  } else {
    const created = await userRepository.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'headAdmin',
      passwordHash,
    });
    console.log(`Created Head Admin: ${email} (${created._id.toString()})`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error('Bootstrap failed:', error);
  process.exit(1);
});
