import { NextResponse } from "next/server";

import { localStorageAdapter } from "@/lib/cms/storage/local-adapter";

/**
 * Streams a media file from local disk — the fallback-only serving path used
 * when Cloudinary isn't configured (`lib/cms/storage/index.ts`). Cloudinary-
 * backed `Media` documents are served directly from `secureUrl` (Cloudinary's
 * own CDN) and never touch this route; this imports `localStorageAdapter`
 * directly rather than `getStorageAdapter()` because this route is inherently
 * local-storage infrastructure, not a generic media-serving path.
 *
 * Content-hash-derived filenames (`lib/cms/media.ts`) never change once
 * written, so a long, immutable cache lifetime is correct — a re-upload of
 * different content always produces a different key, never a stale cache hit.
 */

const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
};

interface RouteParams {
  params: Promise<{ key: string[] }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { key } = await params;

  // A media key is always a single flat filename segment (see
  // `local-adapter.ts`'s own guard) — more than one segment or a traversal
  // attempt is malformed input, not a valid lookup.
  if (key.length !== 1 || !key[0]) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const filename = key[0];
  const extension = filename.split(".").pop() ?? "";
  const contentType = EXT_MIME[extension];
  if (!contentType) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const data = await localStorageAdapter.read(filename);
  if (!data) {
    // Distinct from the malformed-key 404s above: the key is well-formed and
    // presumably still referenced by a `Media` document, but the storage
    // adapter has no bytes for it — local disk storage isn't shared across
    // environments or deploys (`storage/local-adapter.ts`), so a `Media` row
    // written elsewhere (another machine, a wiped container) reliably 404s
    // here. Logged so this reads as "expected given the storage model," not
    // an unexplained one-off — see `ARCHITECTURE` notes on the local adapter.
    console.warn(`[media route] No file for key "${filename}" — Media record may be stale.`);
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
