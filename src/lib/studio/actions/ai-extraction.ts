'use server';

import {
  extractTextFromFile,
  FileTooLargeError,
  UnsupportedFileTypeError,
} from '@/lib/ai/extraction';
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

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromFile(buffer, file.type, file.name);
    return { ok: true, text, fileName: file.name };
  } catch (error) {
    if (error instanceof FileTooLargeError || error instanceof UnsupportedFileTypeError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: 'Could not read that file.' };
  }
}
