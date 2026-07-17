import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';
import { auth } from '@/lib/auth';
import {
  type OwnableEntry,
  requireCapability,
  requireEntryCapability,
} from '@/lib/auth/permissions';
import { zodErrorToFieldErrors } from '@/lib/validation/form-errors';
import type { PublishStatus } from '@/types/studio';
import { invalidatePublicEntity } from '@/lib/public/cache';
import type { PublicEntityType } from '@/lib/public/domain';
import { capabilityForTransition } from './workflow-permissions';
import { isValidPublishTransition } from '@/config/workflow';

/**
 * Generic server-action factories for the shared create → edit → publish
 * lifecycle every workflow collection (Work, and later Builds, Blueprints,
 * Labs, Notes) runs through identically (PLANNING.md §28/§29). A new
 * collection's actions become a thin call into these three factories with
 * its own repository methods and form parser — not a hand-rolled copy of
 * the permission-check/validate/revalidate/redirect boilerplate.
 *
 * Field-shape parsing (`parseFormData`) stays collection-specific on
 * purpose — that's the real "configuration, not code" difference between
 * Work and Notes, not something worth forcing into one generic mapper.
 * Validation itself is *not* duplicated here: every repository's
 * `create`/`update` already runs its own Zod schema (`lib/db/repositories/
 * *.ts`), so these factories just catch the `ZodError` that validation
 * throws and translate it into form-friendly field errors.
 *
 * This file deliberately has no `'use server'` directive — it exports
 * plain factory functions, not Server Actions themselves. A collection's
 * own actions file (e.g. `lib/studio/actions/work.ts`) must have `'use
 * server'` at its top and export the *result* of calling these factories;
 * importing a factory straight into a Client Component instead would run
 * its DB/auth/redirect logic in the browser bundle rather than as a real
 * Server Action.
 */

export interface EntryActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

function actionErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Try again.';
}

export function createEntryCreateAction<
  TRecord extends { slug: string },
  TInput extends object,
>(config: {
  create: (input: TInput, createdByUserId: string) => Promise<TRecord>;
  parseFormData: (formData: FormData) => TInput;
  idOf: (record: TRecord) => string;
  listPath: string;
  detailPath: (id: string) => string;
  publicType?: PublicEntityType;
}) {
  return async function createAction(
    _prevState: EntryActionState,
    formData: FormData,
  ): Promise<EntryActionState> {
    let userId: string;
    try {
      await requireCapability('createOwnEntry');
      const session = await auth();
      userId = session!.user.id;
    } catch (error) {
      return { error: actionErrorMessage(error) };
    }

    let record: TRecord;
    try {
      record = await config.create(config.parseFormData(formData), userId);
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          error: 'Check the highlighted fields.',
          fieldErrors: zodErrorToFieldErrors(error),
        };
      }
      return { error: actionErrorMessage(error) };
    }

    revalidatePath(config.listPath);
    if (config.publicType) invalidatePublicEntity(config.publicType, record.slug);
    redirect(config.detailPath(config.idOf(record)));
  };
}

export function createEntryUpdateAction<
  TRecord extends OwnableEntry & { slug: string },
  TInput extends object,
>(config: {
  findById: (id: string) => Promise<TRecord | null>;
  update: (id: string, input: Partial<TInput>) => Promise<TRecord | null>;
  parseFormData: (formData: FormData) => Partial<TInput>;
  detailPath: (id: string) => string;
  publicType?: PublicEntityType;
}) {
  return async function updateAction(
    id: string,
    _prevState: EntryActionState,
    formData: FormData,
  ): Promise<EntryActionState> {
    const existing = await config.findById(id);
    if (!existing) {
      return { error: 'This entry no longer exists.' };
    }

    try {
      await requireEntryCapability(existing);
    } catch (error) {
      return { error: actionErrorMessage(error) };
    }

    try {
      const updated = await config.update(id, config.parseFormData(formData));
      if (config.publicType) {
        invalidatePublicEntity(config.publicType, existing.slug);
        if (updated?.slug !== existing.slug)
          invalidatePublicEntity(config.publicType, updated?.slug);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          error: 'Check the highlighted fields.',
          fieldErrors: zodErrorToFieldErrors(error),
        };
      }
      return { error: actionErrorMessage(error) };
    }

    revalidatePath(config.detailPath(id));
    redirect(config.detailPath(id));
  };
}

/**
 * Moves an entry through the shared publish workflow (§28). `to === 'draft'`
 * from any non-draft status is treated as Head Admin's unpublish override
 * (§29) rather than a normal forward transition; every other move is
 * checked against `PUBLISH_WORKFLOW_TRANSITIONS` and the capability that
 * gates it (`workflow-permissions.ts`).
 */
export function createEntryTransitionAction<
  TRecord extends OwnableEntry & { status: PublishStatus; slug: string },
>(config: {
  findById: (id: string) => Promise<TRecord | null>;
  setStatus: (id: string, status: PublishStatus) => Promise<TRecord | null>;
  detailPath: (id: string) => string;
  publicType?: PublicEntityType;
}) {
  return async function transitionAction(id: string, to: PublishStatus): Promise<EntryActionState> {
    const existing = await config.findById(id);
    if (!existing) {
      return { error: 'This entry no longer exists.' };
    }

    const isOverride = to === 'draft' && existing.status !== 'draft';

    try {
      if (isOverride) {
        await requireCapability('unpublishOverride');
      } else {
        if (!isValidPublishTransition(existing.status, to)) {
          return { error: `"${existing.status}" cannot move directly to "${to}".` };
        }
        const capability = capabilityForTransition(existing.status, to);
        if (!capability) {
          return { error: 'No permission is defined for this transition.' };
        }
        await requireCapability(capability);
        await requireEntryCapability(existing);
      }
    } catch (error) {
      return { error: actionErrorMessage(error) };
    }

    await config.setStatus(id, to);
    if (config.publicType) invalidatePublicEntity(config.publicType, existing.slug);
    revalidatePath(config.detailPath(id));
    return {};
  };
}
