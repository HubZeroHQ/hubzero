import { blueprintRepository } from '@/lib/db/repositories/blueprint';
import { buildRepository } from '@/lib/db/repositories/build';
import { labRepository } from '@/lib/db/repositories/lab';
import { noteRepository } from '@/lib/db/repositories/note';
import { workRepository } from '@/lib/db/repositories/work';
import type { ServiceEvidenceOwnerType, ServiceEvidenceReference } from '@/types/studio';
import { toRelationOptions } from './relation-options';
import { splitEntriesByOwnerType } from './relation-fields';

/**
 * Service's evidence links (Services completion sprint, Part 4) are the
 * same polymorphic "pick from several collections" shape `note-relations.ts`
 * already solved for Note's `relatedEntries` — Service just adds Note
 * itself to the set of pickable owner types (`ServiceEvidenceOwnerType`).
 * Reusing that pattern (five `RelationMultiSelect` fields, one per owner
 * type) means no new mixed-type picker component.
 */
export async function getServiceRelationOptions() {
  const [work, builds, blueprints, labs, notes] = await Promise.all([
    workRepository.list(),
    buildRepository.list(),
    blueprintRepository.list(),
    labRepository.list(),
    noteRepository.list(),
  ]);

  return {
    workOptions: toRelationOptions(work, (entry) => entry.title),
    buildOptions: toRelationOptions(builds, (entry) => entry.title),
    blueprintOptions: toRelationOptions(blueprints, (entry) => entry.name),
    labOptions: toRelationOptions(labs, (entry) => entry.title),
    noteOptions: toRelationOptions(notes, (entry) => entry.title),
  };
}

export const SERVICE_EVIDENCE_FIELDS: Array<{ key: ServiceEvidenceOwnerType; field: string }> = [
  { key: 'Work', field: 'evidenceWorkIds' },
  { key: 'Build', field: 'evidenceBuildIds' },
  { key: 'Blueprint', field: 'evidenceBlueprintIds' },
  { key: 'Lab', field: 'evidenceLabIds' },
  { key: 'Note', field: 'evidenceNoteIds' },
];

/** Splits `Service.evidenceLinks` back into the five typed id arrays `ServiceForm`'s five `RelationMultiSelect` fields expect — the inverse of `actions/service.ts`'s `readEvidenceLinks`. */
export function splitServiceEvidenceLinks(evidenceLinks: ServiceEvidenceReference[]): {
  evidenceWorkIds: string[];
  evidenceBuildIds: string[];
  evidenceBlueprintIds: string[];
  evidenceLabIds: string[];
  evidenceNoteIds: string[];
} {
  return splitEntriesByOwnerType(evidenceLinks, SERVICE_EVIDENCE_FIELDS) as {
    evidenceWorkIds: string[];
    evidenceBuildIds: string[];
    evidenceBlueprintIds: string[];
    evidenceLabIds: string[];
    evidenceNoteIds: string[];
  };
}
