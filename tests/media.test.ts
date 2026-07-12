import sharp from "sharp";
import { beforeAll, describe, expect, it } from "vitest";

import "@/lib/cms/collections";

import {
  MediaInUseError,
  deleteMedia,
  getMediaUsage,
  listMedia,
  renameMedia,
  replaceMedia,
  uploadMedia,
} from "@/lib/cms/media";
import { CaseStudy } from "@/models/case-study";
import { User } from "@/models/user";
import { Types } from "mongoose";

let uploaderId: string;

beforeAll(async () => {
  const user = await User.create({
    email: "uploader@example.com",
    name: "Uploader",
    passwordHash: "unused",
    role: "admin",
    sessionVersion: 0,
  });
  uploaderId = user._id.toString();
});

async function pngBuffer(color: { r: number; g: number; b: number }): Promise<Buffer> {
  return sharp({ create: { width: 20, height: 20, channels: 3, background: color } })
    .png()
    .toBuffer();
}

describe("uploadMedia", () => {
  it("uploads an image via the storage adapter and records real metadata", async () => {
    const buffer = await pngBuffer({ r: 255, g: 0, b: 0 });
    const media = await uploadMedia({
      buffer,
      originalName: "red.png",
      mimeType: "image/png",
      alt: "A solid red square",
      uploadedBy: uploaderId,
    });

    expect(media.id).toBeTruthy();
    expect(media.alt).toBe("A solid red square");
    expect(media.mimeType).toBe("image/png");
    expect(media.width).toBe(20);
    expect(media.format).toBe("png");
    expect(media.resourceType).toBe("image");
    // No Cloudinary credentials in the test environment — falls back to
    // local disk storage automatically (`lib/cms/storage/index.ts`).
    expect(media.provider).toBe("local");
    expect(media.secureUrl).toMatch(/^\/api\/media\//);
  });

  it("deduplicates identical bytes by content hash instead of storing a second copy", async () => {
    const buffer = await pngBuffer({ r: 0, g: 255, b: 0 });
    const first = await uploadMedia({
      buffer,
      originalName: "green.png",
      mimeType: "image/png",
      alt: "First alt text",
      uploadedBy: uploaderId,
    });
    const second = await uploadMedia({
      buffer,
      originalName: "green-again.png",
      mimeType: "image/png",
      alt: "This alt text should be ignored — the existing record wins",
      uploadedBy: uploaderId,
    });

    expect(second.id).toBe(first.id);
    expect(second.alt).toBe("First alt text");

    const found = await listMedia({ q: "green" });
    expect(found.items.filter((item) => item.id === first.id)).toHaveLength(1);
  });

  it("rejects an unsupported mime type", async () => {
    await expect(
      uploadMedia({
        buffer: Buffer.from("not an image"),
        originalName: "file.exe",
        mimeType: "application/x-msdownload",
        alt: "Should be rejected",
        uploadedBy: uploaderId,
      }),
    ).rejects.toThrow(/unsupported file type/i);
  });

  it("requires alt text", async () => {
    const buffer = await pngBuffer({ r: 0, g: 0, b: 255 });
    await expect(
      uploadMedia({
        buffer,
        originalName: "blue.png",
        mimeType: "image/png",
        alt: "   ",
        uploadedBy: uploaderId,
      }),
    ).rejects.toThrow(/alt text/i);
  });
});

describe("getMediaUsage / deleteMedia", () => {
  it("blocks deletion while a collection references the media, and allows it once the reference is removed", async () => {
    const buffer = await pngBuffer({ r: 10, g: 20, b: 30 });
    const media = await uploadMedia({
      buffer,
      originalName: "cover.png",
      mimeType: "image/png",
      alt: "Cover image",
      uploadedBy: uploaderId,
    });

    expect(await getMediaUsage(media.id)).toEqual([]);

    const caseStudy = await CaseStudy.create({
      slug: "media-usage-test",
      client: "Test Client",
      industry: "Test",
      practiceArea: "software",
      summary: "A test case study.",
      content: [{ id: "b1", type: "markdown", data: { markdown: "Body." } }],
      coverImage: new Types.ObjectId(media.id),
      status: "draft",
      version: 0,
      createdBy: new Types.ObjectId(uploaderId),
    });

    const usage = await getMediaUsage(media.id);
    expect(usage).toEqual([{ resource: "caseStudy", label: "Case Studies", count: 1 }]);

    await expect(deleteMedia(media.id)).rejects.toThrow(MediaInUseError);

    await CaseStudy.findByIdAndDelete(caseStudy._id);

    await expect(deleteMedia(media.id)).resolves.toBeUndefined();

    // Soft-deleted — no longer returned by the picker/library's list.
    const afterDelete = await listMedia({ q: "cover" });
    expect(afterDelete.items.find((item) => item.id === media.id)).toBeUndefined();
  });

  it("finds media referenced only inside a block's data (an Image block), not just a top-level image field", async () => {
    const buffer = await pngBuffer({ r: 40, g: 50, b: 60 });
    const media = await uploadMedia({
      buffer,
      originalName: "in-block.png",
      mimeType: "image/png",
      alt: "Referenced only from inside a content block",
      uploadedBy: uploaderId,
    });

    expect(await getMediaUsage(media.id)).toEqual([]);

    const caseStudy = await CaseStudy.create({
      slug: "media-in-block-test",
      client: "Test Client",
      industry: "Test",
      practiceArea: "software",
      summary: "A test case study.",
      content: [
        { id: "b1", type: "image", data: { media: media.id, align: "center", width: "content" } },
      ],
      status: "draft",
      version: 0,
      createdBy: new Types.ObjectId(uploaderId),
    });

    const usage = await getMediaUsage(media.id);
    expect(usage).toEqual([{ resource: "caseStudy", label: "Case Studies", count: 1 }]);

    await expect(deleteMedia(media.id)).rejects.toThrow(MediaInUseError);

    await CaseStudy.findByIdAndDelete(caseStudy._id);
    await expect(deleteMedia(media.id)).resolves.toBeUndefined();
  });
});

describe("renameMedia / replaceMedia", () => {
  it("updates alt/caption/originalName without changing the underlying asset", async () => {
    const buffer = await pngBuffer({ r: 70, g: 80, b: 90 });
    const media = await uploadMedia({
      buffer,
      originalName: "original-name.png",
      mimeType: "image/png",
      alt: "Original alt",
      uploadedBy: uploaderId,
    });

    const renamed = await renameMedia(media.id, {
      originalName: "renamed.png",
      alt: "Updated alt",
      caption: "A new caption",
    });

    expect(renamed.id).toBe(media.id);
    expect(renamed.originalName).toBe("renamed.png");
    expect(renamed.alt).toBe("Updated alt");
    expect(renamed.caption).toBe("A new caption");
    expect(renamed.publicId).toBe(media.publicId);
  });

  it("replaces the asset in place — same id, new bytes/metadata", async () => {
    const original = await pngBuffer({ r: 100, g: 110, b: 120 });
    const media = await uploadMedia({
      buffer: original,
      originalName: "before.png",
      mimeType: "image/png",
      alt: "Before replace",
      uploadedBy: uploaderId,
    });

    const replacement = await sharp({
      create: { width: 40, height: 40, channels: 3, background: { r: 5, g: 5, b: 5 } },
    })
      .png()
      .toBuffer();

    const replaced = await replaceMedia(media.id, {
      buffer: replacement,
      originalName: "after.png",
      mimeType: "image/png",
    });

    expect(replaced.id).toBe(media.id);
    expect(replaced.width).toBe(40);
    expect(replaced.originalName).toBe("after.png");
    // A different-sized image hashes to a different publicId — the document
    // itself is reused (same `_id`), but it now points at a new asset.
    expect(replaced.publicId).not.toBe(media.publicId);
  });
});
