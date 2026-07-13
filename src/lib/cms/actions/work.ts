'use server';

import { createDocumentSaveAction } from '@/lib/cms/document-actions';
import {
  createEntryCreateAction,
  createEntryTransitionAction,
  createEntryUpdateAction,
} from '@/lib/cms/entry-actions';
import { workRepository } from '@/lib/db/repositories/work';
import type { WorkInput } from '@/lib/validation/work';
import type { Work } from '@/types/cms';

const WORK_LIST_PATH = '/cms/content/work';
const workDetailPath = (id: string) => `/cms/content/work/${id}`;

function readWorkMetadataFields(formData: FormData) {
  return {
    title: String(formData.get('title') ?? ''),
    slug: String(formData.get('slug') ?? ''),
    clientType: String(formData.get('clientType') ?? ''),
    timeline: String(formData.get('timeline') ?? ''),
    role: String(formData.get('role') ?? ''),
    categoryTagIds: formData.getAll('categoryTagIds').map(String),
    technologyIds: formData.getAll('technologyIds').map(String),
    relatedBuildIds: formData.getAll('relatedBuildIds').map(String),
    relatedBlueprintIds: formData.getAll('relatedBlueprintIds').map(String),
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
});

export const updateWorkAction = createEntryUpdateAction<Work, WorkInput>({
  findById: workRepository.findById,
  update: workRepository.update,
  parseFormData: parseWorkUpdateFormData,
  detailPath: workDetailPath,
});

export const transitionWorkStatusAction = createEntryTransitionAction<Work>({
  findById: workRepository.findById,
  setStatus: (id, status) => workRepository.update(id, { status }),
  detailPath: workDetailPath,
});

export const saveWorkCaseStudyAction = createDocumentSaveAction<Work>({
  ownerType: 'Work',
  role: 'caseStudy',
  findOwnerById: workRepository.findById,
  detailPath: workDetailPath,
});
