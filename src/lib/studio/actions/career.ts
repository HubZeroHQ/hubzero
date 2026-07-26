'use server';

import { createDocumentSaveAction } from '@/lib/studio/document-actions';
import {
  createEntryCreateAction,
  createEntryTransitionAction,
  createEntryUpdateAction,
} from '@/lib/studio/entry-actions';
import {
  createGenerateBlockAction,
  createGenerateDocumentAction,
  createTransformBlockAction,
  createTransformSelectionAction,
} from '@/lib/studio/generate-content-actions';
import { careerRepository } from '@/lib/db/repositories/career';
import { CAREER_RELATED_ENTRY_FIELDS } from '@/lib/studio/career-relations';
import type { CareerInput } from '@/lib/validation/career';
import type { Career } from '@/types/studio';

const CAREERS_LIST_PATH = '/studio/content/careers';
const careerDetailPath = (id: string) => `/studio/content/careers/${id}`;

function readOptionalString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed === '' ? undefined : trimmed;
}

/** One item per line — the plain-textarea equivalent of `RelationMultiSelect`'s checkboxes, for a free-text list rather than a relation (mirrors `actions/blueprint.ts`'s `readFeatures`). */
function readLineList(formData: FormData, key: string): string[] {
  const raw = String(formData.get(key) ?? '');
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** Merges the form's four typed relation pickers into one `relatedEntries` array — the inverse of `career-relations.ts`'s `splitCareerRelatedEntries`. */
function readCareerRelatedEntries(formData: FormData): CareerInput['relatedEntries'] {
  return CAREER_RELATED_ENTRY_FIELDS.flatMap(({ key, field }) =>
    formData.getAll(field).map((id) => ({ ownerType: key, ownerId: String(id) })),
  );
}

function readCareerMetadataFields(formData: FormData) {
  return {
    title: String(formData.get('title') ?? ''),
    slug: String(formData.get('slug') ?? ''),
    location: String(formData.get('location') ?? ''),
    employmentType: String(formData.get('employmentType') ?? ''),
    experienceLevel: String(formData.get('experienceLevel') ?? ''),
    summary: String(formData.get('summary') ?? ''),
    responsibilities: readLineList(formData, 'responsibilities'),
    requirements: readLineList(formData, 'requirements'),
    benefits: readLineList(formData, 'benefits'),
    applicationProcess: String(formData.get('applicationProcess') ?? ''),
    technologyIds: formData.getAll('technologyIds').map(String),
    relatedEntries: readCareerRelatedEntries(formData),
    // `employmentType`/`experienceLevel` are read as plain strings above —
    // `careerSchema`'s enum validators perform the actual parsing at runtime
    // inside `careerRepository.create()`/`.update()`, mirroring how
    // `actions/note.ts` bridges `publicationDate`'s static/runtime gap.
  } as unknown as Omit<CareerInput, 'status' | 'compensation' | 'hiringManagerTeamId'>;
}

/** New entries always start as `draft` — publishing only ever happens through the status stepper (§28), never a form field. */
function parseCareerCreateFormData(formData: FormData): CareerInput {
  const compensation = readOptionalString(formData, 'compensation');
  const hiringManagerTeamId = readOptionalString(formData, 'hiringManagerTeamId');
  return {
    ...readCareerMetadataFields(formData),
    status: 'draft',
    ...(compensation !== undefined ? { compensation } : {}),
    ...(hiringManagerTeamId !== undefined ? { hiringManagerTeamId } : {}),
  } as unknown as CareerInput;
}

function parseCareerUpdateFormData(formData: FormData): Partial<CareerInput> {
  return {
    ...readCareerMetadataFields(formData),
    // Present even when `undefined` (never omitted) — an explicit `undefined`
    // key tells `createRepository().update()` to `$unset` the field, the same
    // clear-on-empty behavior `actions/note.ts` relies on for `heroImageId`.
    compensation: readOptionalString(formData, 'compensation'),
    hiringManagerTeamId: readOptionalString(formData, 'hiringManagerTeamId'),
  } as unknown as Partial<CareerInput>;
}

export const createCareerAction = createEntryCreateAction<Career, CareerInput>({
  create: careerRepository.create,
  parseFormData: parseCareerCreateFormData,
  idOf: (record) => record._id.toString(),
  listPath: CAREERS_LIST_PATH,
  detailPath: careerDetailPath,
  publicType: 'career',
});

export const updateCareerAction = createEntryUpdateAction<Career, CareerInput>({
  findById: careerRepository.findById,
  update: careerRepository.update,
  parseFormData: parseCareerUpdateFormData,
  detailPath: careerDetailPath,
  publicType: 'career',
});

export const transitionCareerStatusAction = createEntryTransitionAction<Career>({
  findById: careerRepository.findById,
  setStatus: (id, status, reviewNote) =>
    careerRepository.update(id, { status, reviewNote: reviewNote ?? null }),
  detailPath: careerDetailPath,
  publicType: 'career',
});

/** A Career listing owns one Document — `overview` — the long-form role narrative. */
export const saveCareerOverviewAction = createDocumentSaveAction<Career>({
  ownerType: 'Career',
  role: 'overview',
  findOwnerById: careerRepository.findById,
  detailPath: careerDetailPath,
});

/** "Generate content" for the Career overview Document — same authorization as saving it. */
export const generateCareerOverviewDocumentAction = createGenerateDocumentAction<Career>({
  ownerType: 'Career',
  role: 'overview',
  findOwnerById: careerRepository.findById,
});

export const generateCareerOverviewBlockAction = createGenerateBlockAction<Career>({
  ownerType: 'Career',
  role: 'overview',
  findOwnerById: careerRepository.findById,
});

export const transformCareerOverviewBlockAction = createTransformBlockAction<Career>({
  ownerType: 'Career',
  role: 'overview',
  findOwnerById: careerRepository.findById,
});

export const transformCareerOverviewSelectionAction = createTransformSelectionAction<Career>({
  ownerType: 'Career',
  role: 'overview',
  findOwnerById: careerRepository.findById,
});
