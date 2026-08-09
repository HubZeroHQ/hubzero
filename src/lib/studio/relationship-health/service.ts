import 'server-only';

import { assertionsFrom } from '@/lib/public/repository';
import type { StudioPublicEntity, StudioPublicRecord } from '@/lib/public/source';
import type { PublicEntityType } from '@/lib/public/domain';
import { loadStudioContentSnapshot, type StudioContentSnapshot } from '../request-data';
import { findRelationshipIssues, type RelationshipIssue, type RelationshipSnapshot } from './rules';

/**
 * Loads every relationship-bearing record once and validates in memory
 * (v3.1 Milestone 4).
 *
 * ## One traversal, no N+1
 *
 * Nine collections, one `list()` each, all in parallel. Every reference is then
 * resolved against an in-memory index rather than fetched — which is what makes
 * a full-graph integrity scan affordable at all. A checker that looked up each
 * target would issue one query per reference, and relationship-dense content is
 * precisely where that becomes thousands.
 *
 * ## Why this reads records the public layer never would
 *
 * `assertionsFrom` is shared with the public repository, but it is fed a
 * different population here: every record at every status, rather than only the
 * publicly visible ones. That difference is the entire point — the public layer
 * drops references it cannot resolve, and the dropped ones are the broken ones.
 */
export async function loadRelationshipIssues(
  providedSnapshot?: StudioContentSnapshot,
): Promise<RelationshipIssue[]> {
  const snapshotData = providedSnapshot ?? (await loadStudioContentSnapshot());
  const { work, builds, blueprints, labs, notes, careers, services, team, profiles } = snapshotData;

  const snapshot: RelationshipSnapshot = { entities: [], assertions: [] };

  function add<T extends { _id: { toString(): string } }>(
    type: PublicEntityType,
    records: T[],
    project: (record: T) => {
      label: string;
      status: RelationshipSnapshot['entities'][number]['status'];
      href: string;
    },
  ) {
    for (const record of records) {
      const id = record._id.toString();
      const projected = project(record);
      snapshot.entities.push({ type, id, ...projected });
      snapshot.assertions.push(
        ...assertionsFrom({
          type,
          id,
          record: record as unknown as StudioPublicRecord,
        } as StudioPublicEntity),
      );
    }
  }

  add('work', work, (record) => ({
    label: record.title,
    status: record.status,
    href: `/studio/content/work/${record._id.toString()}/edit`,
  }));
  add('build', builds, (record) => ({
    label: record.title,
    status: record.status,
    href: `/studio/content/builds/${record._id.toString()}/edit`,
  }));
  add('blueprint', blueprints, (record) => ({
    label: record.name,
    status: record.status,
    href: `/studio/content/blueprints/${record._id.toString()}/edit`,
  }));
  add('lab', labs, (record) => ({
    label: record.title,
    status: record.status,
    href: `/studio/content/labs/${record._id.toString()}/edit`,
  }));
  add('note', notes, (record) => ({
    label: record.title,
    status: record.status,
    href: `/studio/content/notes/${record._id.toString()}/edit`,
  }));
  add('career', careers, (record) => ({
    label: record.title,
    status: record.status,
    href: `/studio/content/careers/${record._id.toString()}/edit`,
  }));
  add('service', services, (record) => ({
    label: record.title,
    // Service runs a two-state workflow of its own; mapped onto the shared
    // vocabulary rather than given a parallel status model.
    status: record.status === 'published' ? 'published' : 'draft',
    href: `/studio/services/${record._id.toString()}/edit`,
  }));
  add('teamMember', team, (record) => ({
    label: record.name,
    // Team has no publish workflow — an archived member is the only hidden
    // state, so anything else is treated as visible rather than invented.
    status: record.archived ? 'archived' : 'published',
    href: `/studio/team/${record._id.toString()}/edit`,
  }));
  add('engineeringProfile', profiles, (record) => ({
    label: record.referenceId,
    status: record.status,
    href: `/studio/engineering-profiles/${record._id.toString()}/edit`,
  }));

  return findRelationshipIssues(snapshot);
}
