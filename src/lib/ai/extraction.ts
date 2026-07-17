import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

/**
 * Server-side text extraction for uploaded reference documents (PLANNING.md
 * §31: "Markdown, PDF, DOCX, TXT, and similar technical/reference
 * documents"). Extracted text is used purely as generation context for one
 * request — callers must never persist the source file or this extracted
 * text as Media (§26.10); it is discarded once the generation request
 * completes.
 */

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_EXTRACTED_CHARS = 20_000;

export class UnsupportedFileTypeError extends Error {
  constructor(mimeType: string) {
    super(`"${mimeType}" isn't a supported reference file type.`);
    this.name = 'UnsupportedFileTypeError';
  }
}

export class FileTooLargeError extends Error {
  constructor() {
    super('That file is larger than the 10MB reference-file limit.');
    this.name = 'FileTooLargeError';
  }
}

function truncate(text: string): string {
  return text.length > MAX_EXTRACTED_CHARS
    ? `${text.slice(0, MAX_EXTRACTED_CHARS)}\n…(truncated)`
    : text;
}

/** Extracts plain text from a single uploaded reference file, by MIME type. Never writes the file anywhere — the buffer lives only for the duration of this call. */
export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
): Promise<string> {
  if (buffer.byteLength > MAX_FILE_BYTES) {
    throw new FileTooLargeError();
  }

  if (mimeType === 'text/plain' || mimeType === 'text/markdown' || fileName.endsWith('.md')) {
    return truncate(buffer.toString('utf-8'));
  }

  if (mimeType === 'application/pdf') {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return truncate(result.text);
    } finally {
      await parser.destroy();
    }
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return truncate(result.value);
  }

  throw new UnsupportedFileTypeError(mimeType);
}
