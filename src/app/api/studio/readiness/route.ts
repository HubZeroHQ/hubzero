import { ensureMongoReady } from '@/lib/db/mongodb';

export const dynamic = 'force-dynamic';

/**
 * Authenticated operational probe. It intentionally returns no connection
 * details: callers only learn whether this runtime can serve Studio work.
 */
export async function GET(): Promise<Response> {
  try {
    await ensureMongoReady();
    return new Response(null, {
      status: 204,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return Response.json(
      { error: 'Service unavailable' },
      {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  }
}
