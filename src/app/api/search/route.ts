import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PUBLIC_SITE } from '@/config/public-site';
import { searchPublicContent } from '@/lib/public/queries';

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!PUBLIC_SITE.release.search) {
    return NextResponse.json({ results: [] }, { status: 404 });
  }

  const query = request.nextUrl.searchParams.get('q') ?? '';
  const requestedLimit = Number(request.nextUrl.searchParams.get('limit') ?? 8);
  const limit = Number.isFinite(requestedLimit) ? requestedLimit : 8;

  try {
    const results = await searchPublicContent(query, limit);
    return NextResponse.json(
      { results },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      },
    );
  } catch (error) {
    console.error('Public search failed', error);
    return NextResponse.json({ results: [] }, { status: 503 });
  }
}
