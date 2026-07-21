import { blueprintRepository } from '@/lib/db/repositories/blueprint';
import { buildRepository } from '@/lib/db/repositories/build';
import { labRepository } from '@/lib/db/repositories/lab';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { teamRepository } from '@/lib/db/repositories/team';
import { userRepository } from '@/lib/db/repositories/user';
import { workRepository } from '@/lib/db/repositories/work';
import type { EntryReference, EvidenceOwnerType } from '@/types/studio';

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
    technologyOptions: technologies.map((entry) => ({
      id: entry._id.toString(),
      label: entry.label,
    })),
    authorOptions: users.map((entry) => ({ id: entry._id.toString(), label: entry.name })),
    workOptions: work.map((entry) => ({
      id: entry._id.toString(),
      label: entry.title,
      referenceId: entry.referenceId,
    })),
    buildOptions: builds.map((entry) => ({
      id: entry._id.toString(),
      label: entry.title,
      referenceId: entry.referenceId,
    })),
    blueprintOptions: blueprints.map((entry) => ({
      id: entry._id.toString(),
      label: entry.name,
      referenceId: entry.referenceId,
    })),
    labOptions: labs.map((entry) => ({
      id: entry._id.toString(),
      label: entry.title,
      referenceId: entry.referenceId,
    })),
    contributorOptions: team.map((entry) => ({
      id: entry._id.toString(),
      label: entry.name,
      referenceId: entry.referenceId,
    })),
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
  const result = {
    relatedWorkIds: [] as string[],
    relatedBuildIds: [] as string[],
    relatedBlueprintIds: [] as string[],
    relatedLabIds: [] as string[],
  };

  for (const { key, field } of RELATED_ENTRY_FIELDS) {
    result[field as keyof typeof result] = relatedEntries
      .filter((entry) => entry.ownerType === key)
      .map((entry) => entry.ownerId.toString());
  }

  return result;
}
