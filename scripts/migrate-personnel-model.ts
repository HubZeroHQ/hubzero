/**
 * Migrates existing data to the personnel & authorization model:
 * - `User.role` value `'teamMember'` (legacy) -> `'member'`.
 * - Optionally assigns Head Admin / Admin to named accounts, via
 *   `--head-admin-email` / `--admin-emails` — never guessed from data.
 * - Backfills `Team.publicCategory` (`'leadership'` if `founder` was true or
 *   `group` was `'Founders'`, else `'team'`) and `Team.engineeringProfileEligible`
 *   (`true` for anyone already carrying a published Engineering Profile, or
 *   already backfilled `publicCategory: 'leadership'`) for any Team document
 *   missing either field. `founder` itself is never touched.
 * - Translates every Work/Build/Blueprint/Lab/Note document's legacy
 *   `contributorProfileIds` (-> EngineeringProfile) into the new
 *   `contributors` field (-> Team), resolved via each profile's
 *   `teamMemberId`, then drops the legacy field. Any profile id that fails
 *   to resolve is logged as orphaned rather than silently dropped.
 *
 * Like `create-head-admin.ts`, this is a real-deployment script with no
 * `NODE_ENV` guard — it carries its own explicit confirmation gate instead:
 * it does nothing until you pass BOTH `--execute` and
 * `--yes-i-am-sure-this-is-correct`. Without them, it only reports what it
 * would change.
 *
 * Never bypasses the app's own repositories/collections layer or writes
 * outside the fields this migration owns.
 *
 * IMPORTANT — public cache: the public site caches `listPublicSummaries`/
 * `findDetail`/etc. results via Next.js's `unstable_cache` (`lib/public/
 * queries.ts`), invalidated only by `revalidateTag`/`revalidatePath` calls
 * from *within* a running request (`lib/public/cache.ts`'s
 * `invalidatePublicEntity`, called by Studio's own Server Actions after
 * every mutation). This script writes via the raw MongoDB driver, outside
 * any request context, so it CANNOT call those APIs — any already-running
 * app instance keeps serving whatever it last cached (per collection,
 * indefinitely, until that instance restarts or someone calls the
 * revalidation APIs some other way). After running this with `--execute`,
 * restart (or redeploy) every running instance of the app — including your
 * own local `next dev` — or the About page / contributor attribution will
 * keep rendering pre-migration data even though the database is correct.
 *
 * Usage (dry run):
 *   npm run migrate:personnel-model
 * Usage (apply, optionally assigning the first Head Admin/Admins):
 *   npm run migrate:personnel-model -- \
 *     --head-admin-email you@example.com \
 *     --admin-emails other-founder@example.com,another@example.com \
 *     --execute --yes-i-am-sure-this-is-correct
 */
import { collections } from '@/lib/db/collections';
import type { UserRole } from '@/types/studio';

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}
function readArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index !== -1 ? process.argv[index + 1] : undefined;
}

async function migrateUserRoles(execute: boolean): Promise<void> {
  const usersCollection = await collections.users();
  const users = await usersCollection.find({}).toArray();
  const legacy = users.filter((user) => (user.role as string) === 'teamMember');
  console.log(`\nUsers with legacy role 'teamMember': ${legacy.length}`);
  for (const user of legacy) {
    console.log(`  - ${user.email} -> role: 'member'`);
    if (execute) {
      await usersCollection.updateOne({ _id: user._id }, { $set: { role: 'member' as UserRole } });
    }
  }
}

async function assignNamedRoles(execute: boolean): Promise<void> {
  const headAdminEmail = readArg('--head-admin-email')?.trim().toLowerCase();
  const adminEmails = (readArg('--admin-emails') ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (!headAdminEmail && adminEmails.length === 0) return;

  const usersCollection = await collections.users();
  console.log('\nNamed role assignments:');

  if (headAdminEmail) {
    const user = await usersCollection.findOne({ email: headAdminEmail });
    if (!user) {
      console.warn(`  ! --head-admin-email ${headAdminEmail} not found among Users — skipping.`);
    } else if (user.role === 'headAdmin') {
      console.log(`  - ${headAdminEmail} already headAdmin.`);
    } else {
      console.log(`  - ${headAdminEmail}: ${user.role} -> headAdmin`);
      if (execute) {
        await usersCollection.updateOne({ _id: user._id }, { $set: { role: 'headAdmin' } });
      }
    }
  }

  for (const email of adminEmails) {
    const user = await usersCollection.findOne({ email });
    if (!user) {
      console.warn(`  ! --admin-emails entry ${email} not found among Users — skipping.`);
      continue;
    }
    if (user.role === 'headAdmin') {
      console.log(`  - ${email} is headAdmin — leaving as-is (not downgrading).`);
      continue;
    }
    if (user.role === 'admin') {
      console.log(`  - ${email} already admin.`);
      continue;
    }
    console.log(`  - ${email}: ${user.role} -> admin`);
    if (execute) {
      await usersCollection.updateOne({ _id: user._id }, { $set: { role: 'admin' } });
    }
  }
}

async function backfillTeamFields(execute: boolean): Promise<Set<string>> {
  const teamCollection = await collections.team();
  const profilesCollection = await collections.engineeringProfiles();
  const teamDocs = await teamCollection.find({}).toArray();
  const profiles = await profilesCollection.find({}).toArray();
  const teamIdsWithProfile = new Set(profiles.map((profile) => String(profile.teamMemberId)));

  console.log(`\nTeam documents: ${teamDocs.length}`);
  let changed = 0;
  for (const team of teamDocs) {
    const raw = team as unknown as Record<string, unknown>;
    const hadPublicCategory = raw.publicCategory === 'leadership' || raw.publicCategory === 'team';
    const publicCategory: 'leadership' | 'team' = hadPublicCategory
      ? (raw.publicCategory as 'leadership' | 'team')
      : team.founder || team.group === 'Founders'
        ? 'leadership'
        : 'team';
    const hadEligible = typeof raw.engineeringProfileEligible === 'boolean';
    const engineeringProfileEligible = hadEligible
      ? (raw.engineeringProfileEligible as boolean)
      : publicCategory === 'leadership' || teamIdsWithProfile.has(team._id.toString());

    if (!hadPublicCategory || !hadEligible) {
      changed += 1;
      console.log(
        `  - ${team.name} (${team._id.toString()}): publicCategory=${publicCategory}, engineeringProfileEligible=${engineeringProfileEligible}`,
      );
      if (execute) {
        await teamCollection.updateOne(
          { _id: team._id },
          { $set: { publicCategory, engineeringProfileEligible } },
        );
      }
    }
  }
  console.log(`  ${changed} / ${teamDocs.length} Team documents need this backfill.`);

  return new Set(profiles.map((profile) => profile._id.toString()));
}

const CONTENT_COLLECTIONS = [
  { name: 'work', accessor: collections.work },
  { name: 'builds', accessor: collections.builds },
  { name: 'blueprints', accessor: collections.blueprints },
  { name: 'labs', accessor: collections.labs },
  { name: 'notes', accessor: collections.notes },
] as const;

async function migrateContributors(execute: boolean): Promise<void> {
  const profilesCollection = await collections.engineeringProfiles();
  const profiles = await profilesCollection.find({}).toArray();
  const profileTeamId = new Map(
    profiles.map((profile) => [profile._id.toString(), String(profile.teamMemberId)]),
  );

  console.log('\nContributor field migration (contributorProfileIds -> contributors):');
  for (const { name, accessor } of CONTENT_COLLECTIONS) {
    const collection = await accessor();
    const docs = await collection.find({}).toArray();
    let changed = 0;
    let orphanedTotal = 0;
    for (const doc of docs) {
      const raw = doc as unknown as Record<string, unknown>;
      const legacyIds = Array.isArray(raw.contributorProfileIds)
        ? (raw.contributorProfileIds as unknown[]).map(String)
        : null;
      if (legacyIds === null) continue;

      const resolved: string[] = [];
      const orphaned: string[] = [];
      for (const profileId of legacyIds) {
        const teamId = profileTeamId.get(profileId);
        if (teamId) resolved.push(teamId);
        else orphaned.push(profileId);
      }
      const contributors = [...new Set(resolved)];
      changed += 1;
      orphanedTotal += orphaned.length;
      const label = String(raw.title ?? raw.name ?? doc._id.toString());
      console.log(
        `  - ${name}/${label}: ${legacyIds.length} -> ${contributors.length} contributor(s)` +
          (orphaned.length ? ` (ORPHANED profile ids: ${orphaned.join(', ')})` : ''),
      );
      if (execute) {
        await collection.updateOne(
          { _id: doc._id } as never,
          { $set: { contributors }, $unset: { contributorProfileIds: '' } } as never,
        );
      }
    }
    console.log(
      `  ${name}: ${changed} / ${docs.length} documents migrated${orphanedTotal ? `, ${orphanedTotal} orphaned reference(s) — review before relying on these counts` : ''}.`,
    );
  }
}

async function main(): Promise<void> {
  const execute = hasFlag('--execute') && hasFlag('--yes-i-am-sure-this-is-correct');
  console.log(
    execute
      ? 'Running personnel-model migration — writes ARE enabled.'
      : 'Dry run only — no writes will be made. Re-run with --execute --yes-i-am-sure-this-is-correct to apply.',
  );

  await migrateUserRoles(execute);
  await assignNamedRoles(execute);
  await backfillTeamFields(execute);
  await migrateContributors(execute);

  console.log(
    execute
      ? "\nMigration applied.\n\n⚠ RESTART (or redeploy) every running instance of the app now — including your own local `next dev`. This script wrote via the raw MongoDB driver, so the public site's cached reads (Team roster, contributor attribution) will keep serving pre-migration data until each instance restarts and recomputes them. See the file header comment for why."
      : '\nDry run complete — nothing was written. Re-run with --execute --yes-i-am-sure-this-is-correct to apply.',
  );
  process.exit(0);
}

main().catch((error) => {
  console.error('migrate-personnel-model failed:', error);
  process.exit(1);
});
