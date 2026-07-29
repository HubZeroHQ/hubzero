import { buildRepository } from '@/lib/db/repositories/build';
import { labRepository } from '@/lib/db/repositories/lab';
import { noteRepository } from '@/lib/db/repositories/note';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { teamRepository } from '@/lib/db/repositories/team';
import { workRepository } from '@/lib/db/repositories/work';
import type { CareerEntryReference, CareerEvidenceOwnerType } from '@/types/studio';
import { toPlainOptions, toRelationOptions } from './relation-options';
import { splitEntriesByOwnerType } from './relation-fields';

/**
 * The option lists behind a Career listing's relation pickers — technologies,
 * the hiring-manager picker (a single Team reference, mirroring
 * `EngineeringProfile.teamMemberId`, not a `RelationMultiSelect`), and the
 * Work/Build/Lab/Note cross-reference pickers that back `relatedEntries`.
 * Mirrors `note-relations.ts`'s shape.
 */
export async function getCareerRelationOptions() {
  const [technologies, team, work, builds, labs, notes] = await Promise.all([
    taxonomyRepository.findByKind('technology'),
    teamRepository.list(),
    workRepository.list(),
    buildRepository.list(),
    labRepository.list(),
    noteRepository.list(),
  ]);

  return {
    technologyOptions: toPlainOptions(technologies),
    hiringManagerOptions: toRelationOptions(team, (entry) => entry.name),
    workOptions: toRelationOptions(work, (entry) => entry.title),
    buildOptions: toRelationOptions(builds, (entry) => entry.title),
    labOptions: toRelationOptions(labs, (entry) => entry.title),
    noteOptions: toRelationOptions(notes, (entry) => entry.title),
  };
}

/**
 * The single Work/Build/Lab/Note ↔ form-field mapping shared by this file's
 * `splitCareerRelatedEntries` and `lib/studio/actions/career.ts`'s
 * `readCareerRelatedEntries` — the two directions of the same conversion,
 * kept in one place per `note-relations.ts`'s own precedent.
 */
export const CAREER_RELATED_ENTRY_FIELDS: Array<{ key: CareerEvidenceOwnerType; field: string }> = [
  { key: 'Work', field: 'relatedWorkIds' },
  { key: 'Build', field: 'relatedBuildIds' },
  { key: 'Lab', field: 'relatedLabIds' },
  { key: 'Note', field: 'relatedNoteIds' },
];

/**
 * Splits a Career listing's polymorphic `relatedEntries` back into the four
 * typed id arrays `CareerForm`'s four `RelationMultiSelect` fields expect —
 * the inverse of `lib/studio/actions/career.ts`'s `readCareerRelatedEntries`.
 */
export function splitCareerRelatedEntries(relatedEntries: CareerEntryReference[]): {
  relatedWorkIds: string[];
  relatedBuildIds: string[];
  relatedLabIds: string[];
  relatedNoteIds: string[];
} {
  return splitEntriesByOwnerType(relatedEntries, CAREER_RELATED_ENTRY_FIELDS) as {
    relatedWorkIds: string[];
    relatedBuildIds: string[];
    relatedLabIds: string[];
    relatedNoteIds: string[];
  };
}
