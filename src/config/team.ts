/**
 * PLANNING.md §26.6 — default Team groups for the /about roster. `Team.group`
 * stays a plain `string` in the schema deliberately (§26.6: "adjustable, not
 * hardcoded"); this list is only the CMS picker's starting set, not a closed
 * enum an admin is locked into.
 */
export const DEFAULT_TEAM_GROUPS = ['Founders', 'Operating Team', 'Engineering Team'] as const;
