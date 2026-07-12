import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import type { ZodError } from "zod";

import { getRecordLabel } from "@/lib/cms/collection-config";
import type { AnyCollectionConfig, CollectionConfig } from "@/lib/cms/collection-config";
import { connectToDatabase } from "@/lib/db";
import { checkHtmlBlockPublishGuard } from "@/lib/cms/blocks/guard";
import { createComment } from "@/lib/cms/comments";
import { getUsersWithPermission, notify, notifyMany } from "@/lib/cms/notifications";
import { requirePermission } from "@/lib/cms/permissions";
import { serializeDocument } from "@/lib/cms/serialize";
import { getVersionEntry, omitManagedFields, snapshotVersion } from "@/lib/cms/version-history";
import { escapeRegExp } from "@/lib/utils";
import type {
  BulkActionResult,
  ClientDocument,
  CrudActionState,
  ListResult,
  TableSearchParams,
  UserRole,
} from "@/types/cms";
import type { Block } from "@/lib/cms/blocks/types";

/**
 * The document shape `createCrudActions()` itself needs — a stricter bound
 * than `CollectionConfig<T>` requires, since `CollectionConfig` also
 * describes `workflow: "none"` collections that may not carry every one of
 * these fields. All optional except `_id`, so any collection's document type
 * satisfies this bound structurally.
 */
interface CrudDocument {
  _id: Types.ObjectId;
  createdBy?: Types.ObjectId;
  status?: string;
  version?: number;
  // Mongoose infers an unset Date path as `Date | null | undefined`, not just
  // `Date | undefined` — a document freshly loaded from the DB can hold an
  // explicit `null`, not merely "the key is absent."
  publishedAt?: Date | null;
  scheduledPublishAt?: Date | null;
  scheduledUnpublishAt?: Date | null;
  archivedAt?: Date | null;
}

type SimpleResult = { status: "success" } | { status: "error"; message: string };

const PAGE_SIZE = 20;

function encodeCursor(doc: Record<string, unknown>, sortField: string, id: Types.ObjectId): string {
  return Buffer.from(JSON.stringify({ v: doc[sortField], id: id.toString() })).toString(
    "base64url",
  );
}

function decodeCursorCondition(
  cursor: string,
  sortField: string,
  sortDir: 1 | -1,
): Record<string, unknown> {
  const { v, id } = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as {
    v: unknown;
    id: string;
  };
  const op = sortDir === -1 ? "$lt" : "$gt";
  return {
    $or: [{ [sortField]: { [op]: v } }, { [sortField]: v, _id: { [op]: new Types.ObjectId(id) } }],
  };
}

export function flattenZodErrors<TInput extends Record<string, unknown>>(
  error: ZodError,
): Partial<Record<keyof TInput & string, string>> {
  const fieldErrors: Partial<Record<keyof TInput & string, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in fieldErrors)) {
      fieldErrors[key as keyof TInput & string] = issue.message;
    }
  }
  return fieldErrors;
}

/**
 * Guarantees every array-shaped (`blocks`/`multiselect`/`imageArray`/
 * `referenceArray`) and boolean form field is the type its own field
 * declaration promises, for a `.lean()`-read document that may predate that
 * field's existence — the exact hazard `models/shared/card-fields.ts`'s
 * `withCardFieldDefaults` closes for public reads, generalized here to any
 * collection's own field config rather than a fixed list of field names,
 * since `getOne`/`list` are generic over every collection, not just the
 * five narrative ones. Driven entirely by `config.formFields`'s declared
 * `type`, the same dispatch `rawFromFormData`/`checkBlocksPublishGuard`
 * already use — a collection gets this for free from declaring its fields,
 * never a per-collection normalizer to remember.
 *
 * `readingTimeMinutes` rides along with the `"blocks"` case rather than
 * getting its own `FieldConfig` entry: it's computed (`config.computedFields`),
 * never a form field an editor sets directly, so it would otherwise be
 * invisible here — a legacy document missing it would render Studio's list
 * column/edit header as literally "undefined min read" (never a crash, but
 * the same missing-schema-default hazard this function exists to close for
 * every field that *is* declared).
 */
function normalizeLeanDocument<T extends Record<string, unknown>>(
  config: Pick<AnyCollectionConfig, "formFields">,
  doc: T,
): T {
  const writable = doc as Record<string, unknown>;
  for (const field of config.formFields) {
    if (
      field.type === "blocks" ||
      field.type === "multiselect" ||
      field.type === "imageArray" ||
      field.type === "referenceArray"
    ) {
      if (!Array.isArray(writable[field.name])) writable[field.name] = [];
      if (field.type === "blocks") {
        const readingTime = writable.readingTimeMinutes;
        if (typeof readingTime !== "number" || readingTime <= 0) {
          writable.readingTimeMinutes = 1;
        }
      }
    } else if (field.type === "boolean") {
      if (typeof writable[field.name] !== "boolean") writable[field.name] = false;
    }
  }
  return doc;
}

/** The one necessary escape hatch for setting workflow fields on a generically-typed document — see the module comment above `CrudDocument`. */
function patchWorkflowFields(
  doc: CrudDocument,
  patch: Partial<
    Pick<
      CrudDocument,
      | "status"
      | "version"
      | "publishedAt"
      | "scheduledPublishAt"
      | "scheduledUnpublishAt"
      | "archivedAt"
    >
  >,
): void {
  Object.assign(doc as unknown as Record<string, unknown>, patch);
}

/**
 * The `target` every `can()`/`requirePermission` call passes for an
 * `editOwn` check — reads `config.ownerField` when a collection declares
 * one (TeamMember's `linkedUserId`, `collection-config.ts`), `createdBy`
 * otherwise. The escape to `Record<string, unknown>` mirrors
 * `patchWorkflowFields`'s contained cast above: `doc`'s static type
 * (`CrudDocument`) only ever declares `createdBy`, but a configured
 * `ownerField` names a real field on the collection's own richer document
 * shape.
 */
function ownerTarget(
  doc: CrudDocument,
  config: Pick<AnyCollectionConfig, "ownerField">,
): { createdBy?: string } {
  if (!config.ownerField) return { createdBy: doc.createdBy?.toString() };
  const value = (doc as unknown as Record<string, unknown>)[config.ownerField];
  return { createdBy: value ? String(value) : undefined };
}

/**
 * The generic half of the Raw HTML block's "admin-only" rule
 * (`lib/cms/blocks/guard.ts`'s header comment explains why this lives at
 * publish time, not save time) — introspects `config.formFields` for any
 * `"blocks"`-type field the same way `rawFromFormData` already introspects
 * it for array-shaped field types, so no collection needs its own
 * `publishGuard` just to get this rule; a collection-specific `publishGuard`
 * (Blueprint's `demoStatus` gate) still runs alongside it in `publish()`.
 */
function checkBlocksPublishGuard(
  config: Pick<AnyCollectionConfig, "formFields">,
  doc: Record<string, unknown>,
  role: UserRole,
): string | null {
  for (const field of config.formFields) {
    if (field.type !== "blocks") continue;
    const guardMessage = checkHtmlBlockPublishGuard(doc[field.name] as Block[] | undefined, role);
    if (guardMessage) return guardMessage;
  }
  return null;
}

/**
 * Restoring version N does **not** overwrite the live document and republish
 * it — that would silently skip the review step on exactly the operation
 * (reverting content) that most needs a second set of eyes
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §9). Instead it repopulates the
 * document's authored fields from the old snapshot and sends its `status`
 * back to `"draft"`, so it goes through `submitForReview`/`publish` again
 * like any other edit — "restore" reads as one click, but underneath it's
 * "create a draft from this snapshot," exactly as §9 specifies. Never bumps
 * `version` and never writes a new `VersionHistory` entry itself: only
 * `publish()` does either of those, so restoring-then-abandoning a draft
 * leaves no phantom version behind.
 *
 * Operates on the type-erased `AnyCollectionConfig` (rather than
 * `createCrudActions<T, TInput>`'s own `T`/`TInput`) so one implementation
 * serves both a specific collection's own re-exported action (via
 * `createCrudActions()` below) and the resource-generic dispatcher
 * (`actions/studio/version-history.ts`) the version-history screen needs,
 * since that screen doesn't know which collection it's looking at until a
 * request names it.
 */
export async function restoreVersion(
  config: AnyCollectionConfig,
  id: string,
  versionHistoryId: string,
): Promise<SimpleResult> {
  if (config.workflow === "none") {
    throw new Error(`${config.resource} has no version history to restore.`);
  }

  await connectToDatabase();
  if (!Types.ObjectId.isValid(id)) return { status: "error", message: "Not found." };

  const doc = await config.model.findById(id);
  if (!doc) return { status: "error", message: "Not found." };

  const current = doc.toObject() as Record<string, unknown>;
  const ownerField = config.ownerField ?? "createdBy";
  await requirePermission("edit", config.resource, {
    createdBy: current[ownerField] ? String(current[ownerField]) : undefined,
  });

  const entry = await getVersionEntry(config.resource, id, versionHistoryId);
  if (!entry) return { status: "error", message: "That version could not be found." };

  const content = omitManagedFields(entry.snapshot);

  try {
    Object.assign(doc, content);
    patchWorkflowFields(doc as unknown as CrudDocument, { status: "draft" });
    await doc.save();

    const saved = doc.toObject() as Record<string, unknown>;
    for (const path of config.revalidatesPaths?.(saved) ?? []) revalidatePath(path);
    return { status: "success" };
  } catch (error) {
    console.error(
      `Failed to restore ${config.resource} ${id} to version ${versionHistoryId}:`,
      error,
    );
    return { status: "error", message: "Something went wrong while restoring. Please try again." };
  }
}

/**
 * Fires one due `schedulePublish()` (Phase B) — called only by the scheduler
 * (`lib/cms/scheduler.ts`, itself invoked by `app/api/cron/process-schedule/route.ts`),
 * never as a user-facing Server Action, so there's no signed-in user to gate
 * against with `requirePermission()`. That permission check already ran once,
 * for real, when a human called `schedulePublish()` to get here — this only
 * re-checks `config.publishGuard` (content-based, e.g. Blueprint's
 * `demoStatus`), since that can change between scheduling and the scheduled
 * moment, unlike the Raw-HTML-block role gate (`checkBlocksPublishGuard`),
 * which depends on who's signed in right now — nobody is, so it isn't
 * re-checked here; the content and its author don't change while a publish
 * waits to fire.
 */
export async function runScheduledPublish(
  config: AnyCollectionConfig,
  id: string,
): Promise<SimpleResult> {
  await connectToDatabase();
  if (!Types.ObjectId.isValid(id)) return { status: "error", message: "Not found." };

  const doc = await config.model.findById(id);
  if (!doc) return { status: "error", message: "Not found." };

  const record = doc as unknown as CrudDocument;
  if (record.status !== "scheduled") {
    return { status: "error", message: "This item is no longer scheduled to publish." };
  }

  const snapshot = doc.toObject() as Record<string, unknown>;
  const guardError = config.publishGuard?.(snapshot);
  if (guardError) return { status: "error", message: guardError };

  const actorId = record.createdBy?.toString();
  if (!actorId) return { status: "error", message: "This item has no author to publish as." };

  await snapshotVersion(config.resource, snapshot, actorId);

  patchWorkflowFields(record, {
    status: "published",
    publishedAt: new Date(),
    version: (record.version ?? 0) + 1,
    scheduledPublishAt: null,
    scheduledUnpublishAt: null,
  });
  await doc.save();

  const saved = doc.toObject() as Record<string, unknown>;
  for (const path of config.revalidatesPaths?.(saved) ?? []) revalidatePath(path);
  return { status: "success" };
}

/**
 * Fires one due `scheduleUnpublish()` (Phase B) — the scheduler-only
 * counterpart to `runScheduledPublish` above, same reasoning for skipping
 * `requirePermission()`. Never snapshots (archiving isn't a publish).
 */
export async function runScheduledArchive(
  config: AnyCollectionConfig,
  id: string,
): Promise<SimpleResult> {
  await connectToDatabase();
  if (!Types.ObjectId.isValid(id)) return { status: "error", message: "Not found." };

  const doc = await config.model.findById(id);
  if (!doc) return { status: "error", message: "Not found." };

  const record = doc as unknown as CrudDocument;
  if (record.status !== "published") {
    return { status: "error", message: "This item is no longer published." };
  }

  patchWorkflowFields(record, {
    status: "archived",
    archivedAt: new Date(),
    scheduledPublishAt: null,
    scheduledUnpublishAt: null,
  });
  await doc.save();

  const saved = doc.toObject() as Record<string, unknown>;
  for (const path of config.revalidatesPaths?.(saved) ?? []) revalidatePath(path);
  return { status: "success" };
}

/**
 * Generates the six generic Server Actions every collection needs
 * (`ARCHITECTURE/19_CMS_FOUNDATION.md` §5). A collection's own
 * `actions/studio/<collection>.ts` file is a few lines re-exporting this
 * call's result — the engine does the work; the collection only supplies
 * `config`.
 */
export function createCrudActions<T extends CrudDocument, TInput extends Record<string, unknown>>(
  config: CollectionConfig<T, TInput>,
) {
  function rawFromFormData(formData: FormData): Record<string, unknown> {
    const raw: Record<string, unknown> = {};
    for (const field of config.formFields) {
      if (field.type === "boolean") {
        raw[field.name] = formData.get(field.name) === "on";
      } else if (
        field.type === "multiselect" ||
        field.type === "imageArray" ||
        field.type === "referenceArray"
      ) {
        raw[field.name] = formData
          .getAll(field.name)
          .filter((value) => typeof value === "string" && value.length > 0);
      } else {
        const value = formData.get(field.name);
        raw[field.name] = typeof value === "string" ? value : undefined;
      }
    }
    return raw;
  }

  async function list(params: TableSearchParams): Promise<ListResult<ClientDocument<T>>> {
    await requirePermission("view", config.resource);
    await connectToDatabase();

    const sortColumn = config.listColumns.find(
      (column) => column.key === params.sort && column.sortable,
    );
    const sortField = sortColumn?.key ?? "createdAt";
    const sortDir: 1 | -1 = params.dir === "asc" ? 1 : -1;

    const conditions: Record<string, unknown>[] = [];

    for (const filterConfig of config.filters) {
      const value = params.filters?.[filterConfig.name];
      if (!value) continue;
      if (filterConfig.type === "select") {
        conditions.push({ [filterConfig.name]: value });
      } else if (filterConfig.type === "text") {
        conditions.push({ [filterConfig.name]: { $regex: escapeRegExp(value), $options: "i" } });
      } else if (filterConfig.type === "dateRange") {
        const [start, end] = value.split(",");
        const range: Record<string, Date> = {};
        if (start) range.$gte = new Date(start);
        if (end) range.$lte = new Date(end);
        if (Object.keys(range).length > 0) conditions.push({ [filterConfig.name]: range });
      }
    }

    if (params.q && config.searchableFields.length > 0) {
      const q = params.q;
      conditions.push({
        $or: config.searchableFields.map((field) => ({
          [field]: { $regex: escapeRegExp(q), $options: "i" },
        })),
      });
    }

    if (params.cursor) {
      conditions.push(decodeCursorCondition(params.cursor, sortField, sortDir));
    }

    const filter = conditions.length > 0 ? { $and: conditions } : {};

    const docs = await config.model
      .find(filter)
      .sort({ [sortField]: sortDir, _id: sortDir })
      .limit(PAGE_SIZE + 1)
      .lean<Record<string, unknown>[]>();

    const hasNext = docs.length > PAGE_SIZE;
    const page = docs.slice(0, PAGE_SIZE);
    const last = page[page.length - 1];
    // Cursor is encoded from the raw (pre-serialization) sort value so a
    // Date sort field stays a real Date for the next request's query cast.
    const nextCursor =
      hasNext && last ? encodeCursor(last, sortField, last._id as Types.ObjectId) : undefined;

    const normalized = page.map((doc) => normalizeLeanDocument(config, doc));

    return {
      items: serializeDocument(normalized) as unknown as ClientDocument<T>[],
      nextCursor,
      hasNext,
      hasPrev: Boolean(params.cursor),
    };
  }

  /** Serialized for direct use as a Client Component prop (e.g. `CmsForm`'s `initialValues`) — see `serialize.ts`. */
  async function getOne(id: string): Promise<ClientDocument<T> | null> {
    await requirePermission("view", config.resource);
    await connectToDatabase();
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await config.model.findById(id).lean<Record<string, unknown>>();
    if (!doc) return null;
    return serializeDocument(normalizeLeanDocument(config, doc)) as unknown as ClientDocument<T>;
  }

  async function create(
    _prevState: CrudActionState<TInput>,
    formData: FormData,
  ): Promise<CrudActionState<TInput>> {
    const user = await requirePermission("create", config.resource);
    await connectToDatabase();

    const parsed = config.zodSchema.safeParse(rawFromFormData(formData));
    if (!parsed.success) {
      return { status: "error", fieldErrors: flattenZodErrors<TInput>(parsed.error) };
    }

    const computed = config.computedFields?.(parsed.data) ?? {};
    const workflowDefaults: Partial<CrudDocument> =
      config.workflow === "none"
        ? {}
        : { status: "draft", version: 0, createdBy: new Types.ObjectId(user.id) };

    try {
      // `T` is abstract here (any collection's document shape), so Mongoose's
      // precisely-typed `create()` overloads can't be proven to match a
      // spread of `TInput`/`Partial<T>` pieces at compile time — the same
      // kind of contained escape hatch as `patchWorkflowFields` above.
      const created = await config.model.create({
        ...parsed.data,
        ...computed,
        ...workflowDefaults,
      } as unknown as T);
      const doc = created as unknown as T & { toObject(): T; _id: Types.ObjectId };
      for (const path of config.revalidatesPaths?.(doc.toObject()) ?? []) revalidatePath(path);
      return { status: "success", id: doc._id.toString() };
    } catch (error) {
      console.error(`Failed to create ${config.resource}:`, error);
      return { status: "error", formError: "Something went wrong while saving. Please try again." };
    }
  }

  async function update(
    id: string,
    _prevState: CrudActionState<TInput>,
    formData: FormData,
  ): Promise<CrudActionState<TInput>> {
    await connectToDatabase();
    if (!Types.ObjectId.isValid(id)) return { status: "error", formError: "Not found." };

    const existing = await config.model.findById(id);
    if (!existing) return { status: "error", formError: "Not found." };

    await requirePermission("edit", config.resource, ownerTarget(existing, config));

    const parsed = config.zodSchema.safeParse(rawFromFormData(formData));
    if (!parsed.success) {
      return { status: "error", fieldErrors: flattenZodErrors<TInput>(parsed.error) };
    }

    const computed = config.computedFields?.(parsed.data) ?? {};

    try {
      Object.assign(existing, parsed.data, computed);
      await existing.save();
      for (const path of config.revalidatesPaths?.(existing.toObject() as T) ?? [])
        revalidatePath(path);
      return { status: "success", id: id };
    } catch (error) {
      console.error(`Failed to update ${config.resource} ${id}:`, error);
      return { status: "error", formError: "Something went wrong while saving. Please try again." };
    }
  }

  async function submitForReview(id: string): Promise<SimpleResult> {
    if (config.workflow !== "draft-review-publish") {
      throw new Error(`${config.resource} has no review step (workflow: "${config.workflow}").`);
    }

    await connectToDatabase();
    if (!Types.ObjectId.isValid(id)) return { status: "error", message: "Not found." };

    const doc = await config.model.findById(id);
    if (!doc) return { status: "error", message: "Not found." };

    await requirePermission("edit", config.resource, ownerTarget(doc, config));

    // A document can enter review from a fresh draft, or be resubmitted
    // after a reviewer's `requestChanges()` sent it to `"changes_requested"`
    // (Phase C) — both are "the author thinks this is ready," so both route
    // through the identical review-entry transition.
    if (doc.status !== "draft" && doc.status !== "changes_requested") {
      return {
        status: "error",
        message: `Only a draft can be submitted for review (current status: "${doc.status}").`,
      };
    }

    patchWorkflowFields(doc, { status: "review" });
    await doc.save();

    const reviewerIds = await getUsersWithPermission("approve", config.resource);
    await notifyMany(reviewerIds, {
      event: "review_requested",
      title: `${getRecordLabel(config as unknown as AnyCollectionConfig, doc.toObject() as unknown as Record<string, unknown>)} was submitted for review`,
      link: config.studioBasePath ? `/studio/${config.studioBasePath}/${id}` : undefined,
      sourceCollection: config.resource,
      sourceDocumentId: id,
    });

    return { status: "success" };
  }

  /**
   * Approve, request changes, or reject a document currently in `"review"`
   * (Phase C) — three sanctioned reviewer decisions, all gated on the
   * `"approve"` permission action (already declared in `permissions.ts` for
   * every `draft-review-publish` collection, anticipated but unwired until
   * now). None of these three ever snapshots to `VersionHistory` — that
   * still only happens on an actual `publish()`.
   */
  async function approve(id: string): Promise<SimpleResult> {
    if (config.workflow !== "draft-review-publish") {
      throw new Error(`${config.resource} has no review step (workflow: "${config.workflow}").`);
    }
    await connectToDatabase();
    if (!Types.ObjectId.isValid(id)) return { status: "error", message: "Not found." };

    const doc = await config.model.findById(id);
    if (!doc) return { status: "error", message: "Not found." };

    const reviewer = await requirePermission("approve", config.resource, ownerTarget(doc, config));

    if (doc.status !== "review") {
      return { status: "error", message: `Only an item in review can be approved.` };
    }

    patchWorkflowFields(doc, { status: "approved" });
    await doc.save();

    const authorId = doc.createdBy?.toString();
    if (authorId && authorId !== reviewer.id) {
      await notify({
        userId: authorId,
        event: "document_approved",
        title: `${getRecordLabel(config as unknown as AnyCollectionConfig, doc.toObject() as unknown as Record<string, unknown>)} was approved`,
        link: config.studioBasePath ? `/studio/${config.studioBasePath}/${id}` : undefined,
        sourceCollection: config.resource,
        sourceDocumentId: id,
      });
    }
    return { status: "success" };
  }

  /** Sends a document in review back to its author for more work, with a required comment explaining what's needed — the comment is what makes this actionable rather than a silent status flip. */
  async function requestChanges(id: string, message: string): Promise<SimpleResult> {
    if (config.workflow !== "draft-review-publish") {
      throw new Error(`${config.resource} has no review step (workflow: "${config.workflow}").`);
    }
    const trimmed = message.trim();
    if (!trimmed) return { status: "error", message: "Explain what needs to change." };

    await connectToDatabase();
    if (!Types.ObjectId.isValid(id)) return { status: "error", message: "Not found." };

    const doc = await config.model.findById(id);
    if (!doc) return { status: "error", message: "Not found." };

    const reviewer = await requirePermission("approve", config.resource, ownerTarget(doc, config));

    if (doc.status !== "review") {
      return { status: "error", message: `Only an item in review can have changes requested.` };
    }

    patchWorkflowFields(doc, { status: "changes_requested" });
    await doc.save();
    await createComment({
      resource: config.resource,
      documentId: id,
      authorId: reviewer.id,
      body: trimmed,
      type: "review",
    });
    return { status: "success" };
  }

  /** Bounces a document in review straight back to `"draft"` — a harder rejection than `requestChanges`, for content that needs to be substantially reworked rather than lightly revised. Also requires a comment. */
  async function reject(id: string, message: string): Promise<SimpleResult> {
    if (config.workflow !== "draft-review-publish") {
      throw new Error(`${config.resource} has no review step (workflow: "${config.workflow}").`);
    }
    const trimmed = message.trim();
    if (!trimmed) return { status: "error", message: "Explain why this was rejected." };

    await connectToDatabase();
    if (!Types.ObjectId.isValid(id)) return { status: "error", message: "Not found." };

    const doc = await config.model.findById(id);
    if (!doc) return { status: "error", message: "Not found." };

    const reviewer = await requirePermission("approve", config.resource, ownerTarget(doc, config));

    if (doc.status !== "review") {
      return { status: "error", message: `Only an item in review can be rejected.` };
    }

    patchWorkflowFields(doc, { status: "draft" });
    await doc.save();
    await createComment({
      resource: config.resource,
      documentId: id,
      authorId: reviewer.id,
      body: trimmed,
      type: "review",
    });
    return { status: "success" };
  }

  async function publish(id: string): Promise<SimpleResult> {
    if (config.workflow === "none") {
      throw new Error(`${config.resource} has no publish workflow.`);
    }

    await connectToDatabase();
    if (!Types.ObjectId.isValid(id)) return { status: "error", message: "Not found." };

    const doc = await config.model.findById(id);
    if (!doc) return { status: "error", message: "Not found." };

    const user = await requirePermission("publish", config.resource, ownerTarget(doc, config));

    const blocksGuardError = checkBlocksPublishGuard(
      config,
      doc.toObject() as unknown as Record<string, unknown>,
      user.role,
    );
    if (blocksGuardError) return { status: "error", message: blocksGuardError };

    const guardError = config.publishGuard?.(doc.toObject() as T);
    if (guardError) return { status: "error", message: guardError };

    // Snapshot *before* the mutation applies — the version entry always
    // represents "what was live before this change" (`ARCHITECTURE/19_CMS_FOUNDATION.md`
    // §9), and this is the one and only path that both versions and
    // publishes, so there's no second way to publish that skips it.
    await snapshotVersion(
      config.resource,
      doc.toObject() as unknown as Record<string, unknown>,
      user.id,
    );

    patchWorkflowFields(doc, {
      status: "published",
      publishedAt: new Date(),
      version: (doc.version ?? 0) + 1,
      // A publish — whether triggered directly or by the scheduler
      // (`app/api/cron/process-schedule/route.ts`) reaching a due
      // `scheduledPublishAt` — always clears any pending schedule of either
      // direction, so a document never carries stale scheduling state past
      // the moment it actually publishes.
      scheduledPublishAt: null,
      scheduledUnpublishAt: null,
    });
    await doc.save();

    for (const path of config.revalidatesPaths?.(doc.toObject() as T) ?? []) revalidatePath(path);

    const authorId = doc.createdBy?.toString();
    if (authorId && authorId !== user.id) {
      await notify({
        userId: authorId,
        event: "publish_completed",
        title: `${getRecordLabel(config as unknown as AnyCollectionConfig, doc.toObject() as unknown as Record<string, unknown>)} was published`,
        link: config.studioBasePath ? `/studio/${config.studioBasePath}/${id}` : undefined,
        sourceCollection: config.resource,
        sourceDocumentId: id,
      });
    }
    return { status: "success" };
  }

  /**
   * Publish at a future moment instead of immediately (Phase B). Deliberately
   * mirrors `publish()`'s own laxity about current status (no "must be in
   * review first" gate) rather than adding a stricter check this engine
   * doesn't otherwise enforce. Does **not** snapshot to `VersionHistory` —
   * only an actual `publish()` call does that (the scheduler's own call when
   * `scheduledPublishAt` comes due), so nothing is versioned until the
   * content is genuinely live.
   */
  async function schedulePublish(id: string, at: Date): Promise<SimpleResult> {
    if (config.workflow === "none") {
      throw new Error(`${config.resource} has no publish workflow.`);
    }
    await connectToDatabase();
    if (!Types.ObjectId.isValid(id)) return { status: "error", message: "Not found." };

    const doc = await config.model.findById(id);
    if (!doc) return { status: "error", message: "Not found." };

    const user = await requirePermission("publish", config.resource, ownerTarget(doc, config));

    const blocksGuardError = checkBlocksPublishGuard(
      config,
      doc.toObject() as unknown as Record<string, unknown>,
      user.role,
    );
    if (blocksGuardError) return { status: "error", message: blocksGuardError };

    const guardError = config.publishGuard?.(doc.toObject() as T);
    if (guardError) return { status: "error", message: guardError };

    patchWorkflowFields(doc, {
      status: "scheduled",
      scheduledPublishAt: at,
      scheduledUnpublishAt: null,
    });
    await doc.save();
    return { status: "success" };
  }

  /**
   * Schedule an already-`"published"` document to leave the public site at a
   * future moment (Phase B) — status stays `"published"` (and the public page
   * keeps rendering) until the scheduled moment, when the scheduler calls
   * `archive()`. This mirrors `scheduledPublishAt`'s "nothing happens until
   * the scheduler acts" shape, just for the opposite direction.
   */
  async function scheduleUnpublish(id: string, at: Date): Promise<SimpleResult> {
    if (config.workflow === "none") {
      throw new Error(`${config.resource} has no publish workflow.`);
    }
    await connectToDatabase();
    if (!Types.ObjectId.isValid(id)) return { status: "error", message: "Not found." };

    const doc = await config.model.findById(id);
    if (!doc) return { status: "error", message: "Not found." };

    await requirePermission("publish", config.resource, ownerTarget(doc, config));

    patchWorkflowFields(doc, { scheduledUnpublishAt: at, scheduledPublishAt: null });
    await doc.save();
    return { status: "success" };
  }

  /**
   * Cancels a pending `schedulePublish`/`scheduleUnpublish` (Phase B) without
   * waiting for the scheduled moment. A `"scheduled"` document reverts to
   * `"draft"` (the same "must re-earn publish" posture `restoreVersion` uses,
   * rather than silently leaving it in a state with no scheduled action
   * pending); a `"published"` document with a pending unpublish simply keeps
   * publishing.
   */
  async function cancelSchedule(id: string): Promise<SimpleResult> {
    await connectToDatabase();
    if (!Types.ObjectId.isValid(id)) return { status: "error", message: "Not found." };

    const doc = await config.model.findById(id);
    if (!doc) return { status: "error", message: "Not found." };

    await requirePermission("publish", config.resource, ownerTarget(doc, config));

    patchWorkflowFields(doc, {
      status: doc.status === "scheduled" ? "draft" : doc.status,
      scheduledPublishAt: null,
      scheduledUnpublishAt: null,
    });
    await doc.save();
    return { status: "success" };
  }

  /**
   * Removes a document from the public site without deleting it (Phase B) —
   * the "unpublish" half of scheduling, also callable directly. Revalidates
   * the same paths `publish()` does, since an archived document must stop
   * rendering at whatever public route it previously occupied.
   */
  async function archive(id: string): Promise<SimpleResult> {
    if (config.workflow === "none") {
      throw new Error(`${config.resource} has no publish workflow.`);
    }
    await connectToDatabase();
    if (!Types.ObjectId.isValid(id)) return { status: "error", message: "Not found." };

    const doc = await config.model.findById(id);
    if (!doc) return { status: "error", message: "Not found." };

    await requirePermission("publish", config.resource, ownerTarget(doc, config));

    patchWorkflowFields(doc, {
      status: "archived",
      archivedAt: new Date(),
      scheduledPublishAt: null,
      scheduledUnpublishAt: null,
    });
    await doc.save();

    for (const path of config.revalidatesPaths?.(doc.toObject() as T) ?? []) revalidatePath(path);
    return { status: "success" };
  }

  /**
   * Brings an archived document back as a draft (Phase B) — never straight
   * back to `"published"`, the identical "restoring reads as one click but
   * underneath is a new draft that must re-earn publish/approval" rule
   * `restoreVersion` documents above. Gated on `"edit"` rather than
   * `"publish"` for the same reason `restoreVersion` is: this produces a
   * draft, not a live change.
   */
  async function restoreArchive(id: string): Promise<SimpleResult> {
    await connectToDatabase();
    if (!Types.ObjectId.isValid(id)) return { status: "error", message: "Not found." };

    const doc = await config.model.findById(id);
    if (!doc) return { status: "error", message: "Not found." };

    await requirePermission("edit", config.resource, ownerTarget(doc, config));

    if (doc.status !== "archived") {
      return { status: "error", message: "Only an archived item can be restored." };
    }

    patchWorkflowFields(doc, { status: "draft", archivedAt: null });
    await doc.save();

    for (const path of config.revalidatesPaths?.(doc.toObject() as T) ?? []) revalidatePath(path);
    return { status: "success" };
  }

  async function remove(id: string): Promise<SimpleResult> {
    await connectToDatabase();
    if (!Types.ObjectId.isValid(id)) return { status: "error", message: "Not found." };

    const doc = await config.model.findById(id);
    if (!doc) return { status: "error", message: "Not found." };

    await requirePermission("delete", config.resource, ownerTarget(doc, config));

    const blockedReason = await config.deleteGuard?.(id);
    if (blockedReason) return { status: "error", message: blockedReason };

    await config.model.findByIdAndDelete(id);
    for (const path of config.revalidatesPaths?.(doc.toObject() as T) ?? []) revalidatePath(path);
    return { status: "success" };
  }

  /**
   * Persists the draft's current field values on an interval — never
   * touches `status`/`version`/`publishedAt`, never revalidates a public
   * path (`ARCHITECTURE/19_CMS_FOUNDATION.md` §6). Skips Zod validation
   * deliberately: an in-progress draft is allowed to be momentarily
   * incomplete, and autosave's job is "don't lose keystrokes," not "enforce
   * the same completeness `create`/`update` require before a real save."
   */
  async function autosaveDraft(
    id: string,
    values: Partial<TInput>,
  ): Promise<{ status: "saved" | "error" }> {
    if (config.workflow === "none") {
      throw new Error(`${config.resource} has no draft to autosave.`);
    }

    await connectToDatabase();
    if (!Types.ObjectId.isValid(id)) return { status: "error" };

    const doc = await config.model.findById(id);
    if (!doc) return { status: "error" };

    try {
      await requirePermission("edit", config.resource, ownerTarget(doc, config));
    } catch {
      return { status: "error" };
    }

    if (doc.status !== "draft") return { status: "error" };

    try {
      Object.assign(doc, values);
      await doc.save({ validateBeforeSave: false });
      return { status: "saved" };
    } catch (error) {
      console.error(`Autosave failed for ${config.resource} ${id}:`, error);
      return { status: "error" };
    }
  }

  /**
   * Bulk delete/publish — row-selection checkboxes plus a bulk-action bar in
   * the generic `DataTable` (§7) call these once, server-side, rather than
   * firing N client-triggered requests. Routed through the exact same
   * single-row `remove`/`publish` above, so permission checks, publish
   * guards, and revalidation all apply identically to a bulk call.
   */
  async function bulkRemove(ids: string[]): Promise<BulkActionResult> {
    let succeeded = 0;
    for (const id of ids) {
      if ((await remove(id)).status === "success") succeeded += 1;
    }
    return { status: "success", succeeded, failed: ids.length - succeeded };
  }

  async function bulkPublish(ids: string[]): Promise<BulkActionResult> {
    let succeeded = 0;
    for (const id of ids) {
      if ((await publish(id)).status === "success") succeeded += 1;
    }
    return { status: "success", succeeded, failed: ids.length - succeeded };
  }

  return {
    list,
    getOne,
    create,
    update,
    submitForReview,
    publish,
    remove,
    autosaveDraft,
    bulkRemove,
    bulkPublish,
    restoreVersion: (id: string, versionHistoryId: string) =>
      restoreVersion(config as unknown as AnyCollectionConfig, id, versionHistoryId),
    schedulePublish,
    scheduleUnpublish,
    cancelSchedule,
    archive,
    restoreArchive,
    approve,
    requestChanges,
    reject,
  };
}
