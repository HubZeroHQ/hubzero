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
import { workRepository } from '@/lib/db/repositories/work';
import type { WorkInput } from '@/lib/validation/work';
import type { Work } from '@/types/studio';

const WORK_LIST_PATH = '/studio/content/work';
const workDetailPath = (id: string) => `/studio/content/work/${id}`;

function readWorkMetadataFields(formData: FormData) {
  return {
    title: String(formData.get('title') ?? ''),
    summary: String(formData.get('summary') ?? ''),
    slug: String(formData.get('slug') ?? ''),
    clientType: String(formData.get('clientType') ?? ''),
    timeline: String(formData.get('timeline') ?? ''),
    role: String(formData.get('role') ?? ''),
    categoryTagIds: formData.getAll('categoryTagIds').map(String),
    technologyIds: formData.getAll('technologyIds').map(String),
    relatedBuildIds: formData.getAll('relatedBuildIds').map(String),
    relatedBlueprintIds: formData.getAll('relatedBlueprintIds').map(String),
    relatedLabIds: formData.getAll('relatedLabIds').map(String),
    contributors: formData.getAll('contributors').map(String),
  };
}

function readRepoUrl(formData: FormData): string | undefined {
  const value = formData.get('repoUrl');
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed === '' ? undefined : trimmed;
}

/** New entries always start as `draft` — publishing only ever happens through the status stepper (§28), never a form field. */
function parseWorkCreateFormData(formData: FormData): WorkInput {
  const repoUrl = readRepoUrl(formData);
  return {
    ...readWorkMetadataFields(formData),
    status: 'draft',
    ...(repoUrl !== undefined ? { repoUrl } : {}),
  };
}

function parseWorkUpdateFormData(formData: FormData): Partial<WorkInput> {
  return {
    ...readWorkMetadataFields(formData),
    // Present even when `undefined` (never omitted) — an explicit
    // `undefined` key tells `createRepository().update()` to `$unset` the
    // field, which is how clearing a previously-set repository URL
    // actually persists instead of silently leaving the stale value.
    repoUrl: readRepoUrl(formData),
  };
}

export const createWorkAction = createEntryCreateAction<Work, WorkInput>({
  create: workRepository.create,
  parseFormData: parseWorkCreateFormData,
  idOf: (record) => record._id.toString(),
  listPath: WORK_LIST_PATH,
  detailPath: workDetailPath,
  publicType: 'work',
});

export const updateWorkAction = createEntryUpdateAction<Work, WorkInput>({
  findById: workRepository.findById,
  update: workRepository.update,
  parseFormData: parseWorkUpdateFormData,
  detailPath: workDetailPath,
  publicType: 'work',
});

export const transitionWorkStatusAction = createEntryTransitionAction<Work>({
  findById: workRepository.findById,
  setStatus: (id, status) => workRepository.update(id, { status }),
  detailPath: workDetailPath,
  publicType: 'work',
});

export const saveWorkCaseStudyAction = createDocumentSaveAction<Work>({
  ownerType: 'Work',
  role: 'caseStudy',
  findOwnerById: workRepository.findById,
  detailPath: workDetailPath,
});

export const generateWorkCaseStudyDocumentAction = createGenerateDocumentAction<Work>({
  ownerType: 'Work',
  role: 'caseStudy',
  findOwnerById: workRepository.findById,
});

export const generateWorkCaseStudyBlockAction = createGenerateBlockAction<Work>({
  ownerType: 'Work',
  role: 'caseStudy',
  findOwnerById: workRepository.findById,
});

export const transformWorkCaseStudyBlockAction = createTransformBlockAction<Work>({
  ownerType: 'Work',
  role: 'caseStudy',
  findOwnerById: workRepository.findById,
});

export const transformWorkCaseStudySelectionAction = createTransformSelectionAction<Work>({
  ownerType: 'Work',
  role: 'caseStudy',
  findOwnerById: workRepository.findById,
});
