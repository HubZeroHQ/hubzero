import bcrypt from "bcryptjs";

import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/user";

/**
 * One-time bootstrap for the first Head Admin account.
 * `ARCHITECTURE/19_CMS_FOUNDATION.md` §2: "no public self-registration...
 * accounts are created by a Head Admin" — but the very first account has no
 * Head Admin yet to create it, so this script is the one deliberate
 * exception, run directly against the database rather than through
 * `/studio`. Every subsequent account is created from inside the CMS itself
 * (Phase E's Users screen), not this script.
 *
 * Usage: `npm run create-admin -- "name@example.com" "Full Name" "a strong password"`
 * (run via `tsx --env-file=.env.local`, so it reads the same `MONGODB_URI`
 * as the app without needing a separate env-loading dependency).
 */
async function main() {
  const [email, name, password] = process.argv.slice(2);

  if (!email || !name || !password) {
    console.error('Usage: npm run create-admin -- "email@example.com" "Full Name" "password"');
    process.exit(1);
  }
  if (password.length < 12) {
    console.error("Password must be at least 12 characters.");
    process.exit(1);
  }

  await connectToDatabase();

  const existing = await User.findOne({ email: email.trim().toLowerCase() });
  if (existing) {
    console.error(`A user with email "${email}" already exists — refusing to overwrite it.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    email: email.trim().toLowerCase(),
    name: name.trim(),
    passwordHash,
    role: "head_admin",
  });

  console.log(`Head Admin created: ${user.email} (${user._id.toString()})`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Failed to create admin user:", error);
  process.exit(1);
});
