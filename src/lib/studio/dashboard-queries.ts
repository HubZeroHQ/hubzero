import { blueprintRepository } from '@/lib/db/repositories/blueprint';
import { buildRepository } from '@/lib/db/repositories/build';
import { labRepository } from '@/lib/db/repositories/lab';
import { noteRepository } from '@/lib/db/repositories/note';
import { engineeringProfileRepository } from '@/lib/db/repositories/engineering-profile';
import { teamRepository } from '@/lib/db/repositories/team';
import { workRepository } from '@/lib/db/repositories/work';
import type { PublishStatus } from '@/types/studio';

export type ContentEntityType =
  'work' | 'builds' | 'blueprints' | 'labs' | 'notes' | 'engineeringProfiles';

const CONTENT_HREF: Record<ContentEntityType, string> = {
  work: '/studio/content/work',
  builds: '/studio/content/builds',
  blueprints: '/studio/content/blueprints',
  labs: '/studio/content/labs',
  notes: '/studio/content/notes',
  engineeringProfiles: '/studio/engineering-profiles',
};

export interface ContentSummary {
  id: string;
  type: ContentEntityType;
  title: string;
  referenceId: string;
  status: PublishStatus;
  href: string;
  updatedAt: Date;
  createdByUserId: string;
}

/**
 * Dashboard widgets (CMS_PRODUCT_DESIGN.md §3) are "live, filtered views
 * into a real collection," so this merges the five workflow-driven
 * Content collections into one lightweight shape rather than each widget
 * hand-rolling its own aggregation across five repositories.
 */
export async function listAllContent(): Promise<ContentSummary[]> {
  const [work, builds, blueprints, labs, notes, profiles, team] = await Promise.all([
    workRepository.list(),
    buildRepository.list(),
    blueprintRepository.list(),
    labRepository.list(),
    noteRepository.list(),
    engineeringProfileRepository.list(),
    teamRepository.list(),
  ]);
  const teamNames = new Map(team.map((entry) => [entry._id.toString(), entry.name]));

  return [
    ...work.map((entry) => ({
      id: entry._id.toString(),
      type: 'work' as const,
      title: entry.title,
      referenceId: entry.referenceId,
      status: entry.status,
      href: CONTENT_HREF.work,
      updatedAt: entry.updatedAt,
      createdByUserId: entry.createdByUserId.toString(),
    })),
    ...builds.map((entry) => ({
      id: entry._id.toString(),
      type: 'builds' as const,
      title: entry.title,
      referenceId: entry.referenceId,
      status: entry.status,
      href: CONTENT_HREF.builds,
      updatedAt: entry.updatedAt,
      createdByUserId: entry.createdByUserId.toString(),
    })),
    ...blueprints.map((entry) => ({
      id: entry._id.toString(),
      type: 'blueprints' as const,
      title: entry.name,
      referenceId: entry.referenceId,
      status: entry.status,
      href: CONTENT_HREF.blueprints,
      updatedAt: entry.updatedAt,
      createdByUserId: entry.createdByUserId.toString(),
    })),
    ...labs.map((entry) => ({
      id: entry._id.toString(),
      type: 'labs' as const,
      title: entry.title,
      referenceId: entry.referenceId,
      status: entry.status,
      href: CONTENT_HREF.labs,
      updatedAt: entry.updatedAt,
      createdByUserId: entry.createdByUserId.toString(),
    })),
    ...notes.map((entry) => ({
      id: entry._id.toString(),
      type: 'notes' as const,
      title: entry.title,
      referenceId: entry.referenceId,
      status: entry.status,
      href: CONTENT_HREF.notes,
      updatedAt: entry.updatedAt,
      createdByUserId: entry.createdByUserId.toString(),
    })),
    ...profiles.map((entry) => ({
      id: entry._id.toString(),
      type: 'engineeringProfiles' as const,
      title: teamNames.get(entry.teamMemberId.toString()) ?? 'Unknown engineer',
      referenceId: entry.referenceId,
      status: entry.status,
      href: CONTENT_HREF.engineeringProfiles,
      updatedAt: entry.updatedAt,
      createdByUserId: entry.createdByUserId.toString(),
    })),
  ];
}
