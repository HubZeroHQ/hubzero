'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';
import { requireCapability } from '@/lib/auth/permissions';
import { engineeringProfileRepository } from '@/lib/db/repositories/engineering-profile';
import { teamRepository } from '@/lib/db/repositories/team';
import type { EntryActionState } from '@/lib/studio/entry-actions';
import { zodErrorToFieldErrors } from '@/lib/validation/form-errors';
import type { TeamInput } from '@/lib/validation/team';

const LIST_PATH = '/studio/team';
const detailPath = (id: string) => `${LIST_PATH}/${id}`;

function actionErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Try again.';
}

function readSocialLinks(formData: FormData) {
  const platforms = formData.getAll('socialLinks.platform').map(String);
  const urls = formData.getAll('socialLinks.url').map(String);
  return platforms
    .map((platform, index) => ({ platform: platform.trim(), url: (urls[index] ?? '').trim() }))
    .filter((link) => link.platform && link.url);
}

function readTeamMetadataFields(formData: FormData) {
  const portraitId = String(formData.get('portraitId') ?? '').trim();
  return {
    name: String(formData.get('name') ?? ''),
    role: String(formData.get('role') ?? ''),
    bio: String(formData.get('bio') ?? ''),
    group: String(formData.get('group') ?? ''),
    order: Number(formData.get('order') ?? 0),
    founder: formData.get('founder') === 'on',
    publicProfile: formData.get('publicProfile') === 'on',
    socialLinks: readSocialLinks(formData),
    ...(portraitId ? { portraitId } : {}),
  };
}

export async function createTeamAction(
  _prevState: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  try {
    await requireCapability('createAnyEntry');
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  let created;
  try {
    created = await teamRepository.create({
      ...readTeamMetadataFields(formData),
      archived: false,
    } as TeamInput);
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: 'Check the highlighted fields.', fieldErrors: zodErrorToFieldErrors(error) };
    }
    return { error: actionErrorMessage(error) };
  }

  revalidatePath(LIST_PATH);
  redirect(detailPath(created._id.toString()));
}

export async function updateTeamAction(
  id: string,
  _prevState: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  try {
    await requireCapability('editAnyEntry');
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  const existing = await teamRepository.findById(id);
  if (!existing) {
    return { error: 'This Team member no longer exists.' };
  }

  try {
    await teamRepository.update(id, {
      ...readTeamMetadataFields(formData),
      // An explicit `undefined` tells `update()` to `$unset` the field, so
      // removing a previously-set portrait persists rather than leaving the
      // stale reference (mirrors `actions/blueprint.ts`).
      portraitId: String(formData.get('portraitId') ?? '').trim() || undefined,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: 'Check the highlighted fields.', fieldErrors: zodErrorToFieldErrors(error) };
    }
    return { error: actionErrorMessage(error) };
  }

  revalidatePath(detailPath(id));
  redirect(detailPath(id));
}

export async function setTeamArchivedAction(
  id: string,
  archived: boolean,
): Promise<EntryActionState> {
  try {
    await requireCapability('editAnyEntry');
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  await teamRepository.update(id, { archived });
  revalidatePath(detailPath(id));
  revalidatePath(LIST_PATH);
  return {};
}

export async function deleteTeamAction(id: string): Promise<EntryActionState> {
  try {
    await requireCapability('editAnyEntry');
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  const linkedProfile = await engineeringProfileRepository.findByTeamMemberId(id);
  if (linkedProfile) {
    return {
      error:
        'This Team member has a linked Engineering Profile. Delete or unlink that profile first.',
    };
  }

  await teamRepository.remove(id);
  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}
