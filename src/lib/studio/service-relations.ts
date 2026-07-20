import { blueprintRepository } from '@/lib/db/repositories/blueprint';
import { buildRepository } from '@/lib/db/repositories/build';
import { labRepository } from '@/lib/db/repositories/lab';
import { noteRepository } from '@/lib/db/repositories/note';
import { workRepository } from '@/lib/db/repositories/work';
import type { ServiceEvidenceOwnerType, ServiceEvidenceReference } from '@/types/studio';

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
    noteOptions: notes.map((entry) => ({
      id: entry._id.toString(),
      label: entry.title,
      referenceId: entry.referenceId,
    })),
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
  const result = {
    evidenceWorkIds: [] as string[],
    evidenceBuildIds: [] as string[],
    evidenceBlueprintIds: [] as string[],
    evidenceLabIds: [] as string[],
    evidenceNoteIds: [] as string[],
  };

  for (const { key, field } of SERVICE_EVIDENCE_FIELDS) {
    result[field as keyof typeof result] = evidenceLinks
      .filter((entry) => entry.ownerType === key)
      .map((entry) => entry.ownerId.toString());
  }

  return result;
}
