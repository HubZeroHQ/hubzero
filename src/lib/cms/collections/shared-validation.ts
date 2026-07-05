import { z } from "zod";

import { emptyToUndefined } from "@/lib/utils";

/**
 * Validation shared across more than one collection's `reference`-type
 * field (`TeamMember.linkedUserId`, `Note.authorId`,
 * `Testimonial.linkedCaseStudy`, `Build.graduatedFromLabsId`, …) — every one
 * of them is the same shape: a 24-hex-char Mongo ObjectId string, since
 * `CmsField`'s `reference` case (`ARCHITECTURE/19_CMS_FOUNDATION.md` §6) is
 * a plain ID input until a searchable picker lands. Extracted here rather
 * than each collection re-deriving its own regex.
 */
const objectIdPattern = /^[a-f0-9]{24}$/i;

export function objectIdField(message = "Enter a valid ID.") {
  return z.string().trim().regex(objectIdPattern, message);
}

/** The optional counterpart — an empty reference field submits `""`, which should validate as "not set," not fail the ObjectId regex. */
export function optionalObjectIdField(message = "Enter a valid ID.") {
  return z.preprocess(emptyToUndefined, objectIdField(message).optional());
}
