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

/** Only the minimal `StudioSettings` branding fields are editable — everything else on this page is a read-only derivation of existing config (`system-info.ts`, `config/public-site.ts`). */
export async function updateStudioSettingsAction(
  _prevState: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  try {
    await requireCapability('manageSystemConfig');
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  const accentColor = String(formData.get('accentColor') ?? '').trim();

  try {
    await settingsRepository.update({
      studioName: String(formData.get('studioName') ?? ''),
      tagline: String(formData.get('tagline') ?? ''),
      contactEmail: String(formData.get('contactEmail') ?? '')
        .trim()
        .toLowerCase(),
      accentColor: accentColor || undefined,
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
