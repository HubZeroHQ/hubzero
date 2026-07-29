'use server';

import { careerRepository } from '@/lib/db/repositories/career';
import { careerInterestRepository } from '@/lib/db/repositories/career-interest';
import { zodErrorToFieldErrors } from '@/lib/validation/form-errors';
import { isLikelyAutomated } from './contact';
import {
  careerInterestValuesFromFormData,
  INITIAL_CAREER_INTEREST_STATE,
  publicCareerInterestSchema,
  type CareerInterestActionState,
} from './career-interest';

/**
 * Public DTOs never carry a Career's raw database id (`repository.ts` strips
 * it, same as every other public entity) — the form submits the slug it
 * already has, and this resolves it to a real id server-side before
 * `CareerInterest.careerId` (which the storage schema validates as an
 * ObjectId) is ever touched.
 */
async function resolveCareerIdFromSlug(formData: FormData): Promise<string | undefined> {
  const slug = formData.get('careerSlug');
  if (typeof slug !== 'string' || !slug) return undefined;
  const career = await careerRepository.findBySlug(slug);
  return career?._id.toString();
}

export async function submitCareerInterest(
  _previousState: CareerInterestActionState,
  formData: FormData,
): Promise<CareerInterestActionState> {
  const values = careerInterestValuesFromFormData(formData);
  const parsed = publicCareerInterestSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Review the marked fields and try again.',
      fieldErrors: zodErrorToFieldErrors(parsed.error),
      values,
    };
  }

  // Return the ordinary success state for automated submissions. Revealing which
  // trap fired only teaches a sender how to bypass it (mirrors contact-action.ts).
  if (
    isLikelyAutomated({
      website: formData.get('website'),
      startedAt: formData.get('startedAt'),
    })
  ) {
    return { status: 'success', values: INITIAL_CAREER_INTEREST_STATE.values };
  }

  const careerId = await resolveCareerIdFromSlug(formData);

  try {
    await careerInterestRepository.create({
      name: parsed.data.name,
      email: parsed.data.email,
      ...(parsed.data.resumeUrl ? { resumeUrl: parsed.data.resumeUrl } : {}),
      ...(parsed.data.portfolioUrl ? { portfolioUrl: parsed.data.portfolioUrl } : {}),
      ...(parsed.data.githubUrl ? { githubUrl: parsed.data.githubUrl } : {}),
      ...(parsed.data.linkedinUrl ? { linkedinUrl: parsed.data.linkedinUrl } : {}),
      areasOfInterest: parsed.data.areasOfInterest,
      introduction: parsed.data.introduction,
      ...(careerId ? { careerId } : {}),
      status: 'new',
      archived: false,
    });
    return { status: 'success', values: INITIAL_CAREER_INTEREST_STATE.values };
  } catch (error) {
    console.error('Public career interest submission could not be stored.', error);
    return {
      status: 'error',
      message: 'The submission could not be saved. Your entries are still here; try again.',
      values,
    };
  }
}
