import { Types } from "mongoose";

import "@/lib/cms/collections";
import { connectToDatabase } from "@/lib/db";
import { computeReadingTimeMinutes } from "@/lib/cms/blocks/text";
import {
  backfillCardFields,
  deriveSummary,
  migrateBlueprintContent,
  migrateCaseStudyContent,
  migrateSingleFieldContent,
  needsContentMigration,
} from "@/lib/cms/blocks/legacy-migration";
import { Blueprint } from "@/models/blueprint";
import { Build } from "@/models/build";
import { CaseStudy } from "@/models/case-study";
import { LabsProject } from "@/models/labs-project";
import { Note } from "@/models/note";
import type { Block } from "@/lib/cms/blocks/types";

/**
 * `ARCHITECTURE/20_CONTENT_BLOCKS.md` §8 — one-time content migration from
 * the old fixed-field model (`problem`/`approach`/`result`, `description`,
 * `body`, `customizationNotes`) into the new ordered `content: Block[]`
 * model, for every document that predates this evolution.
 *
 * Idempotent by construction: `needsContentMigration()` skips any document
 * that already has a non-empty `content` array, so re-running this script
 * (e.g. after a partial failure, or safely in CI) never double-migrates or
 * clobbers content an editor has since rewritten in the new block editor.
 *
 * Every document also gets `contributors`/`featured` backfilled to their
 * schema defaults (`[]`/`false`) unconditionally, not just documents needing
 * a content migration — Mongoose schema defaults only apply to documents
 * created *after* a schema change; a document written before `contributors`/
 * `featured` existed has neither key in MongoDB at all, and `.lean()` reads
 * (used by every public/studio read path) return exactly what's stored, not
 * a schema-defaulted value. Without this backfill, `doc.contributors.map(...)`
 * on a pre-existing document throws, not just renders emptily.
 *
 * Reads the old field values via `.lean()` on the *current* (already
 * schema-updated) Mongoose models — Mongoose's `lean()` returns the raw
 * MongoDB document, not a schema-filtered projection, so a field no longer
 * declared in the schema (e.g. `CaseStudy.problem`) is still present on the
 * plain object for any document written before this migration ran. Nothing
 * here is lost; the old fields are explicitly `$unset` only after `content`
 * has been written successfully.
 *
 * Usage: `npm run migrate-content-blocks` (safe to run against a database
 * that has already been migrated — it will report 0 documents updated).
 */

interface LegacyDoc {
  _id: Types.ObjectId;
  content?: unknown;
  contributors?: unknown;
  featured?: unknown;
  [key: string]: unknown;
}

async function migrateCaseStudies() {
  const docs = await CaseStudy.find({}).lean<LegacyDoc[]>();
  let migrated = 0;
  for (const doc of docs) {
    const set: Record<string, unknown> = { ...backfillCardFields(doc) };
    const unset: Record<string, string> = {};

    if (needsContentMigration(doc)) {
      const problem = String(doc.problem ?? "");
      const approach = String(doc.approach ?? "");
      const result = String(doc.result ?? "");
      const content: Block[] = migrateCaseStudyContent({ problem, approach, result });
      set.content = content;
      set.summary =
        typeof doc.summary === "string" && doc.summary.trim()
          ? doc.summary
          : deriveSummary(problem || result);
      set.readingTimeMinutes = computeReadingTimeMinutes(content);
      unset.problem = "";
      unset.approach = "";
      unset.result = "";
      migrated += 1;
    }

    await CaseStudy.updateOne(
      { _id: doc._id },
      { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) },
    );
  }
  console.log(`CaseStudy: migrated ${migrated} of ${docs.length} document(s).`);
}

async function migrateBuilds() {
  const docs = await Build.find({}).lean<LegacyDoc[]>();
  let migrated = 0;
  for (const doc of docs) {
    const set: Record<string, unknown> = { ...backfillCardFields(doc) };
    const unset: Record<string, string> = {};

    if (needsContentMigration(doc)) {
      const description = String(doc.description ?? "");
      const content = migrateSingleFieldContent(description);
      set.content = content;
      set.readingTimeMinutes = computeReadingTimeMinutes(content);
      unset.description = "";
      migrated += 1;
    }

    await Build.updateOne(
      { _id: doc._id },
      { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) },
    );
  }
  console.log(`Build: migrated ${migrated} of ${docs.length} document(s).`);
}

async function migrateLabsProjects() {
  const docs = await LabsProject.find({}).lean<LegacyDoc[]>();
  let migrated = 0;
  for (const doc of docs) {
    const set: Record<string, unknown> = { ...backfillCardFields(doc) };
    const unset: Record<string, string> = {};

    if (needsContentMigration(doc)) {
      const description = String(doc.description ?? "");
      const content = migrateSingleFieldContent(description);
      set.content = content;
      set.summary =
        typeof doc.summary === "string" && doc.summary.trim()
          ? doc.summary
          : deriveSummary(description);
      set.readingTimeMinutes = computeReadingTimeMinutes(content);
      unset.description = "";
      migrated += 1;
    }

    await LabsProject.updateOne(
      { _id: doc._id },
      { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) },
    );
  }
  console.log(`LabsProject: migrated ${migrated} of ${docs.length} document(s).`);
}

async function migrateBlueprints() {
  const docs = await Blueprint.find({}).lean<LegacyDoc[]>();
  let migrated = 0;
  for (const doc of docs) {
    const set: Record<string, unknown> = { ...backfillCardFields(doc) };
    const unset: Record<string, string> = {};

    if (needsContentMigration(doc)) {
      const description = String(doc.description ?? "");
      const customizationNotes =
        typeof doc.customizationNotes === "string" ? doc.customizationNotes : undefined;
      const content = migrateBlueprintContent({ description, customizationNotes });
      set.content = content;
      set.summary =
        typeof doc.summary === "string" && doc.summary.trim()
          ? doc.summary
          : deriveSummary(description);
      set.readingTimeMinutes = computeReadingTimeMinutes(content);
      unset.description = "";
      unset.customizationNotes = "";
      migrated += 1;
    }

    await Blueprint.updateOne(
      { _id: doc._id },
      { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) },
    );
  }
  console.log(`Blueprint: migrated ${migrated} of ${docs.length} document(s).`);
}

async function migrateNotes() {
  const docs = await Note.find({}).lean<LegacyDoc[]>();
  let migrated = 0;
  for (const doc of docs) {
    const set: Record<string, unknown> = { ...backfillCardFields(doc) };
    const unset: Record<string, string> = {};

    if (needsContentMigration(doc)) {
      const body = String(doc.body ?? "");
      const content = migrateSingleFieldContent(body);
      set.content = content;
      set.readingTimeMinutes = computeReadingTimeMinutes(content);
      unset.body = "";
      migrated += 1;
    }

    await Note.updateOne(
      { _id: doc._id },
      { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) },
    );
  }
  console.log(`Note: migrated ${migrated} of ${docs.length} document(s).`);
}

async function main() {
  await connectToDatabase();
  await migrateCaseStudies();
  await migrateBuilds();
  await migrateLabsProjects();
  await migrateBlueprints();
  await migrateNotes();
  process.exit(0);
}

main().catch((error) => {
  console.error("Content-block migration failed:", error);
  process.exit(1);
});
