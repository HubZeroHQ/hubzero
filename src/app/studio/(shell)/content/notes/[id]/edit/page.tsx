import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/studio/PageHeader';
import { NoteForm } from '@/components/studio/notes/NoteForm';
import { BlockEditor } from '@/components/documents/BlockEditor';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { ErrorState } from '@/components/ui/ErrorState';
import { auth } from '@/lib/auth';
import { canActOnEntry } from '@/lib/auth/permissions';
import {
  generateNoteBodyBlockAction,
  generateNoteBodyDocumentAction,
  saveNoteBodyAction,
  transformNoteBodyBlockAction,
  transformNoteBodySelectionAction,
  updateNoteAction,
} from '@/lib/studio/actions/note';
import { getNoteRelationOptions, splitRelatedEntries } from '@/lib/studio/note-relations';
import { documentRepository } from '@/lib/db/repositories/document';
import { noteRepository } from '@/lib/db/repositories/note';
import { toMediaAssetDTO } from '@/lib/media/dto';
import { resolveHeroAndGallery } from '@/lib/media/resolve';

export const metadata: Metadata = { title: 'Edit Note — HubZero Studio' };

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default async function EditNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = await noteRepository.findById(id);
  if (!note) {
    notFound();
  }

  const session = await auth();
  const { role, id: userId } = session!.user;
  const canEdit = canActOnEntry(note, { role, userId });

  if (!canEdit) {
    return (
      <ErrorState
        title="You can't edit this entry."
        description="Only its owner, an assigned Team Member, or an Admin/Head Admin can edit a Note."
        action={
          <ButtonLink href={`/studio/content/notes/${id}`} variant="secondary">
            Back to entry
          </ButtonLink>
        }
      />
    );
  }

  const [bodyDocument, relationOptions, { heroAsset, galleryAssets }] = await Promise.all([
    documentRepository.findByOwnerAndRole('Note', id, 'body'),
    getNoteRelationOptions(),
    resolveHeroAndGallery(note.heroImageId, note.galleryImageIds),
  ]);

  const boundUpdateAction = updateNoteAction.bind(null, id);
  const boundSaveBodyAction = saveNoteBodyAction.bind(null, id);
  const bodyAiConfig = {
    contentTypeLabel: 'engineering journal entry',
    generateDocument: generateNoteBodyDocumentAction.bind(null, id),
    generateBlock: generateNoteBodyBlockAction.bind(null, id),
    transformBlock: transformNoteBodyBlockAction.bind(null, id),
    transformSelection: transformNoteBodySelectionAction.bind(null, id),
  };

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title={`Edit — ${note.title}`}
        description="Changes to metadata save immediately; workflow status is managed from the entry's detail view."
      />

      <NoteForm
        action={boundUpdateAction}
        submitLabel="Save changes"
        initialValues={{
          title: note.title,
          slug: note.slug,
          authorId: note.authorId.toString(),
          summary: note.summary,
          publicationDate: toDateInputValue(note.publicationDate),
          featured: note.featured,
          technologyIds: note.technologyIds.map((entryId) => entryId.toString()),
          galleryImageIds: note.galleryImageIds.map((entryId) => entryId.toString()),
          contributorProfileIds: (note.contributorProfileIds ?? []).map((entryId) =>
            entryId.toString(),
          ),
          ...splitRelatedEntries(note.relatedEntries),
        }}
        initialHeroAsset={heroAsset ? toMediaAssetDTO(heroAsset) : undefined}
        initialGalleryAssets={galleryAssets.map(toMediaAssetDTO)}
        {...relationOptions}
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">Write-up</h2>
        <BlockEditor
          initialBlocks={bodyDocument?.blocks ?? []}
          onSave={boundSaveBodyAction}
          technologyOptions={relationOptions.technologyOptions}
          ai={bodyAiConfig}
        />
      </section>
    </div>
  );
}
