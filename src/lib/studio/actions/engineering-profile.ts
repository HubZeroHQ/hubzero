'use server';

import { engineeringProfileRepository } from '@/lib/db/repositories/engineering-profile';
import { createDocumentSaveAction } from '@/lib/studio/document-actions';
import {
  createEntryCreateAction,
  createEntryTransitionAction,
  createEntryUpdateAction,
} from '@/lib/studio/entry-actions';
import type { EngineeringProfileInput } from '@/lib/validation/engineering-profile';
import type { EngineeringProfile } from '@/types/studio';

const LIST_PATH = '/studio/engineering-profiles';
const detailPath = (id: string) => `${LIST_PATH}/${id}`;
const optional = (formData: FormData, key: string) => {
  const value = String(formData.get(key) ?? '').trim();
  return value || undefined;
};
const list = (formData: FormData, key: string) => formData.getAll(key).map(String);
const lines = (formData: FormData, key: string) =>
  String(formData.get(key) ?? '')
    .split('\n')
    .map((v) => v.trim())
    .filter(Boolean);

function metadata(formData: FormData) {
  return {
    slug: String(formData.get('slug') ?? ''),
    teamMemberId: String(formData.get('teamMemberId') ?? ''),
    overview: String(formData.get('overview') ?? ''),
    engineeringPhilosophy: String(formData.get('engineeringPhilosophy') ?? ''),
    currentExploration: String(formData.get('currentExploration') ?? ''),
    areasOfExpertise: lines(formData, 'areasOfExpertise'),
    currentInterests: lines(formData, 'currentInterests'),
    engineeringIdentity: lines(formData, 'engineeringIdentity'),
    technologyIds: list(formData, 'technologyIds'),
    featuredWorkIds: list(formData, 'featuredWorkIds'),
    featuredBuildIds: list(formData, 'featuredBuildIds'),
    featuredBlueprintIds: list(formData, 'featuredBlueprintIds'),
    featuredLabIds: list(formData, 'featuredLabIds'),
    featuredNoteIds: list(formData, 'featuredNoteIds'),
    galleryImageIds: list(formData, 'galleryImageIds'),
    portraitId: optional(formData, 'portraitId'),
    heroMediaId: optional(formData, 'heroMediaId'),
  };
}
const parseCreate = (formData: FormData) =>
  ({ ...metadata(formData), status: 'draft' }) as EngineeringProfileInput;
const parseUpdate = (formData: FormData) => metadata(formData) as Partial<EngineeringProfileInput>;

export const createEngineeringProfileAction = createEntryCreateAction<
  EngineeringProfile,
  EngineeringProfileInput
>({
  create: engineeringProfileRepository.create,
  parseFormData: parseCreate,
  idOf: (r) => r._id.toString(),
  listPath: LIST_PATH,
  detailPath,
  publicType: 'engineeringProfile',
});
export const updateEngineeringProfileAction = createEntryUpdateAction<
  EngineeringProfile,
  EngineeringProfileInput
>({
  findById: engineeringProfileRepository.findById,
  update: engineeringProfileRepository.update,
  parseFormData: parseUpdate,
  detailPath,
  publicType: 'engineeringProfile',
});
export const transitionEngineeringProfileStatusAction =
  createEntryTransitionAction<EngineeringProfile>({
    findById: engineeringProfileRepository.findById,
    setStatus: (id, status) => engineeringProfileRepository.update(id, { status }),
    detailPath,
    publicType: 'engineeringProfile',
  });

export const saveEngineeringProfileDocumentAction = async (
  role: import('@/config/engineering-profiles').EngineeringProfileDocumentRole,
  ownerId: string,
  blocks: import('@/lib/documents/blocks').Block[],
) =>
  createDocumentSaveAction<EngineeringProfile>({
    ownerType: 'EngineeringProfile',
    role,
    findOwnerById: engineeringProfileRepository.findById,
    detailPath,
  })(ownerId, blocks);
