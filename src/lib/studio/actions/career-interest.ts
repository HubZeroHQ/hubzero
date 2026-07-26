'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireCapability, requireEntryCapability } from '@/lib/auth/permissions';
import { careerInterestRepository } from '@/lib/db/repositories/career-interest';
import type { EntryActionState } from '@/lib/studio/entry-actions';
import type { LeadStatus } from '@/types/studio';

const LIST_PATH = '/studio/candidates';
const detailPath = (id: string) => `${LIST_PATH}/${id}`;

function actionErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Try again.';
}

/**
 * Mirrors `actions/lead.ts` exactly — `CareerInterest` carries the same
 * `assignedToUserId` field `OwnableEntry` needs, so a Team Member's
 * `editAssignedEntry` capability applies here with no new capability or
 * permissions-table change, same reasoning as Lead's own doc comment.
 */
export async function updateCareerInterestStatusAction(
  id: string,
  status: LeadStatus,
): Promise<EntryActionState> {
  const existing = await careerInterestRepository.findById(id);
  if (!existing) {
    return { error: 'This candidate no longer exists.' };
  }

  try {
    await requireEntryCapability(existing);
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  await careerInterestRepository.update(id, { status });
  revalidatePath(detailPath(id));
  revalidatePath(LIST_PATH);
  return {};
}

export async function updateCareerInterestNotesAction(
  id: string,
  _prevState: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  const existing = await careerInterestRepository.findById(id);
  if (!existing) {
    return { error: 'This candidate no longer exists.' };
  }

  try {
    await requireEntryCapability(existing);
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  await careerInterestRepository.update(id, {
    internalNotes: String(formData.get('internalNotes') ?? ''),
  });
  revalidatePath(detailPath(id));
  return {};
}

export async function assignCareerInterestAction(
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
  await careerInterestRepository.update(id, { assignedToUserId: assignedToUserId || undefined });
  revalidatePath(detailPath(id));
  revalidatePath(LIST_PATH);
  return {};
}

export async function setCareerInterestArchivedAction(
  id: string,
  archived: boolean,
): Promise<EntryActionState> {
  try {
    await requireCapability('editAnyEntry');
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  await careerInterestRepository.update(id, { archived });
  revalidatePath(detailPath(id));
  revalidatePath(LIST_PATH);
  return {};
}

export async function deleteCareerInterestAction(id: string): Promise<EntryActionState> {
  try {
    await requireCapability('editAnyEntry');
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  await careerInterestRepository.remove(id);
  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}
