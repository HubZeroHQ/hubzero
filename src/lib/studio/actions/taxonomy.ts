'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';
import { requireCapability } from '@/lib/auth/permissions';
import { taxonomyRepository } from '@/lib/db/repositories/taxonomy';
import { reassignTaxonomyReferences, totalTaxonomyUsage } from '@/lib/studio/safeguards/taxonomy';
import type { EntryActionState } from '@/lib/studio/entry-actions';
import { zodErrorToFieldErrors } from '@/lib/validation/form-errors';

const LIST_PATH = '/studio/library/taxonomy';

function actionErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Try again.';
}

function readTaxonomyFields(formData: FormData) {
  return {
    kind: String(formData.get('kind') ?? 'technology') as 'technology' | 'category' | 'topic',
    label: String(formData.get('label') ?? ''),
    slug: String(formData.get('slug') ?? ''),
  };
}

export async function createTaxonomyEntryAction(
  _prevState: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  try {
    await requireCapability('createAnyEntry');
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  const fields = readTaxonomyFields(formData);
  const existing = await taxonomyRepository.findBySlug(fields.slug);
  if (existing) {
    return {
      error: 'Check the highlighted fields.',
      fieldErrors: { slug: 'A Taxonomy entry with this slug already exists.' },
    };
  }

  try {
    await taxonomyRepository.create(fields);
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: 'Check the highlighted fields.', fieldErrors: zodErrorToFieldErrors(error) };
    }
    return { error: actionErrorMessage(error) };
  }

  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}

export async function updateTaxonomyEntryAction(
  id: string,
  _prevState: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  try {
    await requireCapability('editAnyEntry');
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  const existing = await taxonomyRepository.findById(id);
  if (!existing) {
    return { error: 'This Taxonomy entry no longer exists.' };
  }

  const fields = readTaxonomyFields(formData);
  if (fields.slug !== existing.slug) {
    const slugOwner = await taxonomyRepository.findBySlug(fields.slug);
    if (slugOwner) {
      return {
        error: 'Check the highlighted fields.',
        fieldErrors: { slug: 'A Taxonomy entry with this slug already exists.' },
      };
    }
  }

  try {
    await taxonomyRepository.update(id, fields);
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: 'Check the highlighted fields.', fieldErrors: zodErrorToFieldErrors(error) };
    }
    return { error: actionErrorMessage(error) };
  }

  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}

export async function deleteTaxonomyEntryAction(id: string): Promise<EntryActionState> {
  try {
    await requireCapability('editAnyEntry');
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  const usage = await totalTaxonomyUsage(id);
  if (usage > 0) {
    return {
      error: `Still referenced by ${usage} ${usage === 1 ? 'entry' : 'entries'}. Merge it into another Taxonomy entry first, or remove those references.`,
    };
  }

  await taxonomyRepository.remove(id);
  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}

/** Reassigns every reference from `sourceId` to `targetId`, then removes the now-unused source entry — the delete safeguard's escape hatch for real duplicates. */
export async function mergeTaxonomyEntriesAction(
  _prevState: EntryActionState,
  formData: FormData,
): Promise<EntryActionState> {
  try {
    await requireCapability('editAnyEntry');
  } catch (error) {
    return { error: actionErrorMessage(error) };
  }

  const sourceId = String(formData.get('sourceId') ?? '');
  const targetId = String(formData.get('targetId') ?? '');

  if (!sourceId || !targetId || sourceId === targetId) {
    return { error: 'Choose two different Taxonomy entries to merge.' };
  }

  const [source, target] = await Promise.all([
    taxonomyRepository.findById(sourceId),
    taxonomyRepository.findById(targetId),
  ]);
  if (!source || !target) {
    return { error: 'One of these Taxonomy entries no longer exists.' };
  }
  if (source.kind !== target.kind) {
    return { error: 'Only entries of the same kind can be merged.' };
  }

  await reassignTaxonomyReferences(sourceId, targetId);
  await taxonomyRepository.remove(sourceId);

  revalidatePath(LIST_PATH);
  return {};
}
