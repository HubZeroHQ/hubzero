'use server';

import { createDocumentSaveAction } from '@/lib/studio/document-actions';
import {
  createEntryCreateAction,
  createEntryTransitionAction,
  createEntryUpdateAction,
} from '@/lib/studio/entry-actions';
import { buildRepository } from '@/lib/db/repositories/build';
import type { BuildInput } from '@/lib/validation/build';
import type { Build } from '@/types/studio';

const BUILDS_LIST_PATH = '/studio/content/builds';
const buildDetailPath = (id: string) => `/studio/content/builds/${id}`;

function readOptionalUrl(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed === '' ? undefined : trimmed;
}

function readOptionalId(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed === '' ? undefined : trimmed;
}

function readBuildMetadataFields(formData: FormData) {
  return {
    title: String(formData.get('title') ?? ''),
    slug: String(formData.get('slug') ?? ''),
    deploymentState: String(formData.get('deploymentState') ?? 'live') as BuildInput['deploymentState'],
    technologyIds: formData.getAll('technologyIds').map(String),
    relatedWorkIds: formData.getAll('relatedWorkIds').map(String),
    galleryImageIds: formData.getAll('galleryImageIds').map(String),
    featured: formData.get('featured') === 'on',
  };
}

/** New entries always start as `draft` — publishing only ever happens through the status stepper (§28), never a form field. */
function parseBuildCreateFormData(formData: FormData): BuildInput {
  const liveUrl = readOptionalUrl(formData, 'liveUrl');
  const repoUrl = readOptionalUrl(formData, 'repoUrl');
  const originatingLabId = readOptionalId(formData, 'originatingLabId');
  const heroImageId = readOptionalId(formData, 'heroImageId');
  return {
    ...readBuildMetadataFields(formData),
    status: 'draft',
    ...(liveUrl !== undefined ? { liveUrl } : {}),
    ...(repoUrl !== undefined ? { repoUrl } : {}),
    ...(originatingLabId !== undefined ? { originatingLabId } : {}),
    ...(heroImageId !== undefined ? { heroImageId } : {}),
  };
}

function parseBuildUpdateFormData(formData: FormData): Partial<BuildInput> {
  return {
    ...readBuildMetadataFields(formData),
    // Present even when `undefined` (never omitted) — an explicit `undefined`
    // key tells `createRepository().update()` to `$unset` the field, which is
    // how clearing a previously-set optional field actually persists instead
    // of silently leaving the stale value (mirrors `actions/work.ts`).
    liveUrl: readOptionalUrl(formData, 'liveUrl'),
    repoUrl: readOptionalUrl(formData, 'repoUrl'),
    originatingLabId: readOptionalId(formData, 'originatingLabId'),
    heroImageId: readOptionalId(formData, 'heroImageId'),
  };
}

export const createBuildAction = createEntryCreateAction<Build, BuildInput>({
  create: buildRepository.create,
  parseFormData: parseBuildCreateFormData,
  idOf: (record) => record._id.toString(),
  listPath: BUILDS_LIST_PATH,
  detailPath: buildDetailPath,
});

export const updateBuildAction = createEntryUpdateAction<Build, BuildInput>({
  findById: buildRepository.findById,
  update: buildRepository.update,
  parseFormData: parseBuildUpdateFormData,
  detailPath: buildDetailPath,
});

export const transitionBuildStatusAction = createEntryTransitionAction<Build>({
  findById: buildRepository.findById,
  setStatus: (id, status) => buildRepository.update(id, { status }),
  detailPath: buildDetailPath,
});

/** A Build owns two Documents (§10, §26.2) — `caseStudy` and `technical` — each saved through its own bound action. */
export const saveBuildCaseStudyAction = createDocumentSaveAction<Build>({
  ownerType: 'Build',
  role: 'caseStudy',
  findOwnerById: buildRepository.findById,
  detailPath: buildDetailPath,
});

export const saveBuildTechnicalAction = createDocumentSaveAction<Build>({
  ownerType: 'Build',
  role: 'technical',
  findOwnerById: buildRepository.findById,
  detailPath: buildDetailPath,
});
