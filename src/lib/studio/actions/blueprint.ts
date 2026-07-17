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
import { blueprintRepository } from '@/lib/db/repositories/blueprint';
import type { BlueprintInput } from '@/lib/validation/blueprint';
import type { Blueprint } from '@/types/studio';

const BLUEPRINTS_LIST_PATH = '/studio/content/blueprints';
const blueprintDetailPath = (id: string) => `/studio/content/blueprints/${id}`;

function readOptionalString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed === '' ? undefined : trimmed;
}

/** One feature per line — the plain-textarea equivalent of `RelationMultiSelect`'s multi-value checkboxes, for a free-text list rather than a relation. */
function readFeatures(formData: FormData): string[] {
  const raw = String(formData.get('features') ?? '');
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function readBlueprintMetadataFields(formData: FormData) {
  return {
    name: String(formData.get('name') ?? ''),
    slug: String(formData.get('slug') ?? ''),
    architecture: String(formData.get('architecture') ?? ''),
    designLanguage: String(formData.get('designLanguage') ?? ''),
    shortDescription: String(formData.get('shortDescription') ?? ''),
    liveDeploymentUrl: String(formData.get('liveDeploymentUrl') ?? ''),
    version: String(formData.get('version') || '1.0.0'),
    features: readFeatures(formData),
    technologyIds: formData.getAll('technologyIds').map(String),
    previewAssetIds: formData.getAll('previewAssetIds').map(String),
    featured: formData.get('featured') === 'on',
  };
}

/** New entries always start as `draft` — publishing only ever happens through the status stepper (§28), never a form field. */
function parseBlueprintCreateFormData(formData: FormData): BlueprintInput {
  const repoUrl = readOptionalString(formData, 'repoUrl');
  const docsUrl = readOptionalString(formData, 'docsUrl');
  const heroImageId = readOptionalString(formData, 'heroImageId');
  return {
    ...readBlueprintMetadataFields(formData),
    status: 'draft',
    ...(repoUrl !== undefined ? { repoUrl } : {}),
    ...(docsUrl !== undefined ? { docsUrl } : {}),
    ...(heroImageId !== undefined ? { heroImageId } : {}),
  };
}

function parseBlueprintUpdateFormData(formData: FormData): Partial<BlueprintInput> {
  return {
    ...readBlueprintMetadataFields(formData),
    // Present even when `undefined` (never omitted) — an explicit `undefined`
    // key tells `createRepository().update()` to `$unset` the field, which is
    // how clearing a previously-set optional field actually persists instead
    // of silently leaving the stale value (mirrors `actions/build.ts`).
    repoUrl: readOptionalString(formData, 'repoUrl'),
    docsUrl: readOptionalString(formData, 'docsUrl'),
    heroImageId: readOptionalString(formData, 'heroImageId'),
  };
}

export const createBlueprintAction = createEntryCreateAction<Blueprint, BlueprintInput>({
  create: blueprintRepository.create,
  parseFormData: parseBlueprintCreateFormData,
  idOf: (record) => record._id.toString(),
  listPath: BLUEPRINTS_LIST_PATH,
  detailPath: blueprintDetailPath,
});

export const updateBlueprintAction = createEntryUpdateAction<Blueprint, BlueprintInput>({
  findById: blueprintRepository.findById,
  update: blueprintRepository.update,
  parseFormData: parseBlueprintUpdateFormData,
  detailPath: blueprintDetailPath,
});

export const transitionBlueprintStatusAction = createEntryTransitionAction<Blueprint>({
  findById: blueprintRepository.findById,
  setStatus: (id, status) => blueprintRepository.update(id, { status }),
  detailPath: blueprintDetailPath,
});

/** A Blueprint owns one Document (§11, §26.3) — `caseStudy` — the "long description." */
export const saveBlueprintCaseStudyAction = createDocumentSaveAction<Blueprint>({
  ownerType: 'Blueprint',
  role: 'caseStudy',
  findOwnerById: blueprintRepository.findById,
  detailPath: blueprintDetailPath,
});

export const generateBlueprintCaseStudyDocumentAction = createGenerateDocumentAction<Blueprint>({
  ownerType: 'Blueprint',
  role: 'caseStudy',
  findOwnerById: blueprintRepository.findById,
});

export const generateBlueprintCaseStudyBlockAction = createGenerateBlockAction<Blueprint>({
  ownerType: 'Blueprint',
  role: 'caseStudy',
  findOwnerById: blueprintRepository.findById,
});

export const transformBlueprintCaseStudyBlockAction = createTransformBlockAction<Blueprint>({
  ownerType: 'Blueprint',
  role: 'caseStudy',
  findOwnerById: blueprintRepository.findById,
});

export const transformBlueprintCaseStudySelectionAction = createTransformSelectionAction<Blueprint>(
  {
    ownerType: 'Blueprint',
    role: 'caseStudy',
    findOwnerById: blueprintRepository.findById,
  },
);
