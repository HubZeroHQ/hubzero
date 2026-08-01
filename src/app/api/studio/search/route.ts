import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { ensureSearchAdaptersRegistered } from '@/lib/search/register';
import { listSearchIndex, searchAll } from '@/lib/search/registry';

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
  // `?all=1` returns the whole viewer-scoped index in one request, so the
  // command palette can fetch once on first open and filter in memory
  // afterwards instead of issuing a request per keystroke (v3.1 Milestone 6).
  const wantsFullIndex = request.nextUrl.searchParams.get('all') === '1';

  ensureSearchAdaptersRegistered();
  const ctx = { role: session.user.role, userId: session.user.id };
  const results = wantsFullIndex ? await listSearchIndex(ctx) : await searchAll(query, ctx);

  return NextResponse.json({ results });
}
