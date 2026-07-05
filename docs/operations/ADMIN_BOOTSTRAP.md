# Admin Bootstrap

How to create Studio (`/studio`) accounts — the very first Head Admin, and every Admin/Teammate after that.

There is no public sign-up. Per `ARCHITECTURE/19_CMS_FOUNDATION.md` §2, accounts are created by a Head Admin, either through the Studio Users screen (the normal path) or, for the very first account (which has no Head Admin yet to create it), via `scripts/create-admin.ts` — a disaster-recovery CLI, not a general-purpose account tool.

## 1. Creating the first Head Admin

Run this once, before anyone has ever logged in:

```
npm run create-admin -- --email founder@hubzero.dev --name "Founder Name" --role head-admin
```

You'll be prompted for a password (input is hidden, not echoed to the terminal):

```
Password (input hidden):
Confirm password (input hidden):
```

Requires `MONGODB_URI` to be set (`.env.local`, same as the running app — see `.env.example`).

## 2. Creating additional Admins

Once a Head Admin exists, do this from the Studio UI instead: **Users → New user** (`/studio/users/new`), not the CLI. The CLI remains available for scripting/recovery:

```
npm run create-admin -- --email admin@hubzero.dev --name "Admin Name" --role admin
```

## 3. Creating Teammates

Same command, `--role teammate`:

```
npm run create-admin -- --email teammate@hubzero.dev --name "Teammate Name" --role teammate
```

Again, prefer the Studio Users screen for this in normal operation — the CLI is the bootstrap/recovery path, not the everyday one.

## 4. Expected output

On success:

```
Head Admin account created successfully.
  Email: founder@hubzero.dev
  Name:  Founder Name
  Role:  Head Admin
  ID:    <mongo object id>
```

The password is never printed, logged, or written anywhere — only its bcrypt hash is stored.

## 5. Common errors

| Message | Cause | Fix |
| --- | --- | --- |
| `Missing required argument(s): --email, --name, and --role are all required.` | One of the three required flags wasn't passed. | Re-run with all three. |
| `"<value>" is not a valid email address.` | `--email` failed validation. | Check for typos. |
| `"<value>" is not a valid role. Choose one of: head-admin, admin, teammate.` | `--role` wasn't one of the three accepted values (or a recognized alias). | Use `head-admin`, `admin`, or `teammate`. |
| `Password must be at least 12 characters.` | The password (typed or passed via `--password`) is too short. | Choose a longer password. |
| `Passwords didn't match.` | The hidden prompt and its confirmation didn't match. | Re-run and retype carefully. |
| `A user with email "<email>" already exists — refusing to create a duplicate.` | The script is safe to run multiple times — it never overwrites an existing account. | Use the Studio Users screen to edit the existing account, or pick a different email. |
| `No --password was supplied and this terminal can't prompt for one (not interactive)` | Running in a non-interactive context (CI, a piped script) with no `--password` flag. | Pass `--password` explicitly (only do this in a trusted, non-logged environment — shell history and process listings can expose it). |
| `MONGODB_URI is not set — see .env.example.` | No database connection configured. | Set `MONGODB_URI` in `.env.local`. |

Every failure exits with a non-zero status code; success exits `0`.

## 6. Password requirements

- At least 12 characters. There is no additional complexity rule (no forced mix of symbols/numbers/case) — length is the dominant factor in resistance to offline guessing, and `bcryptjs` at cost factor 12 (`ARCHITECTURE/19_CMS_FOUNDATION.md` §2) is the actual defense against online guessing.
- The same rule applies everywhere a password is set: this CLI, the Studio "New user" form, and the "set a new password" field on the Studio user-edit form (`src/lib/cms/password.ts` is the single shared source for this constant).
- Passwords are never printed to the terminal, written to a log, or stored anywhere except as a bcrypt hash (`User.passwordHash`).

## 7. Recovery procedure if no Head Admin exists

This can happen if the only Head Admin account is deleted, disabled, or its role changed by direct database manipulation (the Studio UI itself refuses to let this happen — see below).

1. Confirm there is genuinely no usable Head Admin: `mongosh`/Compass → `db.users.find({ role: "head_admin" })`.
2. Run the bootstrap command again:
   ```
   npm run create-admin -- --email you@example.com --name "Your Name" --role head-admin
   ```
   This works even if other accounts already exist — it only refuses a **duplicate email**, not a duplicate role.
3. Log in at `/studio/login` with the new account.

**Why this situation is hard to reach in normal use:** the Studio Users screen (`/studio/users`) enforces, server-side, that the last remaining Head Admin can never be deleted, demoted to a lower role, or disabled — whether that action is attempted by another Head Admin or by the account holder themselves. The only way to end up with zero Head Admins is direct, out-of-band database access, which is exactly the scenario this CLI exists to recover from.
