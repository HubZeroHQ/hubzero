import 'server-only';

import { ObjectId } from 'mongodb';
import { collections } from '@/lib/db/collections';
import type { DocumentRecord } from '@/lib/documents/schema';
import type { PublicEntityType } from './domain';
import type { PublicDataSource, StudioPublicEntity, StudioPublicRecord } from './source';

function objectId(id: string): ObjectId | null {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

function wrap(
  type: PublicEntityType,
  record: StudioPublicRecord | null,
): StudioPublicEntity | null {
  return record ? { type, id: record._id.toString(), record } : null;
}

async function findById(type: PublicEntityType, id: string): Promise<StudioPublicEntity | null> {
  const _id = objectId(id);
  if (!_id) return null;
  switch (type) {
    case 'work':
      return wrap(type, await (await collections.work()).findOne({ _id }));
    case 'build':
      return wrap(type, await (await collections.builds()).findOne({ _id }));
    case 'blueprint':
      return wrap(type, await (await collections.blueprints()).findOne({ _id }));
    case 'lab':
      return wrap(type, await (await collections.labs()).findOne({ _id }));
    case 'note':
      return wrap(type, await (await collections.notes()).findOne({ _id }));
    case 'engineeringProfile':
      return wrap(type, await (await collections.engineeringProfiles()).findOne({ _id }));
    case 'teamMember':
      return wrap(type, await (await collections.team()).findOne({ _id }));
    case 'service':
      return wrap(type, await (await collections.services()).findOne({ _id }));
  }
}

async function findBySlug(
  type: PublicEntityType,
  slug: string,
): Promise<StudioPublicEntity | null> {
  switch (type) {
    case 'work':
      return wrap(type, await (await collections.work()).findOne({ slug }));
    case 'build':
      return wrap(type, await (await collections.builds()).findOne({ slug }));
    case 'blueprint':
      return wrap(type, await (await collections.blueprints()).findOne({ slug }));
    case 'lab':
      return wrap(type, await (await collections.labs()).findOne({ slug }));
    case 'note':
      return wrap(type, await (await collections.notes()).findOne({ slug }));
    case 'engineeringProfile':
      return wrap(type, await (await collections.engineeringProfiles()).findOne({ slug }));
    case 'teamMember':
    case 'service':
      return null;
  }
}

async function list(type: PublicEntityType): Promise<StudioPublicEntity[]> {
  let records: StudioPublicRecord[];
  switch (type) {
    case 'work':
      records = await (await collections.work()).find({ status: 'published' }).toArray();
      break;
    case 'build':
      records = await (await collections.builds()).find({ status: 'published' }).toArray();
      break;
    case 'blueprint':
      records = await (await collections.blueprints()).find({ status: 'published' }).toArray();
      break;
    case 'lab':
      records = await (await collections.labs()).find({ status: 'published' }).toArray();
      break;
    case 'note':
      records = await (await collections.notes()).find({ status: 'published' }).toArray();
      break;
    case 'engineeringProfile':
      records = await (
        await collections.engineeringProfiles()
      )
        .find({ status: 'published' })
        .toArray();
      break;
    case 'teamMember':
      records = await (await collections.team()).find({ publicProfile: true }).toArray();
      break;
    case 'service':
      records = await (await collections.services()).find({ status: 'published' }).toArray();
      break;
  }
  return records.map((record) => ({ type, id: record._id.toString(), record }));
}

async function inverse(type: PublicEntityType, id: string): Promise<StudioPublicEntity[]> {
  const targetId = objectId(id);
  if (!targetId) return [];
  const queries: Array<Promise<StudioPublicEntity[]>> = [];
  const wrapped = async <T extends StudioPublicRecord>(
    entityType: PublicEntityType,
    promise: Promise<T[]>,
  ) => (await promise).map((record) => ({ type: entityType, id: record._id.toString(), record }));

  if (type === 'work') {
    queries.push(
      wrapped('build', (await collections.builds()).find({ relatedWorkIds: targetId }).toArray()),
    );
  }
  if (type === 'build') {
    queries.push(
      wrapped('work', (await collections.work()).find({ relatedBuildIds: targetId }).toArray()),
      wrapped(
        'lab',
        (await collections.labs())
          .find({ $or: [{ graduatedToBuildId: targetId }, { relatedBuildIds: targetId }] } as never)
          .toArray(),
      ),
    );
  }
  if (type === 'blueprint') {
    queries.push(
      wrapped('work', (await collections.work()).find({ relatedBlueprintIds: targetId }).toArray()),
      wrapped('lab', (await collections.labs()).find({ relatedBlueprintIds: targetId }).toArray()),
    );
  }
  if (type === 'lab') {
    queries.push(
      wrapped('build', (await collections.builds()).find({ originatingLabId: targetId }).toArray()),
      wrapped('work', (await collections.work()).find({ relatedLabIds: targetId }).toArray()),
    );
  }
  if (type === 'engineeringProfile') {
    queries.push(
      wrapped(
        'work',
        (await collections.work()).find({ contributorProfileIds: targetId }).toArray(),
      ),
      wrapped(
        'build',
        (await collections.builds()).find({ contributorProfileIds: targetId }).toArray(),
      ),
      wrapped(
        'blueprint',
        (await collections.blueprints()).find({ contributorProfileIds: targetId }).toArray(),
      ),
      wrapped(
        'lab',
        (await collections.labs()).find({ contributorProfileIds: targetId }).toArray(),
      ),
      wrapped(
        'note',
        (await collections.notes()).find({ contributorProfileIds: targetId }).toArray(),
      ),
    );
  }

  const evidenceOwner =
    type === 'work'
      ? 'Work'
      : type === 'build'
        ? 'Build'
        : type === 'blueprint'
          ? 'Blueprint'
          : type === 'lab'
            ? 'Lab'
            : undefined;
  if (evidenceOwner) {
    const entry = { ownerType: evidenceOwner, ownerId: targetId };
    queries.push(
      wrapped(
        'note',
        (await collections.notes())
          .find({ relatedEntries: { $elemMatch: entry } } as never)
          .toArray(),
      ),
      wrapped(
        'service',
        (await collections.services())
          .find({ evidenceLinks: { $elemMatch: entry } } as never)
          .toArray(),
      ),
    );
  }

  const serviceEvidenceOwner = type === 'note' ? 'Note' : evidenceOwner;
  if (serviceEvidenceOwner && !evidenceOwner) {
    queries.push(
      wrapped(
        'service',
        (await collections.services())
          .find({
            evidenceLinks: {
              $elemMatch: { ownerType: serviceEvidenceOwner, ownerId: targetId },
            },
          } as never)
          .toArray(),
      ),
    );
  }

  const profileField =
    type === 'work'
      ? 'featuredWorkIds'
      : type === 'build'
        ? 'featuredBuildIds'
        : type === 'blueprint'
          ? 'featuredBlueprintIds'
          : type === 'lab'
            ? 'featuredLabIds'
            : type === 'note'
              ? 'featuredNoteIds'
              : undefined;
  if (profileField) {
    queries.push(
      wrapped(
        'engineeringProfile',
        (await collections.engineeringProfiles())
          .find({ [profileField]: targetId } as never)
          .toArray(),
      ),
    );
  }

  return (await Promise.all(queries)).flat();
}

export const mongoPublicDataSource: PublicDataSource = {
  findEntityBySlug: findBySlug,
  findEntityById: findById,
  listEntities: list,
  findInverseEntities: inverse,
  findDocuments: async (ownerType: DocumentRecord['ownerType'], ownerId: string) => {
    const id = objectId(ownerId);
    if (!id) return [];
    return (await collections.documents()).find({ ownerType, ownerId: id }).toArray();
  },
  findMedia: async (ids) => {
    const objectIds = ids.map(objectId).filter((id): id is ObjectId => id !== null);
    if (!objectIds.length) return [];
    return (await collections.media()).find({ _id: { $in: objectIds } }).toArray();
  },
  findTaxonomy: async (ids) => {
    const objectIds = ids.map(objectId).filter((id): id is ObjectId => id !== null);
    if (!objectIds.length) return [];
    return (await collections.taxonomy()).find({ _id: { $in: objectIds } }).toArray();
  },
  findUser: async (id) => {
    const _id = objectId(id);
    return _id ? (await collections.users()).findOne({ _id }) : null;
  },
  /*
   * `Team.userId` and `EngineeringProfile.teamMemberId` are validated via
   * `objectIdString` (lib/validation/shared.ts) — a regex-checked string,
   * never converted to a real BSON ObjectId before insert
   * (lib/db/repository.ts's generic `create()` spreads `input` as-is). Both
   * fields are therefore stored as plain strings, not ObjectIds — querying
   * with a constructed `ObjectId` instance here would never match by BSON
   * type, so these look up by the validated string form instead.
   */
  findTeamsByUserId: async (userId) => {
    if (!objectId(userId)) return [];
    return (await collections.team()).find({ userId } as never).toArray();
  },
  findProfileByTeamId: async (teamId) => {
    if (!objectId(teamId)) return null;
    return (await collections.engineeringProfiles()).findOne({ teamMemberId: teamId } as never);
  },
};
