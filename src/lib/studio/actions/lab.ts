'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';
import { requireCapability, requireEntryCapability } from '@/lib/auth/permissions';
import { createDocumentSaveAction } from '@/lib/studio/document-actions';
import {
  createEntryCreateAction,
  createEntryTransitionAction,
  createEntryUpdateAction,
  type EntryActionState,
} from '@/lib/studio/entry-actions';
import {
  createGenerateBlockAction,
  createGenerateDocumentAction,
  createTransformBlockAction,
  createTransformSelectionAction,
} from '@/lib/studio/generate-content-actions';
import { buildRepository } from '@/lib/db/repositories/build';
import { labRepository } from '@/lib/db/repositories/lab';
import type { LabInput } from '@/lib/validation/lab';
import type { Lab } from '@/types/studio';

const LABS_LIST_PATH = '/studio/content/labs';
const labDetailPath = (id: string) => `/studio/content/labs/${id}`;
const buildDetailPath = (id: string) => `/studio/content/builds/${id}`;

function readOptionalString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed === '' ? undefined : trimmed;
}

/** JSON-serialized array of `{ title, date, summary, relatedDocumentRole? }` — the Progress Timeline field's one hidden input (`ProgressTimelineField`). */
function readMilestones(formData: FormData): LabInput['milestones'] {
  const raw = readOptionalString(formData, 'milestones');
  if (!raw) {
    return [];
  }
  return JSON.parse(raw);
}

function readLabMetadataFields(formData: FormData) {
  return {
    title: String(formData.get('title') ?? ''),
    slug: String(formData.get('slug') ?? ''),
    stage: String(formData.get('stage') ?? 'exploring') as LabInput['stage'],
    objective: String(formData.get('objective') ?? ''),
    researchDirection: String(formData.get('researchDirection') ?? ''),
    currentMilestone: String(formData.get('currentMilestone') ?? ''),
    graduationCriteria: String(formData.get('graduationCriteria') ?? ''),
    internalRepoUrl: String(formData.get('internalRepoUrl') ?? ''),
    startDate: String(formData.get('startDate') ?? ''),
    technologyIds: formData.getAll('technologyIds').map(String),
    relatedBuildIds: formData.getAll('relatedBuildIds').map(String),
    relatedBlueprintIds: formData.getAll('relatedBlueprintIds').map(String),
    galleryImageIds: formData.getAll('galleryImageIds').map(String),
    featured: formData.get('featured') === 'on',
    milestones: readMilestones(formData),
  };
}

/** New entries always start as `draft` — publishing only ever happens through the status stepper (§28), never a form field. */
function parseLabCreateFormData(formData: FormData): LabInput {
  const publicRepoUrl = readOptionalString(formData, 'publicRepoUrl');
  const liveDemoUrl = readOptionalString(formData, 'liveDemoUrl');
  const heroImageId = readOptionalString(formData, 'heroImageId');
  const lastMajorUpdateAt = readOptionalString(formData, 'lastMajorUpdateAt');
  return {
    ...readLabMetadataFields(formData),
    status: 'draft',
    ...(publicRepoUrl !== undefined ? { publicRepoUrl } : {}),
    ...(liveDemoUrl !== undefined ? { liveDemoUrl } : {}),
    ...(heroImageId !== undefined ? { heroImageId } : {}),
    ...(lastMajorUpdateAt !== undefined ? { lastMajorUpdateAt } : {}),
    // `startDate`/`lastMajorUpdateAt` are read from `<input type="date">` as
    // plain strings — `labSchema`'s `z.coerce.date()` performs the actual
    // parsing at runtime inside `labRepository.create()`/`.update()`, so this
    // cast only bridges the static gap between the form's string values and
    // `LabInput`'s post-parse `Date` type (mirrors `blueprint.ts`'s branded
    // `name` cast for the same "runtime schema, not this type, is the real
    // gate" reason).
  } as unknown as LabInput;
}

function parseLabUpdateFormData(formData: FormData): Partial<LabInput> {
  return {
    ...readLabMetadataFields(formData),
    // Present even when `undefined` (never omitted) — an explicit `undefined`
    // key tells `createRepository().update()` to `$unset` the field, which is
    // how clearing a previously-set optional field actually persists instead
    // of silently leaving the stale value (mirrors `actions/build.ts`).
    publicRepoUrl: readOptionalString(formData, 'publicRepoUrl'),
    liveDemoUrl: readOptionalString(formData, 'liveDemoUrl'),
    heroImageId: readOptionalString(formData, 'heroImageId'),
    lastMajorUpdateAt: readOptionalString(formData, 'lastMajorUpdateAt'),
    // See the matching comment in `parseLabCreateFormData` re: `startDate`.
  } as unknown as Partial<LabInput>;
}

export const createLabAction = createEntryCreateAction<Lab, LabInput>({
  create: labRepository.create,
  parseFormData: parseLabCreateFormData,
  idOf: (record) => record._id.toString(),
  listPath: LABS_LIST_PATH,
  detailPath: labDetailPath,
  publicType: 'lab',
});

export const updateLabAction = createEntryUpdateAction<Lab, LabInput>({
  findById: labRepository.findById,
  update: labRepository.update,
  parseFormData: parseLabUpdateFormData,
  detailPath: labDetailPath,
  publicType: 'lab',
});

export const transitionLabStatusAction = createEntryTransitionAction<Lab>({
  findById: labRepository.findById,
  setStatus: (id, status) => labRepository.update(id, { status }),
  detailPath: labDetailPath,
  publicType: 'lab',
});

/** A Lab owns four Documents (Phase 10) — Overview, Engineering Journal, Findings, Research Notes — each saved through its own bound action, same pattern as Build's two. */
export const saveLabOverviewAction = createDocumentSaveAction<Lab>({
  ownerType: 'Lab',
  role: 'overview',
  findOwnerById: labRepository.findById,
  detailPath: labDetailPath,
});

export const saveLabEngineeringJournalAction = createDocumentSaveAction<Lab>({
  ownerType: 'Lab',
  role: 'engineeringJournal',
  findOwnerById: labRepository.findById,
  detailPath: labDetailPath,
});

export const saveLabFindingsAction = createDocumentSaveAction<Lab>({
  ownerType: 'Lab',
  role: 'findings',
  findOwnerById: labRepository.findById,
  detailPath: labDetailPath,
});

export const saveLabResearchNotesAction = createDocumentSaveAction<Lab>({
  ownerType: 'Lab',
  role: 'researchNotes',
  findOwnerById: labRepository.findById,
  detailPath: labDetailPath,
});

/** "Generate content" for each of a Lab's four Documents — same four-action shape as every other collection, repeated per role rather than per collection. */
function createLabGenerationActions(
  role: 'overview' | 'engineeringJournal' | 'findings' | 'researchNotes',
) {
  return {
    generateDocument: createGenerateDocumentAction<Lab>({
      ownerType: 'Lab',
      role,
      findOwnerById: labRepository.findById,
    }),
    generateBlock: createGenerateBlockAction<Lab>({
      ownerType: 'Lab',
      role,
      findOwnerById: labRepository.findById,
    }),
    transformBlock: createTransformBlockAction<Lab>({
      ownerType: 'Lab',
      role,
      findOwnerById: labRepository.findById,
    }),
    transformSelection: createTransformSelectionAction<Lab>({
      ownerType: 'Lab',
      role,
      findOwnerById: labRepository.findById,
    }),
  };
}

const labOverviewAi = createLabGenerationActions('overview');
export const generateLabOverviewDocumentAction = labOverviewAi.generateDocument;
export const generateLabOverviewBlockAction = labOverviewAi.generateBlock;
export const transformLabOverviewBlockAction = labOverviewAi.transformBlock;
export const transformLabOverviewSelectionAction = labOverviewAi.transformSelection;

const labEngineeringJournalAi = createLabGenerationActions('engineeringJournal');
export const generateLabEngineeringJournalDocumentAction = labEngineeringJournalAi.generateDocument;
export const generateLabEngineeringJournalBlockAction = labEngineeringJournalAi.generateBlock;
export const transformLabEngineeringJournalBlockAction = labEngineeringJournalAi.transformBlock;
export const transformLabEngineeringJournalSelectionAction =
  labEngineeringJournalAi.transformSelection;

const labFindingsAi = createLabGenerationActions('findings');
export const generateLabFindingsDocumentAction = labFindingsAi.generateDocument;
export const generateLabFindingsBlockAction = labFindingsAi.generateBlock;
export const transformLabFindingsBlockAction = labFindingsAi.transformBlock;
export const transformLabFindingsSelectionAction = labFindingsAi.transformSelection;

const labResearchNotesAi = createLabGenerationActions('researchNotes');
export const generateLabResearchNotesDocumentAction = labResearchNotesAi.generateDocument;
export const generateLabResearchNotesBlockAction = labResearchNotesAi.generateBlock;
export const transformLabResearchNotesBlockAction = labResearchNotesAi.transformBlock;
export const transformLabResearchNotesSelectionAction = labResearchNotesAi.transformSelection;

/**
 * The explicit "Graduate to Build" action (PLANNING.md §26.4,
 * CMS_PRODUCT_DESIGN.md Appendix A) — not a manual create-new-Build-and-link
 * workflow. Creates a new Build pre-linked to the originating Lab via
 * `originatingLabId`; the Lab's own Documents stay exactly where they are
 * and simply render on the Build's detail page too (queried by
 * `originatingLabId`), so nothing is copied or duplicated.
 */
export async function graduateLabToBuildAction(labId: string): Promise<EntryActionState> {
  const lab = await labRepository.findById(labId);
  if (!lab) {
    return { error: 'This entry no longer exists.' };
  }
  if (lab.graduatedToBuildId) {
    return { error: 'This Lab has already graduated to a Build.' };
  }

  let userId: string;
  try {
    await requireCapability('createOwnEntry');
    ({ userId } = await requireEntryCapability(lab));
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'You cannot graduate this Lab.' };
  }

  let buildId: string;
  try {
    const build = await buildRepository.create(
      {
        title: lab.title,
        slug: lab.slug,
        status: 'draft',
        deploymentState: 'live',
        technologyIds: lab.technologyIds.map((id) => id.toString()),
        originatingLabId: labId,
        relatedWorkIds: [],
        heroImageId: lab.heroImageId?.toString(),
        galleryImageIds: lab.galleryImageIds.map((id) => id.toString()),
        featured: false,
      },
      userId,
    );
    buildId = build._id.toString();
  } catch (error) {
    if (error instanceof ZodError) {
      return { error: 'The Lab is missing data required to create a Build.' };
    }
    return { error: error instanceof Error ? error.message : 'Could not create the Build.' };
  }

  await labRepository.update(labId, { graduatedToBuildId: buildId });

  revalidatePath(labDetailPath(labId));
  revalidatePath(buildDetailPath(buildId));
  redirect(buildDetailPath(buildId));
}
