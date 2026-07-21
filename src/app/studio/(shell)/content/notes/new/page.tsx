import type { Metadata } from 'next';
import { NoteForm } from '@/components/studio/notes/NoteForm';
import { PageHeader } from '@/components/studio/PageHeader';
import { auth } from '@/lib/auth';
import { createNoteAction } from '@/lib/studio/actions/note';
import { getNoteRelationOptions } from '@/lib/studio/note-relations';

export const metadata: Metadata = { title: 'New Note — HubZero Studio' };

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Every authenticated role holds `createOwnEntry` (§29) — the create action itself is the enforcement point, not this route. */
export default async function NewNotePage() {
  const [session, relationOptions] = await Promise.all([auth(), getNoteRelationOptions()]);
  const currentUserId = session!.user.id;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New Note"
        description="Starts as a Draft. A reference ID is assigned automatically on save (§27). This is engineering writing, not a blog post — architecture decisions, implementation notes, research summaries, and debugging write-ups worth publishing."
      />
      <NoteForm
        action={createNoteAction}
        submitLabel="Create Note"
        initialValues={{
          title: '',
          slug: '',
          authorId: currentUserId,
          summary: '',
          publicationDate: toDateInputValue(new Date()),
          featured: false,
          technologyIds: [],
          relatedWorkIds: [],
          relatedBuildIds: [],
          relatedBlueprintIds: [],
          relatedLabIds: [],
          galleryImageIds: [],
          contributors: [],
        }}
        {...relationOptions}
      />
    </div>
  );
}
