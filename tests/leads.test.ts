import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/cms/session", () => ({
  getSessionUser: vi.fn(),
  requireSessionUser: vi.fn(),
  requireRole: vi.fn(),
}));

import { getSessionUser } from "@/lib/cms/session";
import { ForbiddenError } from "@/lib/cms/permissions";
import {
  addLeadNote,
  assignLead,
  bulkArchiveLeads,
  bulkAssignLeads,
  exportLeadsCsv,
  getAssignableUsers,
  getOne,
  updateLeadDetails,
  updateLeadStatus,
} from "@/actions/studio/leads";
import { Lead } from "@/models/lead";
import { User } from "@/models/user";
import type { SessionUser } from "@/types/cms";

function loginAs(user: SessionUser | null) {
  vi.mocked(getSessionUser).mockResolvedValue(user);
}

async function createLead() {
  const lead = await Lead.create({
    name: "Jordan Rivera",
    email: "jordan@example.com",
    projectType: "both",
    message: "We need a combined hardware and software prototype.",
    sourcePage: "/contact",
    status: "new",
  });
  return lead._id.toString();
}

describe("Lead bespoke Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies status changes to a role with no edit grant on lead (teammate)", async () => {
    loginAs({
      id: "t1",
      email: "t@example.com",
      name: "T",
      role: "teammate",
      dynamicPermissions: [],
    });
    const id = await createLead();
    await expect(updateLeadStatus(id, "contacted")).rejects.toThrow(ForbiddenError);
  });

  it("changes status and records a timeline entry attributing the acting user", async () => {
    const admin = await User.create({
      email: "admin@example.com",
      name: "Admin Person",
      passwordHash: "unused",
      role: "admin",
      sessionVersion: 0,
    });
    loginAs({
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: "admin",
      dynamicPermissions: [],
    });

    const id = await createLead();
    const result = await updateLeadStatus(id, "contacted");
    expect(result.status).toBe("success");

    const doc = await getOne(id);
    expect(doc?.status).toBe("contacted");
    expect(doc?.timeline).toHaveLength(1);
    expect(doc?.timeline?.[0]?.type).toBe("status_change");
    expect(doc?.timeline?.[0]?.message).toMatch(/"new".*"contacted"/);
  });

  it("assigns a lead to a real user and records who did it, then unassigns", async () => {
    const admin = await User.create({
      email: "admin2@example.com",
      name: "Admin Two",
      passwordHash: "unused",
      role: "admin",
      sessionVersion: 0,
    });
    const assignee = await User.create({
      email: "assignee@example.com",
      name: "Assignee Person",
      passwordHash: "unused",
      role: "admin",
      sessionVersion: 0,
    });
    loginAs({
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: "admin",
      dynamicPermissions: [],
    });

    const id = await createLead();
    const assigned = await assignLead(id, assignee._id.toString());
    expect(assigned.status).toBe("success");

    let doc = await getOne(id);
    expect(String(doc?.assignedTo)).toBe(assignee._id.toString());
    expect(doc?.timeline?.some((entry) => entry.type === "assignment")).toBe(true);

    const unassigned = await assignLead(id, null);
    expect(unassigned.status).toBe("success");
    doc = await getOne(id);
    expect(doc?.assignedTo).toBeFalsy();
  });

  it("rejects assigning to a user that doesn't exist", async () => {
    const admin = await User.create({
      email: "admin3@example.com",
      name: "Admin Three",
      passwordHash: "unused",
      role: "admin",
      sessionVersion: 0,
    });
    loginAs({
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: "admin",
      dynamicPermissions: [],
    });

    const id = await createLead();
    const result = await assignLead(id, "000000000000000000000000");
    expect(result.status).toBe("error");
  });

  it("adds a note as one more timeline entry, and rejects an empty note", async () => {
    const admin = await User.create({
      email: "admin4@example.com",
      name: "Admin Four",
      passwordHash: "unused",
      role: "admin",
      sessionVersion: 0,
    });
    loginAs({
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: "admin",
      dynamicPermissions: [],
    });

    const id = await createLead();
    const noted = await addLeadNote(id, "Called and left a voicemail.");
    expect(noted.status).toBe("success");

    const doc = await getOne(id);
    expect(doc?.timeline?.[0]?.type).toBe("note");
    expect(doc?.timeline?.[0]?.message).toBe("Called and left a voicemail.");

    const empty = await addLeadNote(id, "   ");
    expect(empty.status).toBe("error");
  });

  it("getAssignableUsers only returns Admin/Head Admin accounts, never Teammates", async () => {
    const headAdmin = await User.create({
      email: "ha@example.com",
      name: "Head Admin",
      passwordHash: "unused",
      role: "head_admin",
      sessionVersion: 0,
    });
    await User.create({
      email: "teammate@example.com",
      name: "A Teammate",
      passwordHash: "unused",
      role: "teammate",
      sessionVersion: 0,
    });
    loginAs({
      id: headAdmin._id.toString(),
      email: headAdmin.email,
      name: headAdmin.name,
      role: "head_admin",
      dynamicPermissions: [],
    });

    const assignable = await getAssignableUsers();
    expect(assignable.some((entry) => entry.email === "teammate@example.com")).toBe(false);
    expect(assignable.some((entry) => entry.email === "ha@example.com")).toBe(true);
  });

  it("archiving a lead reuses updateLeadStatus, and restoring lands back on 'new'", async () => {
    const admin = await User.create({
      email: "admin5@example.com",
      name: "Admin Five",
      passwordHash: "unused",
      role: "admin",
      sessionVersion: 0,
    });
    loginAs({
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: "admin",
      dynamicPermissions: [],
    });

    const id = await createLead();
    await updateLeadStatus(id, "contacted");
    const archived = await updateLeadStatus(id, "archived");
    expect(archived.status).toBe("success");
    expect((await getOne(id))?.status).toBe("archived");

    const restored = await updateLeadStatus(id, "new");
    expect(restored.status).toBe("success");
    expect((await getOne(id))?.status).toBe("new");
  });

  it("updateLeadDetails saves priority, labels, reminder, and estimated value without a timeline entry", async () => {
    const admin = await User.create({
      email: "admin6@example.com",
      name: "Admin Six",
      passwordHash: "unused",
      role: "admin",
      sessionVersion: 0,
    });
    loginAs({
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: "admin",
      dynamicPermissions: [],
    });

    const id = await createLead();
    const result = await updateLeadDetails(id, {
      priority: "high",
      internalLabels: ["vip", "urgent"],
      reminderAt: "2026-08-01",
      estimatedValue: 25000,
    });
    expect(result.status).toBe("success");

    const doc = await getOne(id);
    expect(doc?.priority).toBe("high");
    expect(doc?.internalLabels).toEqual(["vip", "urgent"]);
    expect(doc?.estimatedValue).toBe(25000);
    expect(doc?.timeline ?? []).toHaveLength(0);
  });

  it("updateLeadDetails rejects a negative estimated value", async () => {
    const admin = await User.create({
      email: "admin7@example.com",
      name: "Admin Seven",
      passwordHash: "unused",
      role: "admin",
      sessionVersion: 0,
    });
    loginAs({
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: "admin",
      dynamicPermissions: [],
    });

    const id = await createLead();
    const result = await updateLeadDetails(id, {
      priority: "medium",
      internalLabels: [],
      reminderAt: null,
      estimatedValue: -5,
    });
    expect(result.status).toBe("error");
  });

  it("bulkArchiveLeads archives every id and reports success/failure counts", async () => {
    const admin = await User.create({
      email: "admin8@example.com",
      name: "Admin Eight",
      passwordHash: "unused",
      role: "admin",
      sessionVersion: 0,
    });
    loginAs({
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: "admin",
      dynamicPermissions: [],
    });

    const idA = await createLead();
    const idB = await createLead();
    const result = await bulkArchiveLeads([idA, idB]);
    expect(result.succeeded).toBe(2);
    expect(result.failed).toBe(0);
    expect((await getOne(idA))?.status).toBe("archived");
    expect((await getOne(idB))?.status).toBe("archived");
  });

  it("bulkAssignLeads assigns every id to the same user", async () => {
    const admin = await User.create({
      email: "admin9@example.com",
      name: "Admin Nine",
      passwordHash: "unused",
      role: "admin",
      sessionVersion: 0,
    });
    loginAs({
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: "admin",
      dynamicPermissions: [],
    });

    const idA = await createLead();
    const idB = await createLead();
    const result = await bulkAssignLeads([idA, idB], admin._id.toString());
    expect(result.succeeded).toBe(2);
    expect(String((await getOne(idA))?.assignedTo)).toBe(admin._id.toString());
    expect(String((await getOne(idB))?.assignedTo)).toBe(admin._id.toString());
  });

  it("exportLeadsCsv produces a header row plus one row per lead, escaping commas", async () => {
    const admin = await User.create({
      email: "admin10@example.com",
      name: "Admin Ten",
      passwordHash: "unused",
      role: "admin",
      sessionVersion: 0,
    });
    loginAs({
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: "admin",
      dynamicPermissions: [],
    });

    await Lead.create({
      name: "Comma, Inc.",
      email: "comma@example.com",
      projectType: "software",
      message: "Needs a, b, and c.",
      sourcePage: "/contact",
      status: "new",
    });

    const csv = await exportLeadsCsv();
    const lines = csv.split("\n");
    expect(lines[0]).toContain("Name");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('"Comma, Inc."');
  });

  it("denies exportLeadsCsv to a role with no view grant on lead", async () => {
    loginAs({
      id: "t1",
      email: "t@example.com",
      name: "T",
      role: "teammate",
      dynamicPermissions: [],
    });
    await expect(exportLeadsCsv()).rejects.toThrow(ForbiddenError);
  });
});
