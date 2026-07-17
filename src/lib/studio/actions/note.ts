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
import { noteRepository } from '@/lib/db/repositories/note';
import { RELATED_ENTRY_FIELDS } from '@/lib/studio/note-relations';
import type { NoteInput } from '@/lib/validation/note';
import type { Note } from '@/types/studio';

const NOTES_LIST_PATH = '/studio/content/notes';
const noteDetailPath = (id: string) => `/studio/content/notes/${id}`;

function readOptionalString(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed === '' ? undefined : trimmed;
}

/** Merges the form's four typed relation pickers into one `relatedEntries` array (§24) — the inverse of `note-relations.ts`'s `splitRelatedEntries`. */
function readRelatedEntries(formData: FormData): NoteInput['relatedEntries'] {
  return RELATED_ENTRY_FIELDS.flatMap(({ key, field }) =>
    formData.getAll(field).map((id) => ({ ownerType: key, ownerId: String(id) })),
  );
}

function readNoteMetadataFields(formData: FormData) {
  return {
    title: String(formData.get('title') ?? ''),
    slug: String(formData.get('slug') ?? ''),
    authorId: String(formData.get('authorId') ?? ''),
    summary: String(formData.get('summary') ?? ''),
    publicationDate: String(formData.get('publicationDate') ?? ''),
    technologyIds: formData.getAll('technologyIds').map(String),
    relatedEntries: readRelatedEntries(formData),
    galleryImageIds: formData.getAll('galleryImageIds').map(String),
    featured: formData.get('featured') === 'on',
  };
}

/** New entries always start as `draft` — publishing only ever happens through the status stepper (§28), never a form field. */
function parseNoteCreateFormData(formData: FormData): NoteInput {
  const heroImageId = readOptionalString(formData, 'heroImageId');
  return {
    ...readNoteMetadataFields(formData),
    status: 'draft',
    ...(heroImageId !== undefined ? { heroImageId } : {}),
    // `publicationDate` is read from an `<input type="date">` as a plain
    // string — `noteSchema`'s `z.coerce.date()` performs the actual parsing
    // at runtime inside `noteRepository.create()`/`.update()`, so this cast
    // only bridges the static gap (mirrors `actions/lab.ts`'s `startDate`).
  } as unknown as NoteInput;
}

function parseNoteUpdateFormData(formData: FormData): Partial<NoteInput> {
  return {
    ...readNoteMetadataFields(formData),
    // Present even when `undefined` (never omitted) — an explicit `undefined`
    // key tells `createRepository().update()` to `$unset` the field, which is
    // how clearing a previously-set optional field actually persists instead
    // of silently leaving the stale value (mirrors `actions/blueprint.ts`).
    heroImageId: readOptionalString(formData, 'heroImageId'),
  } as unknown as Partial<NoteInput>;
}

export const createNoteAction = createEntryCreateAction<Note, NoteInput>({
  create: noteRepository.create,
  parseFormData: parseNoteCreateFormData,
  idOf: (record) => record._id.toString(),
  listPath: NOTES_LIST_PATH,
  detailPath: noteDetailPath,
});

export const updateNoteAction = createEntryUpdateAction<Note, NoteInput>({
  findById: noteRepository.findById,
  update: noteRepository.update,
  parseFormData: parseNoteUpdateFormData,
  detailPath: noteDetailPath,
});

export const transitionNoteStatusAction = createEntryTransitionAction<Note>({
  findById: noteRepository.findById,
  setStatus: (id, status) => noteRepository.update(id, { status }),
  detailPath: noteDetailPath,
});

/** A Note owns one Document (§26.5) — `body` — the long-form write-up. */
export const saveNoteBodyAction = createDocumentSaveAction<Note>({
  ownerType: 'Note',
  role: 'body',
  findOwnerById: noteRepository.findById,
  detailPath: noteDetailPath,
});

/** "Generate content" for the Note body Document (Phase 10, §31/§32) — same authorization as saving it. */
export const generateNoteBodyDocumentAction = createGenerateDocumentAction<Note>({
  ownerType: 'Note',
  role: 'body',
  findOwnerById: noteRepository.findById,
});

export const generateNoteBodyBlockAction = createGenerateBlockAction<Note>({
  ownerType: 'Note',
  role: 'body',
  findOwnerById: noteRepository.findById,
});

export const transformNoteBodyBlockAction = createTransformBlockAction<Note>({
  ownerType: 'Note',
  role: 'body',
  findOwnerById: noteRepository.findById,
});

export const transformNoteBodySelectionAction = createTransformSelectionAction<Note>({
  ownerType: 'Note',
  role: 'body',
  findOwnerById: noteRepository.findById,
});
