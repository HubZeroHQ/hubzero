import bcrypt from "bcryptjs";
import { describe, expect, it } from "vitest";

import { roleMeetsMinimum } from "@/lib/cms/roles";
import { User } from "@/models/user";

/**
 * `lib/cms/auth.ts`'s Credentials `authorize()` callback isn't separately
 * exported (it's defined inline inside the `NextAuth({...})` call), so it
 * can't be unit tested in isolation without refactoring working auth code
 * purely to make it testable — not this pass's call to make. What's tested
 * here instead is every actually-isolatable piece `authorize()` depends on:
 * the password-hashing mechanism itself, the role hierarchy its coarse
 * `requireRole()` gate uses, and the `User` model's own constraints
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §2's credential-enumeration and
 * password-hashing requirements).
 */

describe("roleMeetsMinimum", () => {
  it("ranks head_admin > admin > teammate", () => {
    expect(roleMeetsMinimum("head_admin", "teammate")).toBe(true);
    expect(roleMeetsMinimum("head_admin", "admin")).toBe(true);
    expect(roleMeetsMinimum("admin", "teammate")).toBe(true);
    expect(roleMeetsMinimum("teammate", "admin")).toBe(false);
    expect(roleMeetsMinimum("admin", "head_admin")).toBe(false);
  });

  it("a role always meets its own minimum", () => {
    expect(roleMeetsMinimum("teammate", "teammate")).toBe(true);
    expect(roleMeetsMinimum("admin", "admin")).toBe(true);
  });
});

describe("password hashing (the mechanism authorize() relies on)", () => {
  it("a bcrypt hash verifies against the correct password and rejects an incorrect one", async () => {
    const hash = await bcrypt.hash("a correct horse battery staple", 12);
    expect(await bcrypt.compare("a correct horse battery staple", hash)).toBe(true);
    expect(await bcrypt.compare("wrong password", hash)).toBe(false);
  });
});

describe("User model", () => {
  it("enforces a unique email at the schema level", async () => {
    await User.create({
      email: "duplicate@example.com",
      name: "First",
      passwordHash: "x",
      role: "admin",
      sessionVersion: 0,
    });

    await expect(
      User.create({
        email: "duplicate@example.com",
        name: "Second",
        passwordHash: "y",
        role: "admin",
        sessionVersion: 0,
      }),
    ).rejects.toThrow();
  });

  it("defaults dynamicPermissions to an empty array and sessionVersion to a real number", async () => {
    const user = await User.create({
      email: "defaults@example.com",
      name: "Defaults",
      passwordHash: "x",
      role: "teammate",
    });
    expect(user.dynamicPermissions).toEqual([]);
    expect(typeof user.sessionVersion).toBe("number");
  });
});
