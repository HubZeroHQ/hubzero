import { describe, expect, it } from 'vitest';
import { MAX_IMAGE_UPLOAD_BYTES, validateImageFile } from './upload-client';

function fileOf(name: string, type: string, sizeBytes: number): File {
  // `File`'s constructor sizes itself from its content, so a Blob of the
  // exact requested byte length is built rather than passing `size` directly
  // (which the constructor doesn't accept).
  return new File([new Uint8Array(sizeBytes)], name, { type });
}

describe('validateImageFile', () => {
  it('accepts a normal image under the size limit', () => {
    expect(validateImageFile(fileOf('photo.png', 'image/png', 1024))).toBeNull();
  });

  it("rejects a non-image file, even one dragged in past the file picker's accept filter", () => {
    expect(validateImageFile(fileOf('resume.pdf', 'application/pdf', 1024))).toBe(
      'Only image files are supported.',
    );
  });

  it('rejects a file with no detectable type', () => {
    expect(validateImageFile(fileOf('unknown', '', 1024))).toBe('Only image files are supported.');
  });

  it('rejects an image over the size limit', () => {
    expect(validateImageFile(fileOf('huge.png', 'image/png', MAX_IMAGE_UPLOAD_BYTES + 1))).toBe(
      'Images must be smaller than 10MB.',
    );
  });

  it('accepts an image exactly at the size limit', () => {
    expect(validateImageFile(fileOf('exact.png', 'image/png', MAX_IMAGE_UPLOAD_BYTES))).toBeNull();
  });
});
