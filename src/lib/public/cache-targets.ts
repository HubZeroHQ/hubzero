import 'server-only';

import { blueprintRepository } from '@/lib/db/repositories/blueprint';
import { buildRepository } from '@/lib/db/repositories/build';
import { careerRepository } from '@/lib/db/repositories/career';
import { engineeringProfileRepository } from '@/lib/db/repositories/engineering-profile';
import { labRepository } from '@/lib/db/repositories/lab';
import { noteRepository } from '@/lib/db/repositories/note';
import { teamRepository } from '@/lib/db/repositories/team';
import { workRepository } from '@/lib/db/repositories/work';
import type { OwnerType } from '@/lib/documents/schema';
import type { PublicCacheTarget } from './cache';
import { isPubliclyVisible } from './visibility';

/** Published Notes whose public author projection reads a given User id. */
export async function publicNoteCacheTargetsForAuthorUser(
  userId: string,
): Promise<PublicCacheTarget[]> {
  const notes = await noteRepository.list();
  return notes
    .filter((note) => note.status === 'published' && note.authorId.toString() === userId)
    .map((note) => ({ type: 'note', slug: note.slug }));
}

/**
 * Resolves a Document/Media owner to the public page that currently renders
 * it. This is the single visibility-aware mapping used by targeted cache
 * invalidation; callers do not reimplement publish checks per owner type.
 */
export async function publicCacheTargetsForOwner(
  ownerType: OwnerType,
  ownerId: string,
): Promise<PublicCacheTarget[]> {
  switch (ownerType) {
    case 'Work': {
      const entry = await workRepository.findById(ownerId);
      return entry?.status === 'published' ? [{ type: 'work', slug: entry.slug }] : [];
    }
    case 'Build': {
      const entry = await buildRepository.findById(ownerId);
      return entry?.status === 'published' ? [{ type: 'build', slug: entry.slug }] : [];
    }
    case 'Blueprint': {
      const entry = await blueprintRepository.findById(ownerId);
      return entry?.status === 'published' ? [{ type: 'blueprint', slug: entry.slug }] : [];
    }
    case 'Lab': {
      const entry = await labRepository.findById(ownerId);
      return entry?.status === 'published' ? [{ type: 'lab', slug: entry.slug }] : [];
    }
    case 'Note': {
      const entry = await noteRepository.findById(ownerId);
      return entry?.status === 'published' ? [{ type: 'note', slug: entry.slug }] : [];
    }
    case 'Team': {
      const entry = await teamRepository.findById(ownerId);
      if (
        !entry ||
        !isPubliclyVisible({
          type: 'teamMember',
          publicProfile: entry.publicProfile,
          archived: entry.archived,
        })
      ) {
        return [];
      }

      const [profile, notes] = await Promise.all([
        engineeringProfileRepository.findByTeamMemberId(ownerId),
        entry.userId
          ? publicNoteCacheTargetsForAuthorUser(entry.userId.toString())
          : Promise.resolve([]),
      ]);
      return [
        { type: 'teamMember' },
        ...(profile?.status === 'published'
          ? [{ type: 'engineeringProfile' as const, slug: profile.slug }]
          : []),
        ...notes,
      ];
    }
    case 'EngineeringProfile': {
      const entry = await engineeringProfileRepository.findById(ownerId);
      if (entry?.status !== 'published') return [];
      const teamMember = await teamRepository.findById(entry.teamMemberId.toString());
      return teamMember &&
        isPubliclyVisible({
          type: 'teamMember',
          publicProfile: teamMember.publicProfile,
          archived: teamMember.archived,
        })
        ? [{ type: 'engineeringProfile', slug: entry.slug }]
        : [];
    }
    case 'Career': {
      const entry = await careerRepository.findById(ownerId);
      return entry?.status === 'published' ? [{ type: 'career', slug: entry.slug }] : [];
    }
  }
}
