import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cms/session", () => ({
  getSessionUser: vi.fn(),
  requireSessionUser: vi.fn(),
  requireRole: vi.fn(),
}));

import { getSessionUser } from "@/lib/cms/session";
import { ForbiddenError } from "@/lib/cms/permissions";
import { resetUserPassword, updateUser } from "@/actions/studio/users";
import { User } from "@/models/user";
import type { SessionUser } from "@/types/cms";
import { fakeObjectId, toFormData } from "./helpers";

function loginAs(user: SessionUser | null) {
  vi.mocked(getSessionUser).mockResolvedValue(user);
}

async function createRealUser(role: SessionUser["role"] = "teammate") {
  return User.create({
    email: `${fakeObjectId()}@example.com`,
    name: "Target User",
    passwordHash: "original-hash",
    role,
    sessionVersion: 0,
  });
}

describe("resetUserPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies a caller without manageUsers (admin, not head_admin)", async () => {
    loginAs({ id: "a1", email: "a@example.com", name: "A", role: "admin", dynamicPermissions: [] });
    const target = await createRealUser();
    await expect(resetUserPassword(target._id.toString(), "a-strong-password-123")).rejects.toThrow(
      ForbiddenError,
    );
  });

  it("denies an unauthenticated caller", async () => {
    loginAs(null);
    const target = await createRealUser();
    await expect(resetUserPassword(target._id.toString(), "a-strong-password-123")).rejects.toThrow(
      ForbiddenError,
    );
  });

  it("rejects a password shorter than the shared minimum length", async () => {
    const headAdmin = await createRealUser("head_admin");
    loginAs({
      id: headAdmin._id.toString(),
      email: headAdmin.email,
      name: headAdmin.name,
      role: "head_admin",
      dynamicPermissions: [],
    });
    const target = await createRealUser();

    const result = await resetUserPassword(target._id.toString(), "too-short");
    expect(result.status).toBe("error");

    const unchanged = await User.findById(target._id).lean();
    expect(unchanged?.passwordHash).toBe("original-hash");
    expect(unchanged?.sessionVersion).toBe(0);
  });

  it("returns an error for a user that doesn't exist", async () => {
    const headAdmin = await createRealUser("head_admin");
    loginAs({
      id: headAdmin._id.toString(),
      email: headAdmin.email,
      name: headAdmin.name,
      role: "head_admin",
      dynamicPermissions: [],
    });

    const result = await resetUserPassword(fakeObjectId(), "a-strong-password-123");
    expect(result.status).toBe("error");
  });

  it("hashes the new password with bcrypt and bumps sessionVersion so every active session is revoked", async () => {
    const headAdmin = await createRealUser("head_admin");
    loginAs({
      id: headAdmin._id.toString(),
      email: headAdmin.email,
      name: headAdmin.name,
      role: "head_admin",
      dynamicPermissions: [],
    });
    const target = await createRealUser();

    const result = await resetUserPassword(target._id.toString(), "a-brand-new-password-456");
    expect(result.status).toBe("success");

    const updated = await User.findById(target._id).lean();
    expect(updated?.sessionVersion).toBe(1);
    expect(updated?.passwordHash).not.toBe("original-hash");
    await expect(bcrypt.compare("a-brand-new-password-456", updated!.passwordHash)).resolves.toBe(
      true,
    );
  });

  it("allows a Head Admin to reset their own password (self-reset is a note, not a hard block)", async () => {
    const headAdmin = await createRealUser("head_admin");
    loginAs({
      id: headAdmin._id.toString(),
      email: headAdmin.email,
      name: headAdmin.name,
      role: "head_admin",
      dynamicPermissions: [],
    });

    const result = await resetUserPassword(headAdmin._id.toString(), "a-self-reset-password-789");
    expect(result.status).toBe("success");

    const updated = await User.findById(headAdmin._id).lean();
    expect(updated?.sessionVersion).toBe(1);
  });
});

describe("updateUser (regression: no longer touches passwordHash)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("leaves passwordHash and sessionVersion untouched when only name changes", async () => {
    const headAdmin = await createRealUser("head_admin");
    loginAs({
      id: headAdmin._id.toString(),
      email: headAdmin.email,
      name: headAdmin.name,
      role: "head_admin",
      dynamicPermissions: [],
    });
    const target = await createRealUser();

    const result = await updateUser(
      target._id.toString(),
      { status: "idle" },
      toFormData({
        email: target.email,
        name: "A New Name",
        role: target.role,
        disabled: false,
      }),
    );
    expect(result.status).toBe("success");

    const updated = await User.findById(target._id).lean();
    expect(updated?.name).toBe("A New Name");
    expect(updated?.passwordHash).toBe("original-hash");
    expect(updated?.sessionVersion).toBe(0);
  });

  it("still bumps sessionVersion on a role change", async () => {
    const headAdmin = await createRealUser("head_admin");
    loginAs({
      id: headAdmin._id.toString(),
      email: headAdmin.email,
      name: headAdmin.name,
      role: "head_admin",
      dynamicPermissions: [],
    });
    const target = await createRealUser("teammate");

    const result = await updateUser(
      target._id.toString(),
      { status: "idle" },
      toFormData({
        email: target.email,
        name: target.name,
        role: "admin",
        disabled: false,
      }),
    );
    expect(result.status).toBe("success");

    const updated = await User.findById(target._id).lean();
    expect(updated?.role).toBe("admin");
    expect(updated?.sessionVersion).toBe(1);
  });

  it("still blocks demoting the last remaining Head Admin", async () => {
    const headAdmin = await createRealUser("head_admin");
    loginAs({
      id: headAdmin._id.toString(),
      email: headAdmin.email,
      name: headAdmin.name,
      role: "head_admin",
      dynamicPermissions: [],
    });

    const result = await updateUser(
      headAdmin._id.toString(),
      { status: "idle" },
      toFormData({
        email: headAdmin.email,
        name: headAdmin.name,
        role: "admin",
        disabled: false,
      }),
    );
    expect(result.status).toBe("error");

    const unchanged = await User.findById(headAdmin._id).lean();
    expect(unchanged?.role).toBe("head_admin");
  });
});
