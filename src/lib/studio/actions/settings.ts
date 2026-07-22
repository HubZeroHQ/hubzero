'use server';

import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import { requireCapability } from '@/lib/auth/permissions';
import { settingsRepository } from '@/lib/db/repositories/settings';
import type { EntryActionState } from '@/lib/studio/entry-actions';
import { zodErrorToFieldErrors } from '@/lib/validation/form-errors';

const PATH = '/studio/settings/system';

function actionErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Try again.';
}

/** Only the Studio's operational identity is editable; deployment state remains read-only. */
export async function updateStudioSettingsAction(
  _prevState: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  try {
    await requireCapability('manageSystemConfig');
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  try {
    await settingsRepository.update({
      studioName: String(formData.get('studioName') ?? ''),
      contactEmail: String(formData.get('contactEmail') ?? '')
        .trim()
        .toLowerCase(),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: 'Check the highlighted fields.', fieldErrors: zodErrorToFieldErrors(error) };
    }
    return { error: actionErrorMessage(error) };
  }

  revalidatePath(PATH);
  return {};
}
