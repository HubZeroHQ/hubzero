import 'server-only';

import { draftMode } from 'next/headers';

/**
 * The single place every public page checks whether it's being rendered for
 * a Studio editor's Draft Mode preview rather than a real visitor (Experience
 * v3 Preview Integrity milestone). Draft Mode's cookie is only ever set by
 * `/api/preview` after that route's own auth + entry-permission check —
 * nothing here re-derives or weakens that gate, it only reads the outcome.
 */
export async function isPreviewRequest(): Promise<boolean> {
  const { isEnabled } = await draftMode();
  return isEnabled;
}
