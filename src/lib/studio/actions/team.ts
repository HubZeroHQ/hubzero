'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';
import { requireCapability } from '@/lib/auth/permissions';
import { engineeringProfileRepository } from '@/lib/db/repositories/engineering-profile';
import { teamRepository } from '@/lib/db/repositories/team';
import type { EntryActionState } from '@/lib/studio/entry-actions';
import { invalidatePublicEntity } from '@/lib/public/cache';
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
  const joinedAt = String(formData.get('joinedAt') ?? '').trim();
  const publicCategory = formData.get('publicCategory') === 'leadership' ? 'leadership' : 'team';
  return {
    name: String(formData.get('name') ?? ''),
    role: String(formData.get('role') ?? ''),
    bio: String(formData.get('bio') ?? ''),
    group: String(formData.get('group') ?? ''),
    order: Number(formData.get('order') ?? 0),
    founder: formData.get('founder') === 'on',
    publicCategory,
    engineeringProfileEligible: formData.get('engineeringProfileEligible') === 'on',
    publicProfile: formData.get('publicProfile') === 'on',
    socialLinks: readSocialLinks(formData),
    ...(portraitId ? { portraitId } : {}),
    ...(joinedAt ? { joinedAt } : {}),
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

  invalidatePublicEntity('teamMember');
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
      // removing a previously-set portrait/joined-date persists rather than
      // leaving the stale value (mirrors `actions/blueprint.ts`). `joinedAt`
      // is read here as a plain string from `<input type="date">` —
      // `teamSchema`'s `z.coerce.date()` does the real parsing at runtime
      // inside `teamRepository.update()`, so the cast below only bridges the
      // static gap (mirrors `lab.ts`'s `startDate`/`lastMajorUpdateAt`).
      portraitId: String(formData.get('portraitId') ?? '').trim() || undefined,
      joinedAt: String(formData.get('joinedAt') ?? '').trim() || undefined,
    } as unknown as Partial<TeamInput>);
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: 'Check the highlighted fields.', fieldErrors: zodErrorToFieldErrors(error) };
    }
    return { error: actionErrorMessage(error) };
  }

  invalidatePublicEntity('teamMember');
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
  invalidatePublicEntity('teamMember');
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
  invalidatePublicEntity('teamMember');
  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}
