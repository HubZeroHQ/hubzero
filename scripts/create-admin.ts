import bcrypt from "bcryptjs";
import { z } from "zod";

import { connectToDatabase } from "@/lib/db";
import { PASSWORD_HASH_COST, passwordSchema } from "@/lib/cms/password";
import { User, type UserRole } from "@/models/user";

/**
 * Operational bootstrap tool — `docs/operations/ADMIN_BOOTSTRAP.md`.
 * `ARCHITECTURE/19_CMS_FOUNDATION.md` §2: "no public self-registration...
 * accounts are created by a Head Admin" — but the very first account has no
 * Head Admin yet to create it, so this script is the deliberate exception,
 * run directly against the database. It's also the disaster-recovery path
 * if every Head Admin account is ever locked out. Every other account is
 * normally created from the Studio Users screen (`/studio/users`), which
 * calls the same `User` model and the same password-hashing convention this
 * script uses.
 *
 * Usage:
 *   npm run create-admin -- --email you@example.com --name "Full Name" --role head-admin
 *
 * If --password is omitted, the script prompts for one without echoing it
 * to the terminal. Passwords are never logged, printed, or hardcoded.
 */

const roleAliases: Record<string, UserRole> = {
  "head-admin": "head_admin",
  head_admin: "head_admin",
  headadmin: "head_admin",
  admin: "admin",
  teammate: "teammate",
};

const roleLabels: Record<UserRole, string> = {
  head_admin: "Head Admin",
  admin: "Admin",
  teammate: "Teammate",
};

const emailSchema = z.string().trim().toLowerCase().pipe(z.email());

interface ParsedArgs {
  email?: string;
  name?: string;
  role?: string;
  password?: string;
}

function printUsage(): void {
  console.error(
    `
Usage:
  npm run create-admin -- --email <email> --name "<Full Name>" --role <head-admin|admin|teammate> [--password <password>]

If --password is omitted, you'll be prompted for one (input is hidden, never echoed or logged).

Examples:
  npm run create-admin -- --email founder@hubzero.dev --name "Founder Name" --role head-admin
  npm run create-admin -- --email newteammate@hubzero.dev --name "New Teammate" --role teammate
`.trim(),
  );
}

function parseArgs(argv: string[]): ParsedArgs {
  const args: ParsedArgs = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    switch (token) {
      case "--email":
        args.email = argv[++i];
        break;
      case "--name":
        args.name = argv[++i];
        break;
      case "--role":
        args.role = argv[++i];
        break;
      case "--password":
        args.password = argv[++i];
        break;
      case "--help":
      case "-h":
        printUsage();
        process.exit(0);
        break;
      default:
        console.error(`Unrecognized argument: ${token}`);
        printUsage();
        process.exit(1);
    }
  }
  return args;
}

/**
 * Reads a line from stdin without echoing it — used only for the password
 * prompt. Backspace/Ctrl+C/Ctrl+D are handled explicitly since raw mode
 * disables the terminal's own line-editing; the typed characters are held
 * only in a local variable and returned once, never logged.
 */
async function promptHidden(promptText: string): Promise<string> {
  const { stdin, stdout } = process;

  if (!stdin.isTTY) {
    throw new Error(
      "No --password was supplied and this terminal can't prompt for one (not interactive) — pass --password explicitly.",
    );
  }

  return new Promise((resolve, reject) => {
    stdout.write(promptText);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    let input = "";

    function cleanup() {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
    }

    function onData(char: string) {
      switch (char) {
        case "\n":
        case "\r":
        case "\u0004": // Ctrl+D
          cleanup();
          stdout.write("\n");
          resolve(input);
          break;
        case "\u0003": // Ctrl+C
          cleanup();
          stdout.write("\n");
          reject(new Error("Cancelled."));
          break;
        case "\u007f": // Backspace (DEL)
        case "\b":
          input = input.slice(0, -1);
          break;
        default:
          input += char;
          break;
      }
    }

    stdin.on("data", onData);
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.email || !args.name || !args.role) {
    console.error("Missing required argument(s): --email, --name, and --role are all required.\n");
    printUsage();
    process.exit(1);
  }

  const emailResult = emailSchema.safeParse(args.email);
  if (!emailResult.success) {
    console.error(`"${args.email}" is not a valid email address.`);
    process.exit(1);
  }
  const email = emailResult.data;

  const name = args.name.trim();
  if (!name) {
    console.error("Name cannot be empty.");
    process.exit(1);
  }

  const role = roleAliases[args.role.trim().toLowerCase()];
  if (!role) {
    console.error(
      `"${args.role}" is not a valid role. Choose one of: head-admin, admin, teammate.`,
    );
    process.exit(1);
  }

  let password = args.password;
  if (!password) {
    const entered = await promptHidden("Password (input hidden): ");
    const confirmed = await promptHidden("Confirm password (input hidden): ");
    if (entered !== confirmed) {
      console.error("Passwords didn't match.");
      process.exit(1);
    }
    password = entered;
  }

  const passwordResult = passwordSchema.safeParse(password);
  if (!passwordResult.success) {
    console.error(passwordResult.error.issues[0]?.message ?? "Invalid password.");
    process.exit(1);
  }

  await connectToDatabase();

  const existing = await User.findOne({ email }).select("_id").lean();
  if (existing) {
    console.error(
      `A user with email "${email}" already exists — refusing to create a duplicate.\n` +
        `To change an existing account's role or password, use the Studio Users screen (/studio/users).`,
    );
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(passwordResult.data, PASSWORD_HASH_COST);
  const user = await User.create({ email, name, role, passwordHash });

  console.log(`${roleLabels[role]} account created successfully.`);
  console.log(`  Email: ${user.email}`);
  console.log(`  Name:  ${user.name}`);
  console.log(`  Role:  ${roleLabels[role]}`);
  console.log(`  ID:    ${user._id.toString()}`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Failed to create user:", error instanceof Error ? error.message : error);
  process.exit(1);
});
