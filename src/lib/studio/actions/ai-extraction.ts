'use server';

import { auth } from '@/lib/auth';
import { UnauthorizedError } from '@/lib/auth/permissions';

/**
 * Extracts plain text from a single uploaded reference file for the
 * "Generate content" panel's supporting-material upload (PLANNING.md §31).
 * Owner-agnostic and gated only on being signed in to the Studio — every
 * collection's generation surface shares this one action rather than each
 * owning its own file-reading endpoint. The extracted text is returned to
 * the client for that one generation request only; nothing here writes the
 * file or its text anywhere.
 */
export type ExtractFileTextResult =
  { ok: true; text: string; fileName: string } | { ok: false; error: string };

export async function extractReferenceFileTextAction(
  formData: FormData,
): Promise<ExtractFileTextResult> {
  const session = await auth();
  if (!session) {
    return { ok: false, error: new UnauthorizedError().message };
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { ok: false, error: 'No file was supplied.' };
  }

  if (file.name.length > 255) {
    return { ok: false, error: 'The file name is too long.' };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { ok: false, error: 'That file is larger than the 10MB reference-file limit.' };
  }

  // Imported lazily, and only here: the extraction module pulls in
  // pdf-parse/mammoth, heavy Node-native parsing libraries that must never
  // be evaluated just because this action exists on an import path (every
  // collection's document editor references it). Extraction is optional —
  // if the module fails to load, CRUD on the owning entry must keep
  // working regardless.
  let extraction: typeof import('@/lib/ai/extraction');
  try {
    extraction = await import('@/lib/ai/extraction');
  } catch {
    return { ok: false, error: 'AI extraction is currently unavailable.' };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extraction.extractTextFromFile(buffer, file.type, file.name);
    return { ok: true, text, fileName: file.name };
  } catch (error) {
    if (
      error instanceof extraction.FileTooLargeError ||
      error instanceof extraction.UnsupportedFileTypeError
    ) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Could not read that file.' };
  }
}
