/**
 * A small, dependency-free subsequence fuzzy matcher for the command palette
 * (`components/admin/command-palette/command-palette.tsx`) and public search
 * (Phase G). Deliberately hand-rolled rather than a library (`cmdk`/`fuse.js`)
 * — this is a few dozen lines doing one job, not the kind of mature,
 * hard-to-get-right infrastructure (auth/richtext/uploads/validation) this
 * codebase reserves third-party dependencies for.
 *
 * Every character of `query` must appear in `target`, in order, but not
 * necessarily contiguously (`"cst"` matches `"Case Study"`). Returns `null`
 * for no match, otherwise a score where higher is a better match — consecutive
 * matched characters and matches near the start of the string score higher,
 * so `"case"` ranks `"Case Study"` above `"Bhatkal Case Files"`.
 */
export function fuzzyScore(query: string, target: string): number | null {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const t = target.toLowerCase();

  let score = 0;
  let targetIndex = 0;
  let consecutiveRun = 0;

  for (let queryIndex = 0; queryIndex < q.length; queryIndex++) {
    const char = q[queryIndex];
    const foundAt = t.indexOf(char!, targetIndex);
    if (foundAt === -1) return null;

    consecutiveRun = foundAt === targetIndex ? consecutiveRun + 1 : 1;
    score += 10 - Math.min(foundAt - targetIndex, 5); // reward tight gaps
    score += consecutiveRun * 3; // reward consecutive runs
    if (foundAt === 0) score += 5; // reward matching at the very start

    targetIndex = foundAt + 1;
  }

  // Shorter targets that still match the whole query are more likely the
  // "obvious" result (an exact/near-exact label) than a long one the query
  // just happens to be a subsequence of.
  score -= t.length * 0.1;

  return score;
}

export interface FuzzyRankable {
  label: string;
}

/** Filters + sorts `items` by `fuzzyScore(query, item.label)`, best first. Returns `items` unranked (original order) when `query` is empty. */
export function fuzzyRank<T extends FuzzyRankable>(items: T[], query: string): T[] {
  if (!query.trim()) return items;
  return items
    .map((item) => ({ item, score: fuzzyScore(query, item.label) }))
    .filter((entry): entry is { item: T; score: number } => entry.score !== null)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);
}
