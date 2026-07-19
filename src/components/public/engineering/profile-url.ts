/**
 * `PublicEntityLink`/`PublicEntityLink`-shaped author/profile references only
 * carry a `url` (`/engineering/{slug}`), not the raw slug — every cross-site
 * consumer (About cards, Note/Work bylines, search, relationship rails)
 * derives the slug the same way, through this one function.
 */
export function slugFromProfileUrl(url: string): string | undefined {
  const match = /^\/engineering\/([^/]+)$/.exec(url);
  return match?.[1];
}
