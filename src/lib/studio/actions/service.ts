'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';
import { requireCapability } from '@/lib/auth/permissions';
import { serviceRepository } from '@/lib/db/repositories/service';
import { SERVICE_EVIDENCE_FIELDS } from '@/lib/studio/service-relations';
import type { EntryActionState } from '@/lib/studio/entry-actions';
import { zodErrorToFieldErrors } from '@/lib/validation/form-errors';
import type { ServiceInput } from '@/lib/validation/service';
import type { ServicePublishStatus } from '@/types/studio';

const LIST_PATH = '/studio/services';
const detailPath = (id: string) => `${LIST_PATH}/${id}`;

function actionErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Try again.';
}

/** Merges the form's five typed evidence pickers into one `evidenceLinks` array — the inverse of `service-relations.ts`'s `splitServiceEvidenceLinks`. */
function readEvidenceLinks(formData: FormData): ServiceInput['evidenceLinks'] {
  return SERVICE_EVIDENCE_FIELDS.flatMap(({ key, field }) =>
    formData.getAll(field).map((id) => ({ ownerType: key, ownerId: String(id) })),
  );
}

function readServiceMetadataFields(formData: FormData) {
  return {
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? ''),
    order: Number(formData.get('order') ?? 0),
    featured: formData.get('featured') === 'on',
    evidenceLinks: readEvidenceLinks(formData),
  };
}

/** New entries always start as `draft` — publishing happens from the detail page's publish toggle, never a form field. */
export async function createServiceAction(
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
    created = await serviceRepository.create({
      ...readServiceMetadataFields(formData),
      status: 'draft',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: 'Check the highlighted fields.', fieldErrors: zodErrorToFieldErrors(error) };
    }
    return { error: actionErrorMessage(error) };
  }

  revalidatePath(LIST_PATH);
  redirect(detailPath(created._id.toString()));
}

export async function updateServiceAction(
  id: string,
  _prevState: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  try {
    await requireCapability('editAnyEntry');
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  const existing = await serviceRepository.findById(id);
  if (!existing) {
    return { error: 'This Service no longer exists.' };
  }

  try {
    await serviceRepository.update(id, readServiceMetadataFields(formData));
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: 'Check the highlighted fields.', fieldErrors: zodErrorToFieldErrors(error) };
    }
    return { error: actionErrorMessage(error) };
  }

  revalidatePath(detailPath(id));
  redirect(detailPath(id));
}

/** Service's simplified two-state workflow (§26.7) — a plain toggle, not the five-state `StatusStepper`. */
export async function setServiceStatusAction(
  id: string,
  status: ServicePublishStatus,
): Promise<EntryActionState> {
  try {
    await requireCapability('publish');
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  const existing = await serviceRepository.findById(id);
  if (!existing) {
    return { error: 'This Service no longer exists.' };
  }

  await serviceRepository.update(id, { status });
  revalidatePath(detailPath(id));
  revalidatePath(LIST_PATH);
  return {};
}

export async function deleteServiceAction(id: string): Promise<EntryActionState> {
  try {
    await requireCapability('editAnyEntry');
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  await serviceRepository.remove(id);
  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}
