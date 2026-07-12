import { describe, expect, it } from "vitest";

import { blocksArraySchema, blocksField, optionalBlocksField } from "@/lib/cms/blocks/schema";
import {
  collectBlockMediaIds,
  checkHtmlBlockPublishGuard,
  blocksContainHtml,
} from "@/lib/cms/blocks/guard";
import { computeReadingTimeMinutes, extractPlainText } from "@/lib/cms/blocks/text";
import {
  backfillCardFields,
  backfillTagAndReadingTime,
  deriveSummary,
  migrateBlueprintContent,
  migrateCaseStudyContent,
  migrateSingleFieldContent,
  needsContentMigration,
} from "@/lib/cms/blocks/legacy-migration";
import { CaseStudy } from "@/models/case-study";
import { User } from "@/models/user";
import type { Block, SimpleBlock } from "@/lib/cms/blocks/types";

const validMediaId = "507f1f77bcf86cd799439011";

describe("blocksArraySchema", () => {
  it("accepts a well-formed mixed block array", () => {
    const blocks = [
      { id: "1", type: "heading", data: { level: 2, text: "Hello" } },
      { id: "2", type: "paragraph", data: { text: "Some text." } },
      { id: "3", type: "divider", data: {} },
    ];
    expect(blocksArraySchema.safeParse(blocks).success).toBe(true);
  });

  it("rejects an empty array (a document needs at least one block)", () => {
    expect(blocksArraySchema.safeParse([]).success).toBe(false);
  });

  it("rejects a heading with empty text", () => {
    const blocks = [{ id: "1", type: "heading", data: { level: 2, text: "" } }];
    expect(blocksArraySchema.safeParse(blocks).success).toBe(false);
  });

  it("rejects an unknown block type", () => {
    const blocks = [{ id: "1", type: "carousel", data: {} }];
    expect(blocksArraySchema.safeParse(blocks).success).toBe(false);
  });

  it("rejects a twoColumn block whose column contains another twoColumn (no nesting)", () => {
    const blocks = [
      {
        id: "1",
        type: "twoColumn",
        data: {
          left: [{ id: "2", type: "twoColumn", data: { left: [], right: [] } }],
          right: [],
        },
      },
    ];
    expect(blocksArraySchema.safeParse(blocks).success).toBe(false);
  });

  it("accepts a twoColumn block whose columns contain simple blocks", () => {
    const blocks = [
      {
        id: "1",
        type: "twoColumn",
        data: {
          left: [{ id: "2", type: "paragraph", data: { text: "Left" } }],
          right: [{ id: "3", type: "paragraph", data: { text: "Right" } }],
        },
      },
    ];
    expect(blocksArraySchema.safeParse(blocks).success).toBe(true);
  });

  it("rejects an image block whose media id isn't a valid ObjectId", () => {
    const blocks = [
      { id: "1", type: "image", data: { media: "not-an-id", align: "center", width: "content" } },
    ];
    expect(blocksArraySchema.safeParse(blocks).success).toBe(false);
  });

  it("accepts an image block with a valid media id", () => {
    const blocks = [
      {
        id: "1",
        type: "image",
        data: { media: validMediaId, align: "center", width: "content" },
      },
    ];
    expect(blocksArraySchema.safeParse(blocks).success).toBe(true);
  });
});

describe("blocksField() — the FormData wire adapter", () => {
  const field = blocksField();

  it("parses a JSON-stringified block array (the hidden <input> wire format)", () => {
    const value = JSON.stringify([{ id: "1", type: "markdown", data: { markdown: "hi" } }]);
    const result = field.safeParse(value);
    expect(result.success).toBe(true);
  });

  it("treats an empty string as an empty array (which then fails the min-1 rule)", () => {
    const result = field.safeParse("");
    expect(result.success).toBe(false);
  });

  it("fails validation on malformed JSON rather than throwing", () => {
    const result = field.safeParse("{not valid json");
    expect(result.success).toBe(false);
  });

  it("passes an already-parsed array through unchanged", () => {
    const blocks = [{ id: "1", type: "markdown", data: { markdown: "hi" } }];
    const result = field.safeParse(blocks);
    expect(result.success).toBe(true);
  });
});

describe("optionalBlocksField() — Site Settings' legal pages, which may be empty", () => {
  const field = optionalBlocksField();

  it("accepts an empty string (unauthored yet) as an empty array", () => {
    const result = field.safeParse("");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual([]);
  });

  it("accepts an empty JSON array", () => {
    const result = field.safeParse("[]");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual([]);
  });

  it("still validates well-formed non-empty content the same way blocksField does", () => {
    const value = JSON.stringify([{ id: "1", type: "markdown", data: { markdown: "hi" } }]);
    expect(field.safeParse(value).success).toBe(true);
  });

  it("fails validation on malformed JSON rather than throwing", () => {
    expect(field.safeParse("{not valid json").success).toBe(false);
  });
});

describe("computeReadingTimeMinutes / extractPlainText", () => {
  it("returns at least 1 minute for short or empty content", () => {
    expect(computeReadingTimeMinutes([])).toBe(1);
    expect(computeReadingTimeMinutes(undefined)).toBe(1);
  });

  it("counts words across heading/paragraph/markdown/quote blocks, but not code/html/divider/spacer", () => {
    const blocks: Block[] = [
      { id: "1", type: "heading", data: { level: 2, text: "A heading here" } },
      { id: "2", type: "code", data: { code: "const x = " + "word ".repeat(500) } },
      { id: "3", type: "divider", data: {} },
    ];
    // Only the heading's 3 words should count — code/divider contribute nothing.
    expect(extractPlainText(blocks).trim().split(/\s+/)).toHaveLength(3);
  });

  it("recurses into twoColumn columns", () => {
    const blocks: Block[] = [
      {
        id: "1",
        type: "twoColumn",
        data: {
          left: [{ id: "2", type: "paragraph", data: { text: "left words here" } }],
          right: [{ id: "3", type: "paragraph", data: { text: "right words too" } }],
        },
      },
    ];
    expect(extractPlainText(blocks)).toContain("left words here");
    expect(extractPlainText(blocks)).toContain("right words too");
  });
});

describe("collectBlockMediaIds", () => {
  it("collects ids from image and gallery blocks, including inside twoColumn columns", () => {
    const blocks: Block[] = [
      { id: "1", type: "image", data: { media: "id1", align: "center", width: "content" } },
      { id: "2", type: "gallery", data: { media: ["id2", "id3"] } },
      {
        id: "3",
        type: "twoColumn",
        data: {
          left: [
            { id: "4", type: "image", data: { media: "id4", align: "left", width: "content" } },
          ],
          right: [],
        },
      },
    ];
    expect(collectBlockMediaIds(blocks).sort()).toEqual(["id1", "id2", "id3", "id4"].sort());
  });

  it("returns an empty array for content with no media references", () => {
    const blocks: Block[] = [{ id: "1", type: "paragraph", data: { text: "no images here" } }];
    expect(collectBlockMediaIds(blocks)).toEqual([]);
  });
});

describe("blocksContainHtml / checkHtmlBlockPublishGuard", () => {
  const withHtml: SimpleBlock[] = [{ id: "1", type: "html", data: { html: "<div>x</div>" } }];
  const withoutHtml: Block[] = [{ id: "1", type: "paragraph", data: { text: "safe" } }];

  it("detects an html block at the top level and nested inside twoColumn", () => {
    expect(blocksContainHtml(withHtml)).toBe(true);
    expect(blocksContainHtml(withoutHtml)).toBe(false);
    expect(
      blocksContainHtml([{ id: "1", type: "twoColumn", data: { left: withHtml, right: [] } }]),
    ).toBe(true);
  });

  it("blocks publish for a teammate but not for admin/head_admin", () => {
    expect(checkHtmlBlockPublishGuard(withHtml, "teammate")).toMatch(/Raw HTML/i);
    expect(checkHtmlBlockPublishGuard(withHtml, "admin")).toBeNull();
    expect(checkHtmlBlockPublishGuard(withHtml, "head_admin")).toBeNull();
  });

  it("never blocks publish when there's no html block, regardless of role", () => {
    expect(checkHtmlBlockPublishGuard(withoutHtml, "teammate")).toBeNull();
  });
});

describe("legacy-migration transforms (pure, DB-free)", () => {
  it("migrateCaseStudyContent produces one heading+markdown pair per non-empty legacy field", () => {
    const blocks = migrateCaseStudyContent({
      problem: "The problem.",
      approach: "The approach.",
      result: "",
    });
    expect(blocks).toHaveLength(4); // problem heading+markdown, approach heading+markdown
    expect(blocks.map((b) => b.type)).toEqual(["heading", "markdown", "heading", "markdown"]);
  });

  it("migrateSingleFieldContent wraps non-empty text in exactly one markdown block", () => {
    expect(migrateSingleFieldContent("hello")).toHaveLength(1);
    expect(migrateSingleFieldContent("")).toHaveLength(0);
    expect(migrateSingleFieldContent(undefined)).toHaveLength(0);
  });

  it("migrateBlueprintContent appends a Customization Notes section only when present", () => {
    const withNotes = migrateBlueprintContent({ description: "Desc", customizationNotes: "Notes" });
    expect(withNotes).toHaveLength(3); // markdown(desc), heading, markdown(notes)

    const withoutNotes = migrateBlueprintContent({ description: "Desc" });
    expect(withoutNotes).toHaveLength(1);
  });

  it("deriveSummary takes the first non-empty line, truncated if needed", () => {
    expect(deriveSummary("First line.\nSecond line.")).toBe("First line.");
    expect(deriveSummary("")).toBe("Summary needed — please edit.");
    expect(deriveSummary("x".repeat(400), 10).length).toBeLessThanOrEqual(10);
  });

  it("needsContentMigration is idempotent — a document with content is never re-migrated", () => {
    expect(needsContentMigration({})).toBe(true);
    expect(needsContentMigration({ content: [] })).toBe(true);
    expect(needsContentMigration({ content: [{ id: "1", type: "markdown", data: {} }] })).toBe(
      false,
    );
  });

  it("backfillCardFields defaults contributors/featured for a document that predates either field", () => {
    expect(backfillCardFields({})).toEqual({ contributors: [], featured: false });
    expect(backfillCardFields({ contributors: undefined, featured: undefined })).toEqual({
      contributors: [],
      featured: false,
    });
    expect(backfillCardFields({ contributors: ["id1"], featured: true })).toEqual({
      contributors: ["id1"],
      featured: true,
    });
  });

  describe("backfillTagAndReadingTime", () => {
    it("defaults a missing tag field to [] and computes readingTimeMinutes when it's missing", () => {
      const set: Record<string, unknown> = {};
      const doc = {
        content: [{ id: "b1", type: "markdown", data: { markdown: "word ".repeat(250) } }],
      };
      backfillTagAndReadingTime(set, doc, "techTags");
      expect(set.techTags).toEqual([]);
      expect(set.readingTimeMinutes).toBe(2); // 250 words / 200wpm, rounded up
    });

    it("leaves an already-correct tag array and readingTimeMinutes untouched when content didn't change", () => {
      const set: Record<string, unknown> = {};
      const doc = {
        content: [{ id: "b1", type: "markdown", data: {} }],
        techTags: ["Go"],
        readingTimeMinutes: 7,
      };
      backfillTagAndReadingTime(set, doc, "techTags");
      expect(set.techTags).toBeUndefined();
      expect(set.readingTimeMinutes).toBeUndefined();
    });

    it("recomputes readingTimeMinutes when `set.content` was just written by a content migration, even if the old value looked valid", () => {
      const set: Record<string, unknown> = {
        content: [{ id: "b1", type: "markdown", data: { markdown: "word ".repeat(10) } }],
      };
      const doc = { content: [], readingTimeMinutes: 7 };
      backfillTagAndReadingTime(set, doc, "tags");
      expect(set.readingTimeMinutes).toBe(1);
    });
  });
});

describe("a document written before contributors/featured existed", () => {
  it("reads back with contributors/featured undefined via .lean() — the exact hazard the migration backfill exists to close", async () => {
    const user = await User.create({
      email: "legacy-doc-author@example.com",
      name: "Legacy Author",
      passwordHash: "unused-in-tests",
      role: "admin",
      sessionVersion: 0,
    });

    // Bypasses Mongoose entirely (no schema defaults applied) — this is what
    // a document written before this schema change actually looks like in
    // MongoDB: `contributors`/`featured` are simply absent keys, not `[]`/
    // `false`. `.create()` would apply schema defaults and mask this case.
    await CaseStudy.collection.insertOne({
      slug: "legacy-doc-no-card-fields",
      client: "Legacy Client",
      industry: "Legacy",
      practiceArea: "software",
      summary: "A legacy document.",
      content: [{ id: "b1", type: "markdown", data: { markdown: "Body." } }],
      status: "published",
      version: 0,
      createdBy: user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const doc = await CaseStudy.findOne({ slug: "legacy-doc-no-card-fields" }).lean();
    expect(doc?.contributors).toBeUndefined();
    expect(doc?.featured).toBeUndefined();

    // The read-site defense every public/studio page applies
    // (`(doc.contributors ?? []).map(...)`) must not throw here.
    expect(() => (doc?.contributors ?? []).map((id) => String(id))).not.toThrow();

    // And the migration's backfill produces the correct schema-default shape.
    expect(backfillCardFields(doc ?? {})).toEqual({ contributors: [], featured: false });
  });
});
