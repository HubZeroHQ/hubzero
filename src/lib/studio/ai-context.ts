import type { ObjectId } from 'mongodb';
import type { GenerationEntryMetadata, RelatedEntrySummary } from '@/lib/ai/types';
import { blueprintRepository } from '@/lib/db/repositories/blueprint';
import { buildRepository } from '@/lib/db/repositories/build';
import { labRepository } from '@/lib/db/repositories/lab';
import { noteRepository } from '@/lib/db/repositories/note';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { teamRepository } from '@/lib/db/repositories/team';
import { workRepository } from '@/lib/db/repositories/work';
import type { DocumentRole, OwnerType } from '@/lib/documents/schema';
import type { EntryReference, EvidenceOwnerType } from '@/types/studio';

/**
 * Assembles a generation request's entry context (Context Awareness in the
 * Phase 10 brief: collection, title, summary, technologies, relationships,
 * reference ID). One switch over the Document-owning content collections —
 * every generation surface (whole-document panel, slash commands, per-block
 * actions, selection toolbar) builds its `GenerationEntryMetadata` through
 * this single function rather than re-deriving "resolve this entry's real
 * title/summary/technologies" per call site.
 *
 * Deliberately resolves specific ids to labels rather than reusing the
 * `*-relations.ts` picker-option assemblers (`note-relations.ts` etc.) —
 * those fetch every option for a searchable picker; this needs only the
 * handful of ids a single entry actually references, a materially smaller
 * and cheaper query.
 */

const RELATED_ENTRY_REPOSITORIES: Record<
  EvidenceOwnerType,
  { findById: (id: string) => Promise<{ title?: string; name?: string } | null> }
> = {
  Work: workRepository,
  Build: buildRepository,
  Blueprint: blueprintRepository,
  Lab: labRepository,
};

async function resolveTechnologyLabels(ids: ObjectId[]): Promise<string[]> {
  if (ids.length === 0) {
    return [];
  }
  const technologies = await taxonomyRepository.findByKind('technology');
  const labelById = new Map(technologies.map((entry) => [entry._id.toString(), entry.label]));
  return ids
    .map((id) => labelById.get(id.toString()))
    .filter((label): label is string => typeof label === 'string');
}

async function resolveRelatedByType(
  ownerType: EvidenceOwnerType,
  ids: ObjectId[],
): Promise<RelatedEntrySummary[]> {
  if (ids.length === 0) {
    return [];
  }
  const repository = RELATED_ENTRY_REPOSITORIES[ownerType];
  const records = await Promise.all(ids.map((id) => repository.findById(id.toString())));
  return records
    .filter((record): record is NonNullable<typeof record> => record !== null)
    .map((record) => ({ ownerType, title: record.title ?? record.name ?? 'Untitled' }));
}

async function resolveEntryReferences(entries: EntryReference[]): Promise<RelatedEntrySummary[]> {
  const idsByType = new Map<EvidenceOwnerType, ObjectId[]>();
  for (const entry of entries) {
    idsByType.set(entry.ownerType, [...(idsByType.get(entry.ownerType) ?? []), entry.ownerId]);
  }
  const resolved = await Promise.all(
    Array.from(idsByType.entries()).map(([ownerType, ids]) => resolveRelatedByType(ownerType, ids)),
  );
  return resolved.flat();
}

export class GenerationEntryNotFoundError extends Error {
  constructor() {
    super('This entry no longer exists.');
    this.name = 'GenerationEntryNotFoundError';
  }
}

export async function buildGenerationEntryMetadata(
  ownerType: OwnerType,
  ownerId: string,
  role: DocumentRole,
): Promise<GenerationEntryMetadata> {
  switch (ownerType) {
    case 'Work': {
      const entry = await workRepository.findById(ownerId);
      if (!entry) throw new GenerationEntryNotFoundError();
      const [technologies, relatedBuilds, relatedBlueprints] = await Promise.all([
        resolveTechnologyLabels(entry.technologyIds),
        resolveRelatedByType('Build', entry.relatedBuildIds),
        resolveRelatedByType('Blueprint', entry.relatedBlueprintIds),
      ]);
      return {
        ownerType,
        role,
        title: entry.title,
        referenceId: entry.referenceId,
        technologies,
        relatedEntries: [...relatedBuilds, ...relatedBlueprints],
      };
    }
    case 'Build': {
      const entry = await buildRepository.findById(ownerId);
      if (!entry) throw new GenerationEntryNotFoundError();
      const [technologies, relatedWork] = await Promise.all([
        resolveTechnologyLabels(entry.technologyIds),
        resolveRelatedByType('Work', entry.relatedWorkIds),
      ]);
      return {
        ownerType,
        role,
        title: entry.title,
        referenceId: entry.referenceId,
        technologies,
        relatedEntries: relatedWork,
      };
    }
    case 'Blueprint': {
      const entry = await blueprintRepository.findById(ownerId);
      if (!entry) throw new GenerationEntryNotFoundError();
      const technologies = await resolveTechnologyLabels(entry.technologyIds);
      return {
        ownerType,
        role,
        title: entry.name,
        referenceId: entry.referenceId,
        summary: entry.shortDescription,
        technologies,
      };
    }
    case 'Lab': {
      const entry = await labRepository.findById(ownerId);
      if (!entry) throw new GenerationEntryNotFoundError();
      const [technologies, relatedBuilds, relatedBlueprints] = await Promise.all([
        resolveTechnologyLabels(entry.technologyIds),
        resolveRelatedByType('Build', entry.relatedBuildIds),
        resolveRelatedByType('Blueprint', entry.relatedBlueprintIds),
      ]);
      return {
        ownerType,
        role,
        title: entry.title,
        referenceId: entry.referenceId,
        summary: entry.objective,
        technologies,
        relatedEntries: [...relatedBuilds, ...relatedBlueprints],
      };
    }
    case 'Note': {
      const entry = await noteRepository.findById(ownerId);
      if (!entry) throw new GenerationEntryNotFoundError();
      const [technologies, relatedEntries] = await Promise.all([
        resolveTechnologyLabels(entry.technologyIds),
        resolveEntryReferences(entry.relatedEntries),
      ]);
      return {
        ownerType,
        role,
        title: entry.title,
        referenceId: entry.referenceId,
        summary: entry.summary,
        technologies,
        relatedEntries,
      };
    }
    case 'Team': {
      const entry = await teamRepository.findById(ownerId);
      if (!entry) throw new GenerationEntryNotFoundError();
      return {
        ownerType,
        role,
        title: entry.name,
        referenceId: entry.referenceId,
        summary: entry.bio,
      };
    }
    default: {
      const exhaustive: never = ownerType;
      throw new Error(`Unknown owner type: ${String(exhaustive)}`);
    }
  }
}
