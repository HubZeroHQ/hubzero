import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { publicRoute } from '@/lib/public/routes';

/** Disables Draft Mode and returns to wherever the editor was previewing — now rendered exactly as a real visitor would see it (Experience v3 Preview Integrity milestone). */
export async function GET(request: NextRequest): Promise<NextResponse> {
  (await draftMode()).disable();

  const referer = request.headers.get('referer');
  const destination =
    referer && referer.startsWith(request.nextUrl.origin) ? referer : publicRoute.home();
  return NextResponse.redirect(new URL(destination, request.url));
}
