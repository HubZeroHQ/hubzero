'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireCapability, requireEntryCapability } from '@/lib/auth/permissions';
import { leadRepository } from '@/lib/db/repositories/lead';
import type { EntryActionState } from '@/lib/studio/entry-actions';
import type { LeadStatus } from '@/types/studio';

const LIST_PATH = '/studio/leads';
const detailPath = (id: string) => `${LIST_PATH}/${id}`;

function actionErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Try again.';
}

/**
 * Lead already carries `assignedToUserId` (the one field `OwnableEntry`,
 * `lib/auth/permissions.ts`, needs) — so a Team Member's `editAssignedEntry`
 * capability applies here exactly the way it already does for Work/Build/
 * Blueprint/Lab/Note, with no new capability or permissions-table change.
 * Status/notes are within an assignee's reach; reassignment, archiving, and
 * deletion stay `editAnyEntry` (Admin/Head Admin) — a Lead's owner
 * shouldn't be able to hand it to someone else or make it disappear.
 */
export async function updateLeadStatusAction(
  id: string,
  status: LeadStatus,
): Promise<EntryActionState> {
  const existing = await leadRepository.findById(id);
  if (!existing) {
    return { error: 'This Lead no longer exists.' };
  }

  try {
    await requireEntryCapability(existing);
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  await leadRepository.update(id, { status });
  revalidatePath(detailPath(id));
  revalidatePath(LIST_PATH);
  return {};
}

export async function updateLeadNotesAction(
  id: string,
  _prevState: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  const existing = await leadRepository.findById(id);
  if (!existing) {
    return { error: 'This Lead no longer exists.' };
  }

  try {
    await requireEntryCapability(existing);
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  await leadRepository.update(id, { internalNotes: String(formData.get('internalNotes') ?? '') });
  revalidatePath(detailPath(id));
  return {};
}

export async function assignLeadAction(
  id: string,
  _prevState: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  try {
    await requireCapability('editAnyEntry');
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  const assignedToUserId = String(formData.get('assignedToUserId') ?? '').trim();
  await leadRepository.update(id, { assignedToUserId: assignedToUserId || undefined });
  revalidatePath(detailPath(id));
  revalidatePath(LIST_PATH);
  return {};
}

export async function setLeadArchivedAction(
  id: string,
  archived: boolean,
): Promise<EntryActionState> {
  try {
    await requireCapability('editAnyEntry');
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  await leadRepository.update(id, { archived });
  revalidatePath(detailPath(id));
  revalidatePath(LIST_PATH);
  return {};
}

export async function deleteLeadAction(id: string): Promise<EntryActionState> {
  try {
    await requireCapability('editAnyEntry');
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  await leadRepository.remove(id);
  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}
