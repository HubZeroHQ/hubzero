import { describe, expect, it } from "vitest";

import { collectDiffMediaIds, diffObjects, diffWords } from "@/lib/cms/diff";
import type { FieldConfig } from "@/types/cms";

const formFields: FieldConfig[] = [
  { name: "title", label: "Title", type: "text" },
  { name: "bio", label: "Bio", type: "richtext" },
  { name: "coverImage", label: "Cover image", type: "image" },
  { name: "gallery", label: "Gallery", type: "imageArray" },
  { name: "content", label: "Content", type: "blocks" },
];

describe("diffObjects — simple fields", () => {
  it("marks a field added when it only exists after", () => {
    const diffs = diffObjects({}, { title: "Hello" }, formFields);
    const title = diffs.find((d) => d.key === "title")!;
    expect(title.status).toBe("added");
    expect(title.kind).toBe("simple");
  });

  it("marks a field removed when it only existed before", () => {
    const diffs = diffObjects({ title: "Hello" }, {}, formFields);
    const title = diffs.find((d) => d.key === "title")!;
    expect(title.status).toBe("removed");
  });

  it("marks a field unchanged when before/after are deeply equal regardless of key order", () => {
    const diffs = diffObjects(
      { title: "Hello", nested: { a: 1, b: 2 } },
      { nested: { b: 2, a: 1 }, title: "Hello" },
      formFields,
    );
    const title = diffs.find((d) => d.key === "title")!;
    expect(title.status).toBe("unchanged");
  });

  it("ignores managed fields (_id, version, timestamps, etc.)", () => {
    const diffs = diffObjects(
      { _id: "a", version: 1, title: "Old" },
      { _id: "b", version: 2, title: "New" },
      formFields,
    );
    expect(diffs.find((d) => d.key === "_id")).toBeUndefined();
    expect(diffs.find((d) => d.key === "version")).toBeUndefined();
  });
});

describe("diffObjects — richtext fields", () => {
  it("produces a word-level diff for a changed richtext field", () => {
    const diffs = diffObjects(
      { bio: "The quick brown fox jumps." },
      { bio: "The quick red fox leaps." },
      formFields,
    );
    const bio = diffs.find((d) => d.key === "bio")!;
    expect(bio.kind).toBe("richtext");
    expect(bio.status).toBe("changed");
    expect(bio.wordDiff).not.toBeNull();
    const deleted = bio.wordDiff!.filter((p) => p.op === "delete").map((p) => p.text);
    const inserted = bio.wordDiff!.filter((p) => p.op === "insert").map((p) => p.text);
    expect(deleted.join("")).toContain("brown");
    expect(deleted.join("")).toContain("jumps");
    expect(inserted.join("")).toContain("red");
    expect(inserted.join("")).toContain("leaps");
  });

  it("does not compute a word diff for an unchanged richtext field", () => {
    const diffs = diffObjects({ bio: "Same." }, { bio: "Same." }, formFields);
    const bio = diffs.find((d) => d.key === "bio")!;
    expect(bio.status).toBe("unchanged");
    expect(bio.wordDiff).toBeUndefined();
  });
});

describe("diffWords", () => {
  it("returns a single equal part for identical strings", () => {
    expect(diffWords("hello world", "hello world")).toEqual([{ op: "equal", text: "hello world" }]);
  });

  it("preserves original spacing when reassembled", () => {
    const parts = diffWords("a  b", "a  c")!;
    const before = parts.filter((p) => p.op !== "insert").map((p) => p.text);
    const after = parts.filter((p) => p.op !== "delete").map((p) => p.text);
    expect(before.join("")).toBe("a  b");
    expect(after.join("")).toBe("a  c");
  });

  it("bails out (returns null) for excessively large input rather than hanging", () => {
    const huge = Array.from({ length: 900 }, (_, i) => `word${i}`).join(" ");
    expect(diffWords(huge, `${huge} more`)).toBeNull();
  });
});

describe("diffObjects — image fields", () => {
  it("reports before/after media ids for a changed image field", () => {
    const diffs = diffObjects({ coverImage: "media-old" }, { coverImage: "media-new" }, formFields);
    const cover = diffs.find((d) => d.key === "coverImage")!;
    expect(cover.kind).toBe("image");
    expect(cover.status).toBe("changed");
    expect(collectDiffMediaIds(diffs)).toEqual(expect.arrayContaining(["media-old", "media-new"]));
  });
});

describe("diffObjects — imageArray fields", () => {
  it("collects every referenced media id across before and after", () => {
    const diffs = diffObjects({ gallery: ["a", "b"] }, { gallery: ["b", "c"] }, formFields);
    const gallery = diffs.find((d) => d.key === "gallery")!;
    expect(gallery.kind).toBe("imageArray");
    expect(collectDiffMediaIds(diffs).sort()).toEqual(["a", "b", "c"]);
  });
});

describe("diffObjects — blocks fields", () => {
  it("detects added, removed, changed, unchanged, and moved blocks by id", () => {
    const before = {
      content: [
        { id: "1", type: "heading", data: { level: 2, text: "Intro" } },
        { id: "2", type: "paragraph", data: { text: "Old body text." } },
        { id: "3", type: "paragraph", data: { text: "Stays the same." } },
        { id: "4", type: "paragraph", data: { text: "Will be removed." } },
      ],
    };
    const after = {
      content: [
        { id: "3", type: "paragraph", data: { text: "Stays the same." } },
        { id: "1", type: "heading", data: { level: 2, text: "Intro" } },
        { id: "2", type: "paragraph", data: { text: "New body text." } },
        { id: "5", type: "paragraph", data: { text: "Brand new block." } },
      ],
    };

    const diffs = diffObjects(before, after, formFields);
    const content = diffs.find((d) => d.key === "content")!;
    expect(content.kind).toBe("blocks");
    const blocks = content.blocks!;

    const byId = new Map(blocks.map((b) => [b.id, b]));
    expect(byId.get("4")!.status).toBe("removed");
    expect(byId.get("5")!.status).toBe("added");
    expect(byId.get("2")!.status).toBe("changed");
    expect(byId.get("2")!.textDiff).not.toBeNull();
    // Added/removed blocks still get a `textDiff` (a single insert/delete
    // part) — the diff view renders one consistent word-diff regardless of
    // status, rather than falling back to a raw JSON dump for these two.
    expect(byId.get("4")!.textDiff).toEqual([{ op: "delete", text: "Will be removed." }]);
    expect(byId.get("5")!.textDiff).toEqual([{ op: "insert", text: "Brand new block." }]);
    // "3" moved ahead of "1" — same content, so status stays unchanged but
    // `moved` is true; "1" itself keeps its relative order and isn't moved.
    expect(byId.get("3")!.moved).toBe(true);
    expect(byId.get("3")!.status).toBe("unchanged");
    expect(byId.get("1")!.moved).toBe(false);
    expect(byId.get("1")!.status).toBe("unchanged");
  });

  it("collects media ids referenced by image/gallery blocks for batched resolution", () => {
    const before = {
      content: [
        { id: "1", type: "image", data: { media: "media-a", align: "center", width: "content" } },
      ],
    };
    const after = {
      content: [
        { id: "1", type: "image", data: { media: "media-b", align: "center", width: "content" } },
        { id: "2", type: "gallery", data: { media: ["media-c", "media-d"] } },
      ],
    };
    const diffs = diffObjects(before, after, formFields);
    expect(collectDiffMediaIds(diffs).sort()).toEqual(["media-a", "media-b", "media-c", "media-d"]);
  });

  it("returns an empty diff for a field with no changes at all", () => {
    const doc = { content: [{ id: "1", type: "paragraph", data: { text: "Same." } }] };
    const diffs = diffObjects(doc, doc, formFields);
    const content = diffs.find((d) => d.key === "content")!;
    expect(content.status).toBe("unchanged");
    expect(content.blocks).toBeUndefined();
  });
});
