import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import { requireEntryCapability, type OwnableEntry } from '@/lib/auth/permissions';
import { documentRepository } from '@/lib/db/repositories/document';
import type { Block } from '@/lib/documents/blocks';
import type { DocumentRole, OwnerType } from '@/lib/documents/schema';
import { zodErrorToFieldErrors } from '@/lib/validation/form-errors';
import type { EntryActionState } from './entry-actions';
import { invalidatePublicEntity } from '@/lib/public/cache';
import type { PublicEntityType } from '@/lib/public/domain';

const PUBLIC_TYPE_BY_OWNER: Partial<Record<OwnerType, PublicEntityType>> = {
  Work: 'work',
  Build: 'build',
  Blueprint: 'blueprint',
  Lab: 'lab',
  Note: 'note',
  EngineeringProfile: 'engineeringProfile',
};

/**
 * The Document Engine (§25) is already schema/persistence-shared across
 * every owner type — this is the one place the "save this owner's blocks"
 * operation lives, so Work's case study, a Build's technical doc, and a
 * Lab's journal all go through the same create-or-update path rather than
 * each collection reinventing "does a Document already exist for this
 * owner+role."
 */
export function createDocumentSaveAction<TOwner extends OwnableEntry & { slug: string }>(config: {
  ownerType: OwnerType;
  role: DocumentRole;
  findOwnerById: (id: string) => Promise<TOwner | null>;
  detailPath: (ownerId: string) => string;
}) {
  return async function saveDocumentAction(
    ownerId: string,
    blocks: Block[],
  ): Promise<EntryActionState> {
    const owner = await config.findOwnerById(ownerId);
    if (!owner) {
      return { error: 'This entry no longer exists.' };
    }

    let actorUserId: string;
    try {
      ({ userId: actorUserId } = await requireEntryCapability(owner));
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'You cannot edit this entry.' };
    }

    try {
      const existing = await documentRepository.findByOwnerAndRole(
        config.ownerType,
        ownerId,
        config.role,
      );

      if (existing) {
        await documentRepository.updateBlocks(existing._id.toString(), blocks, { actorUserId });
      } else {
        await documentRepository.create({
          ownerType: config.ownerType,
          ownerId,
          role: config.role,
          blocks,
        });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          error: 'One or more blocks are invalid.',
          fieldErrors: zodErrorToFieldErrors(error),
        };
      }
      return { error: error instanceof Error ? error.message : 'Could not save the document.' };
    }

    revalidatePath(config.detailPath(ownerId));
    const publicType = PUBLIC_TYPE_BY_OWNER[config.ownerType];
    if (publicType) invalidatePublicEntity(publicType, owner.slug);
    return {};
  };
}
