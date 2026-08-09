import { loadStudioContentSnapshot, type StudioContentSnapshot } from '@/lib/studio/request-data';
import type { PublishStatus } from '@/types/studio';

export const DASHBOARD_CONTENT_COLLECTIONS = {
  work: { label: 'Work', href: '/studio/content/work' },
  builds: { label: 'Builds', href: '/studio/content/builds' },
  blueprints: { label: 'Blueprints', href: '/studio/content/blueprints' },
  labs: { label: 'Labs', href: '/studio/content/labs' },
  notes: { label: 'Notes', href: '/studio/content/notes' },
  careers: { label: 'Careers', href: '/studio/content/careers' },
  engineeringProfiles: {
    label: 'Engineering profiles',
    href: '/studio/engineering-profiles',
  },
} as const;

export type ContentEntityType = keyof typeof DASHBOARD_CONTENT_COLLECTIONS;

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
 * workflow-driven Content collections into one lightweight shape rather
 * than each widget hand-rolling its own cross-repository aggregation.
 */
export async function listAllContent(
  providedSnapshot?: StudioContentSnapshot,
): Promise<ContentSummary[]> {
  const { work, builds, blueprints, labs, notes, careers, profiles, team } =
    providedSnapshot ?? (await loadStudioContentSnapshot());
  const teamNames = new Map(team.map((entry) => [entry._id.toString(), entry.name]));

  return [
    ...work.map((entry) => ({
      id: entry._id.toString(),
      type: 'work' as const,
      title: entry.title,
      referenceId: entry.referenceId,
      status: entry.status,
      href: `${DASHBOARD_CONTENT_COLLECTIONS.work.href}/${entry._id.toString()}`,
      updatedAt: entry.updatedAt,
      createdByUserId: entry.createdByUserId.toString(),
    })),
    ...builds.map((entry) => ({
      id: entry._id.toString(),
      type: 'builds' as const,
      title: entry.title,
      referenceId: entry.referenceId,
      status: entry.status,
      href: `${DASHBOARD_CONTENT_COLLECTIONS.builds.href}/${entry._id.toString()}`,
      updatedAt: entry.updatedAt,
      createdByUserId: entry.createdByUserId.toString(),
    })),
    ...blueprints.map((entry) => ({
      id: entry._id.toString(),
      type: 'blueprints' as const,
      title: entry.name,
      referenceId: entry.referenceId,
      status: entry.status,
      href: `${DASHBOARD_CONTENT_COLLECTIONS.blueprints.href}/${entry._id.toString()}`,
      updatedAt: entry.updatedAt,
      createdByUserId: entry.createdByUserId.toString(),
    })),
    ...labs.map((entry) => ({
      id: entry._id.toString(),
      type: 'labs' as const,
      title: entry.title,
      referenceId: entry.referenceId,
      status: entry.status,
      href: `${DASHBOARD_CONTENT_COLLECTIONS.labs.href}/${entry._id.toString()}`,
      updatedAt: entry.updatedAt,
      createdByUserId: entry.createdByUserId.toString(),
    })),
    ...notes.map((entry) => ({
      id: entry._id.toString(),
      type: 'notes' as const,
      title: entry.title,
      referenceId: entry.referenceId,
      status: entry.status,
      href: `${DASHBOARD_CONTENT_COLLECTIONS.notes.href}/${entry._id.toString()}`,
      updatedAt: entry.updatedAt,
      createdByUserId: entry.createdByUserId.toString(),
    })),
    ...careers.map((entry) => ({
      id: entry._id.toString(),
      type: 'careers' as const,
      title: entry.title,
      referenceId: entry.referenceId,
      status: entry.status,
      href: `${DASHBOARD_CONTENT_COLLECTIONS.careers.href}/${entry._id.toString()}`,
      updatedAt: entry.updatedAt,
      createdByUserId: entry.createdByUserId.toString(),
    })),
    ...profiles.map((entry) => ({
      id: entry._id.toString(),
      type: 'engineeringProfiles' as const,
      title: teamNames.get(entry.teamMemberId.toString()) ?? 'Unknown engineer',
      referenceId: entry.referenceId,
      status: entry.status,
      href: `${DASHBOARD_CONTENT_COLLECTIONS.engineeringProfiles.href}/${entry._id.toString()}`,
      updatedAt: entry.updatedAt,
      createdByUserId: entry.createdByUserId.toString(),
    })),
  ];
}
