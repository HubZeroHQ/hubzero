import { blueprintRepository } from '@/lib/db/repositories/blueprint';
import { buildRepository } from '@/lib/db/repositories/build';
import { labRepository } from '@/lib/db/repositories/lab';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { teamRepository } from '@/lib/db/repositories/team';
import { userRepository } from '@/lib/db/repositories/user';
import { workRepository } from '@/lib/db/repositories/work';
import type { EntryReference, EvidenceOwnerType } from '@/types/studio';
import { toPlainOptions, toRelationOptions } from './relation-options';
import { splitEntriesByOwnerType } from './relation-fields';

/**
 * The option lists behind Note's relation pickers — technologies, the
 * author picker, the four Work/Build/Blueprint/Lab cross-reference pickers
 * that back `relatedEntries` (PLANNING.md §24: "Note → {Work, Build,
 * Blueprint, Lab}"), and Engineering contributors. Mirrors
 * `lab-relations.ts`'s shape; the only addition is `authorOptions`, since
 * Note is the first collection with an explicit author field distinct from
 * `createdByUserId` (§26.5).
 */
export async function getNoteRelationOptions() {
  const [technologies, users, work, builds, blueprints, labs, team] = await Promise.all([
    taxonomyRepository.findByKind('technology'),
    userRepository.list(),
    workRepository.list(),
    buildRepository.list(),
    blueprintRepository.list(),
    labRepository.list(),
    teamRepository.list(),
  ]);

  return {
    technologyOptions: toPlainOptions(technologies),
    authorOptions: users.map((entry) => ({ id: entry._id.toString(), label: entry.name })),
    workOptions: toRelationOptions(work, (entry) => entry.title),
    buildOptions: toRelationOptions(builds, (entry) => entry.title),
    blueprintOptions: toRelationOptions(blueprints, (entry) => entry.name),
    labOptions: toRelationOptions(labs, (entry) => entry.title),
    contributorOptions: toRelationOptions(team, (entry) => entry.name),
  };
}

/**
 * The single Work/Build/Blueprint/Lab ↔ form-field mapping shared by this
 * file's `splitRelatedEntries` and `lib/studio/actions/note.ts`'s
 * `readRelatedEntries` — the two directions of the same conversion, kept in
 * one place so a future related-owner type is never added to one side
 * without the other.
 */
export const RELATED_ENTRY_FIELDS: Array<{ key: EvidenceOwnerType; field: string }> = [
  { key: 'Work', field: 'relatedWorkIds' },
  { key: 'Build', field: 'relatedBuildIds' },
  { key: 'Blueprint', field: 'relatedBlueprintIds' },
  { key: 'Lab', field: 'relatedLabIds' },
];

/**
 * Splits Note's polymorphic `relatedEntries` (§24's generic evidence-link
 * shape, also used by `Service.evidenceLinks`) back into the four typed id
 * arrays `NoteForm`'s four `RelationMultiSelect` fields expect — the
 * inverse of `lib/studio/actions/note.ts`'s `readRelatedEntries`. Reusing
 * `RelationMultiSelect` four times means Notes needs no new mixed-type
 * picker component (PLANNING.md's "do not invent new infrastructure").
 */
export function splitRelatedEntries(relatedEntries: EntryReference[]): {
  relatedWorkIds: string[];
  relatedBuildIds: string[];
  relatedBlueprintIds: string[];
  relatedLabIds: string[];
} {
  return splitEntriesByOwnerType(relatedEntries, RELATED_ENTRY_FIELDS) as {
    relatedWorkIds: string[];
    relatedBuildIds: string[];
    relatedBlueprintIds: string[];
    relatedLabIds: string[];
  };
}
