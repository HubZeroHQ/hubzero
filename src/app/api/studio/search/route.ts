import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { ensureSearchAdaptersRegistered } from '@/lib/search/register';
import { searchAll } from '@/lib/search/registry';

/**
 * The Studio command palette's data source (CMS_PRODUCT_DESIGN.md §7) — one
 * index generated from the real collections via the adapter registry,
 * never a separately hand-maintained shadow index. `middleware.ts`
 * already requires a session for every `/api/studio/*` route; this handler
 * additionally scopes results to the viewer's role/assignments.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ results: [] }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get('q') ?? '';

  ensureSearchAdaptersRegistered();
  const results = await searchAll(query, {
    role: session.user.role,
    userId: session.user.id,
  });

  return NextResponse.json({ results });
}
