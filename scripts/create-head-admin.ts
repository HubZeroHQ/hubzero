/**
 * Creates (or updates) a real, production Head Admin Studio account.
 *
 * Unlike `bootstrap-dev-admin.ts`, this script is meant to run against a
 * real deployment — there's no `NODE_ENV=development` refusal here, since
 * there's no other way to create the first real account today (Settings →
 * Users, PLANNING.md §26.9/§29, requires being signed in as Head Admin
 * already). Because of that, it carries its own explicit confirmation gate
 * instead: it does nothing until you pass BOTH `--execute` and
 * `--yes-i-am-sure-this-is-correct`. Without them, it only validates the
 * arguments and prints what it would do.
 *
 * This script is never invoked automatically by the app, a build step, or
 * an agent — you run it yourself, with your own real email and password.
 *
 * Safety:
 * - Never bypasses the app's own validation or writes to MongoDB directly —
 *   goes through `userRepository` (Zod-validated) the same as every other
 *   Studio mutation, and hashes the password with the app's own
 *   `hashPassword` (bcrypt).
 * - Idempotent: re-running with the same email updates that user's name/
 *   password/role in place rather than creating a duplicate account.
 * - Refuses a password under 12 characters, same floor Users management's
 *   own create/reset-password forms enforce.
 *
 * Usage:
 *   npm run create:head-admin -- --email you@example.com --password "…" --name "…" --execute --yes-i-am-sure-this-is-correct
 *
 * Omit `--execute --yes-i-am-sure-this-is-correct` to dry-run: the script
 * validates everything and reports what it would create/update, without
 * writing anything.
 */
import { hashPassword } from '@/lib/auth/password';
import { userRepository } from '@/lib/db/repositories/user';

function readArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index !== -1 ? process.argv[index + 1] : undefined;
}
function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

async function main(): Promise<void> {
  const email = readArg('--email')?.trim().toLowerCase();
  const password = readArg('--password');
  const name = readArg('--name') ?? 'Head Admin';
  const execute = hasFlag('--execute') && hasFlag('--yes-i-am-sure-this-is-correct');

  if (!email || !password) {
    console.error(
      'Usage: npm run create:head-admin -- --email you@example.com --password "…" [--name "…"] --execute --yes-i-am-sure-this-is-correct',
    );
    process.exit(1);
  }
  if (password.length < 12) {
    console.error('Password must be at least 12 characters.');
    process.exit(1);
  }

  const existing = await userRepository.findByEmail(email);
  console.log(
    existing
      ? `Would update existing user: ${email} (${existing._id.toString()}) — role -> headAdmin, password reset, re-enabled.`
      : `Would create new Head Admin: ${email} (${name}).`,
  );

  if (!execute) {
    console.log(
      '\nDry run only — nothing was written. Re-run with --execute --yes-i-am-sure-this-is-correct to apply.',
    );
    process.exit(0);
  }

  const passwordHash = await hashPassword(password);

  if (existing) {
    await userRepository.update(existing._id.toString(), {
      name: name.trim(),
      email,
      role: 'headAdmin',
      passwordHash,
      disabled: false,
      mustChangePassword: false,
    });
    console.log(`Updated existing Head Admin: ${email} (${existing._id.toString()})`);
  } else {
    const created = await userRepository.create({
      name: name.trim(),
      email,
      role: 'headAdmin',
      passwordHash,
      disabled: false,
      mustChangePassword: false,
    });
    console.log(`Created Head Admin: ${email} (${created._id.toString()})`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error('create-head-admin failed:', error);
  process.exit(1);
});
