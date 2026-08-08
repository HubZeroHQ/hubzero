import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import { eventEntityTypeFor, recordEditorialEvent } from '@/lib/events/record';
import { requireEntryCapability, type OwnableEntry } from '@/lib/auth/permissions';
import { documentRepository } from '@/lib/db/repositories/document';
import type { Block } from '@/lib/documents/blocks';
import type { DocumentRole, OwnerType } from '@/lib/documents/schema';
import { zodErrorToFieldErrors } from '@/lib/validation/form-errors';
import type { PublishStatus } from '@/types/studio';
import type { EntryActionState } from './entry-actions';
import { invalidatePublicEntity } from '@/lib/public/cache';
import { OWNER_TO_PUBLIC_TYPE } from '@/lib/public/repository';

/**
 * The Document Engine (§25) is already schema/persistence-shared across
 * every owner type — this is the one place the "save this owner's blocks"
 * operation lives, so Work's case study, a Build's technical doc, and a
 * Lab's journal all go through the same create-or-update path rather than
 * each collection reinventing "does a Document already exist for this
 * owner+role."
 */
export function createDocumentSaveAction<
  TOwner extends OwnableEntry & { slug: string; status: PublishStatus },
>(config: {
  ownerType: OwnerType;
  role: DocumentRole;
  findOwnerById: (id: string) => Promise<TOwner | null>;
  setOwnerStatus: (id: string, status: PublishStatus) => Promise<TOwner | null>;
  detailPath: (ownerId: string) => string;
  listPath: string;
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

    let movedToReview = false;
    if (owner.status === 'published') {
      try {
        const updatedOwner = await config.setOwnerStatus(ownerId, 'inReview');
        if (!updatedOwner) {
          return { error: 'This entry no longer exists.' };
        }
        movedToReview = true;
      } catch (error) {
        return {
          error:
            error instanceof Error
              ? error.message
              : 'Could not move this published entry back to review.',
        };
      }
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

      // Logged from the shared factory, so every collection that owns a
      // Document is audited without its own call (v3.1 Milestone 8). Autosave
      // makes this the highest-volume event type — see the milestone log's
      // note on throttling.
      const publicType = OWNER_TO_PUBLIC_TYPE[config.ownerType];
      const documentEntityType = publicType ? eventEntityTypeFor(publicType) : null;
      if (documentEntityType) {
        await recordEditorialEvent({
          entityType: documentEntityType,
          entityId: ownerId,
          payload: { type: 'document.updated', role: config.role },
        });
      }
    } catch (error) {
      if (movedToReview) {
        try {
          await config.setOwnerStatus(ownerId, 'published');
        } catch (rollbackError) {
          // Safe failure direction: if compensation fails, invalidate the
          // public projection so an uncertain status can never leave
          // unreviewed blocks visible through a warm cache.
          const publicType = OWNER_TO_PUBLIC_TYPE[config.ownerType];
          if (publicType) invalidatePublicEntity(publicType, owner.slug);
          console.error('Document save status rollback failed', {
            ownerType: config.ownerType,
            ownerId,
            rollbackError,
          });
        }
      }
      if (error instanceof ZodError) {
        return {
          error: 'One or more blocks are invalid.',
          fieldErrors: zodErrorToFieldErrors(error),
        };
      }
      return { error: error instanceof Error ? error.message : 'Could not save the document.' };
    }

    if (movedToReview) {
      const publicType = OWNER_TO_PUBLIC_TYPE[config.ownerType];
      const entityType = publicType ? eventEntityTypeFor(publicType) : null;
      if (entityType) {
        await recordEditorialEvent({
          entityType,
          entityId: ownerId,
          payload: { type: 'entry.statusChanged', from: 'published', to: 'inReview' },
        });
      }
    }

    revalidatePath(config.detailPath(ownerId));
    revalidatePath(config.listPath);
    const publicType = OWNER_TO_PUBLIC_TYPE[config.ownerType];
    if (publicType && movedToReview) {
      invalidatePublicEntity(publicType, owner.slug);
    }
    return {};
  };
}
