import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';
import { auth } from '@/lib/auth';
import {
  type OwnableEntry,
  requireCapability,
  requireEntryCapability,
  requireEntryEditCapability,
} from '@/lib/auth/permissions';
import { zodErrorToFieldErrors } from '@/lib/validation/form-errors';
import type { PublishStatus } from '@/types/studio';
import { invalidatePublicEntity } from '@/lib/public/cache';
import type { PublicEntityType } from '@/lib/public/domain';
import { eventEntityTypeFor, recordEditorialEvent } from '@/lib/events/record';
import {
  canReject,
  canUnpublishOverride,
  capabilityForTransition,
  getAvailableTransitions,
} from './workflow-permissions';
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
  /**
   * Set by an action that finished successfully *and stayed on the page*.
   *
   * Editor state (v3.1 Phase 1) needs a positive success signal: "no error"
   * is not the same as "saved", and an editor that shows "✓ Saved" or
   * navigates on "Save & Leave" must not do either on an action that merely
   * failed to report a problem. Actions that end in a `redirect` — every
   * create action — never return at all and so never set this.
   */
  ok?: true;
  /** Server-confirmed workflow state for an in-place detail-panel update. */
  workflow?: {
    status: PublishStatus;
    availableTransitions: PublishStatus[];
    canUnpublishOverride: boolean;
    canReject: boolean;
    reviewNote: string | null;
  };
}

function actionErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Try again.';
}

export function createEntryCreateAction<
  TRecord extends { slug: string; status: PublishStatus },
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

    // Audit is written from the shared factory, never by the caller — a new
    // collection joins the log by using this factory (v3.1 Milestone 8).
    const createdEntityType = config.publicType ? eventEntityTypeFor(config.publicType) : null;
    if (createdEntityType) {
      await recordEditorialEvent({
        entityType: createdEntityType,
        entityId: config.idOf(record),
        payload: { type: 'entry.created' },
      });
    }

    revalidatePath(config.listPath);
    if (config.publicType && record.status === 'published') {
      invalidatePublicEntity(config.publicType, record.slug);
    }
    redirect(config.detailPath(config.idOf(record)));
  };
}

export function createEntryUpdateAction<
  TRecord extends OwnableEntry & { slug: string; status: PublishStatus },
  TInput extends { status?: PublishStatus; reviewNote?: string | null },
>(config: {
  findById: (id: string) => Promise<TRecord | null>;
  update: (id: string, input: Partial<TInput>) => Promise<TRecord | null>;
  parseFormData: (formData: FormData) => Partial<TInput>;
  detailPath: (id: string) => string;
  listPath: string;
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
      await requireEntryEditCapability(existing);
    } catch (error) {
      return { error: actionErrorMessage(error) };
    }

    // Editing an already-published entry can never be a silent overwrite of
    // what's live — it re-enters the review workflow instead, the same trust
    // boundary as publishing itself (only a `publish`-capable role reached
    // this point at all, per `requireEntryEditCapability` above).
    const requiresReReview = existing.status === 'published';

    let updated: TRecord | null;
    try {
      const patch = config.parseFormData(formData);
      updated = await config.update(
        id,
        requiresReReview
          ? ({ ...patch, status: 'inReview', reviewNote: null } as Partial<TInput>)
          : patch,
      );
      if (
        config.publicType &&
        (existing.status === 'published' || updated?.status === 'published')
      ) {
        invalidatePublicEntity(config.publicType, existing.slug);
        if (updated?.slug !== existing.slug) {
          invalidatePublicEntity(config.publicType, updated?.slug);
        }
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

    const updatedEntityType = config.publicType ? eventEntityTypeFor(config.publicType) : null;
    if (updatedEntityType) {
      await recordEditorialEvent({
        entityType: updatedEntityType,
        entityId: id,
        payload: { type: 'entry.updated' },
      });
      // Editing a published entry silently re-enters review (see above). That
      // is a real status change and is logged as one, so the timeline explains
      // why something left the public site.
      if (requiresReReview) {
        await recordEditorialEvent({
          entityType: updatedEntityType,
          entityId: id,
          payload: { type: 'entry.statusChanged', from: 'published', to: 'inReview' },
        });
      }
    }

    // Stays on the edit screen rather than redirecting to the detail view.
    // A metadata save is now an editor save (v3.1 Phase 1) — the author keeps
    // their scroll position, their focus, and the ability to keep working,
    // and the "✓ Saved" state the Studio promises is only observable if the
    // page the author is looking at is still the one that saved. Leaving is
    // an explicit choice now ("Save & Leave"), not a side effect of saving.
    // Both the detail and collection paths are revalidated so a back/link
    // return cannot resurrect the pre-save title, summary, or status from the
    // Router Cache.
    revalidatePath(config.detailPath(id));
    revalidatePath(config.listPath);
    return { ok: true };
  };
}

/**
 * Moves an entry through the shared publish workflow (§28). Two kinds of
 * backward move are distinguished from the normal forward transitions
 * (checked against `PUBLISH_WORKFLOW_TRANSITIONS` and the capability that
 * gates each one, `workflow-permissions.ts`) — a third, `archived -> draft`
 * ("Restore"), is *not* special-cased and instead falls through to the same
 * generic branch as Approve/Publish/Archive, since `PUBLISH_WORKFLOW_TRANSITIONS`
 * now models it as a real forward transition:
 *
 * - **Reject** (`inReview -> draft`): the explicit re-review path. Requires
 *   the same `approve` capability as moving an entry forward from review,
 *   plus a required, non-empty reviewer note that's stored on the entry so
 *   the author sees why it was sent back.
 * - **Unpublish override** (`draft`-bound from `published`/`approved` — the
 *   states with no other defined path back): Head Admin's
 *   blanket escape hatch (§29), no note required. Excludes `archived`, which
 *   has its own non-override path now (see below), so this must be checked
 *   *after* ruling out reject and restore, not merely "any non-draft status".
 * - Every other `to`, including `archived -> draft`, is a normal forward
 *   transition validated against `isValidPublishTransition` +
 *   `capabilityForTransition` like any other step in the workflow.
 */
export function createEntryTransitionAction<
  TRecord extends OwnableEntry & { status: PublishStatus; slug: string },
>(config: {
  findById: (id: string) => Promise<TRecord | null>;
  setStatus: (
    id: string,
    status: PublishStatus,
    reviewNote?: string | null,
  ) => Promise<TRecord | null>;
  detailPath: (id: string) => string;
  listPath: string;
  publicType?: PublicEntityType;
}) {
  return async function transitionAction(
    id: string,
    to: PublishStatus,
    note?: string,
  ): Promise<EntryActionState> {
    const existing = await config.findById(id);
    if (!existing) {
      return { error: 'This entry no longer exists.' };
    }

    const isReject = to === 'draft' && existing.status === 'inReview';
    const isRestore = to === 'draft' && existing.status === 'archived';
    const isOverride = to === 'draft' && existing.status !== 'draft' && !isReject && !isRestore;

    try {
      if (isReject) {
        if (!note?.trim()) {
          return { error: 'A rejection reason is required.' };
        }
        await requireCapability('approve');
        await requireEntryCapability(existing);
      } else if (isOverride) {
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

    await config.setStatus(id, to, isReject ? note!.trim() : null);

    const transitionEntityType = config.publicType ? eventEntityTypeFor(config.publicType) : null;
    if (transitionEntityType) {
      await recordEditorialEvent({
        entityType: transitionEntityType,
        entityId: id,
        payload: {
          type: 'entry.statusChanged',
          from: existing.status,
          to,
          ...(isReject && note?.trim() ? { reviewNote: note.trim() } : {}),
        },
      });
    }
    if (config.publicType && (existing.status === 'published' || to === 'published')) {
      invalidatePublicEntity(config.publicType, existing.slug);
    }
    // Both the detail page just acted on and the collection list (whose
    // status column/filters go stale otherwise) need invalidating — a
    // Link/back-button return to the list would otherwise serve the
    // pre-transition Router Cache entry until a hard reload.
    revalidatePath(config.detailPath(id));
    revalidatePath(config.listPath);
    const session = await auth();
    const role = session!.user.role;
    return {
      ok: true,
      workflow: {
        status: to,
        availableTransitions: getAvailableTransitions(to, role, true),
        canUnpublishOverride: canUnpublishOverride(to, role),
        canReject: canReject(to, role),
        reviewNote: isReject ? note!.trim() : null,
      },
    };
  };
}
