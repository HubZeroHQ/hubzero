'use server';

import { leadRepository } from '@/lib/db/repositories/lead';
import { zodErrorToFieldErrors } from '@/lib/validation/form-errors';
import {
  contactValuesFromFormData,
  isLikelyAutomated,
  normalizeContactSource,
  publicContactSchema,
  type ContactActionState,
} from './contact';

export async function submitContact(
  _previousState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const values = contactValuesFromFormData(formData);
  const parsed = publicContactSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Review the marked fields and send the message again.',
      fieldErrors: zodErrorToFieldErrors(parsed.error),
      values,
    };
  }

  // Return the ordinary success state for automated submissions. Revealing which
  // trap fired only teaches a sender how to bypass it.
  if (
    isLikelyAutomated({
      website: formData.get('website'),
      startedAt: formData.get('startedAt'),
    })
  ) {
    return { status: 'success', values: { name: '', email: '', message: '' } };
  }

  try {
    await leadRepository.create({
      ...parsed.data,
      source: `public:${normalizeContactSource(formData.get('source'))}`,
      status: 'new',
    });
    return { status: 'success', values: { name: '', email: '', message: '' } };
  } catch (error) {
    console.error('Public contact submission could not be stored.', error);
    return {
      status: 'error',
      message: 'The message could not be saved. Your entries are still here; try again.',
      values,
    };
  }
}
