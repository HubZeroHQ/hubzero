import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { canActOnEntry, type OwnableEntry } from '@/lib/auth/permissions';
import { blueprintRepository } from '@/lib/db/repositories/blueprint';
import { buildRepository } from '@/lib/db/repositories/build';
import { careerRepository } from '@/lib/db/repositories/career';
import { engineeringProfileRepository } from '@/lib/db/repositories/engineering-profile';
import { labRepository } from '@/lib/db/repositories/lab';
import { noteRepository } from '@/lib/db/repositories/note';
import { workRepository } from '@/lib/db/repositories/work';
import type { PublicDetailEntityType } from '@/lib/public/domain';
import { publicRoute } from '@/lib/public/routes';

/**
 * Aliased rather than redeclared: this is the exact same "which public
 * entity types have a real detail page" fact `PublicDetailEntityType`
 * already encodes, so adding/removing a type there now flows here too
 * instead of silently drifting from a second hand-typed union.
 */
type PreviewType = PublicDetailEntityType;

const FIND_BY_ID: Record<
  PreviewType,
  (id: string) => Promise<(OwnableEntry & { slug: string }) | null>
> = {
  work: workRepository.findById,
  build: buildRepository.findById,
  blueprint: blueprintRepository.findById,
  lab: labRepository.findById,
  note: noteRepository.findById,
  engineeringProfile: engineeringProfileRepository.findById,
  career: careerRepository.findById,
};

function isPreviewType(value: string | null): value is PreviewType {
  return value !== null && value in FIND_BY_ID;
}

/**
 * The one door into Next.js Draft Mode (Experience v3 Preview Integrity
 * milestone). Every preview is authorized exactly like any other Studio
 * read of the entry: signed in, plus the same ownership/role check
 * (`canActOnEntry`) that gates seeing it in Studio at all — Draft Mode's
 * cookie is never set for a visitor, only for a Studio session that already
 * passed this.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const type = request.nextUrl.searchParams.get('type');
  const id = request.nextUrl.searchParams.get('id');

  if (!isPreviewType(type) || !id) {
    return NextResponse.json({ error: 'Invalid preview request.' }, { status: 400 });
  }

  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { error: 'You must be signed in to Studio to preview this entry.' },
      { status: 401 },
    );
  }

  const entry = await FIND_BY_ID[type](id);
  if (!entry) {
    return NextResponse.json({ error: 'This entry no longer exists.' }, { status: 404 });
  }
  if (!canActOnEntry(entry, { role: session.user.role, userId: session.user.id })) {
    return NextResponse.json(
      { error: 'You do not have permission to preview this entry.' },
      { status: 403 },
    );
  }

  (await draftMode()).enable();

  return NextResponse.redirect(
    new URL(publicRoute.entity({ type, slug: entry.slug }), request.url),
  );
}
