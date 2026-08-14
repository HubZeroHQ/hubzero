import { beforeEach, describe, expect, it, vi } from 'vitest';
import PublicRoot from './(foundation)/page';
import WorkIndexPage from './(foundation)/work/page';
import BuildsIndexPage from './(foundation)/builds/page';
import BlueprintsIndexPage from './(foundation)/blueprints/page';
import LabsIndexPage from './(foundation)/labs/page';
import NotesIndexPage from './(foundation)/notes/page';
import EngineeringProfilesPage from './(foundation)/engineering/page';
import CareersIndexPage from './(foundation)/careers/page';
import BlueprintDetailPage from './blueprints/[slug]/page';
import NoteDetailPage from './notes/[slug]/page';
import EngineeringProfilePage from './engineering/[slug]/page';
import CareerDetailPage from './careers/[slug]/page';
import { generateMetadata as generateWorkMetadata } from './work/[slug]/page';
import { generateMetadata as generateBuildMetadata } from './builds/[slug]/page';
import { generateMetadata as generateBlueprintMetadata } from './blueprints/[slug]/page';
import { generateMetadata as generateLabMetadata } from './labs/[slug]/page';
import { generateMetadata as generateNoteMetadata } from './notes/[slug]/page';
import { generateMetadata as generateEngineeringMetadata } from './engineering/[slug]/page';
import { generateMetadata as generateCareerMetadata } from './careers/[slug]/page';

const queryMocks = vi.hoisted(() => ({
  getPublicHomepage: vi.fn(),
  getPublicDetail: vi.fn(),
  listPublicSummaries: vi.fn(),
  listPublicNoteIndexEntries: vi.fn(),
  listPublicEngineeringProfileIndexEntries: vi.fn(),
}));

vi.mock('@/lib/public/queries', () => queryMocks);
vi.mock('@/lib/public/preview', () => ({ isPreviewRequest: () => Promise.resolve(false) }));
vi.mock('@/lib/env', () => ({
  publicEnv: () => ({ NEXT_PUBLIC_SITE_URL: 'https://hubzero.in' }),
}));

const readFailure = new Error('public read failed');

describe('public route read failures', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const query of Object.values(queryMocks)) query.mockRejectedValue(readFailure);
  });

  it.each([
    ['homepage', () => PublicRoot()],
    ['Work index', () => WorkIndexPage({ searchParams: Promise.resolve({}) })],
    ['Builds index', () => BuildsIndexPage()],
    ['Blueprints index', () => BlueprintsIndexPage({ searchParams: Promise.resolve({}) })],
    ['Labs index', () => LabsIndexPage({ searchParams: Promise.resolve({}) })],
    ['Notes index', () => NotesIndexPage()],
    ['Engineering index', () => EngineeringProfilesPage()],
    ['Careers index', () => CareersIndexPage()],
  ])('does not present a query rejection as an empty %s', async (_name, renderPage) => {
    await expect(renderPage()).rejects.toBe(readFailure);
  });

  it.each([
    ['Blueprint', () => BlueprintDetailPage({ params: Promise.resolve({ slug: 'missing' }) })],
    ['Note', () => NoteDetailPage({ params: Promise.resolve({ slug: 'missing' }) })],
    [
      'Engineering Profile',
      () => EngineeringProfilePage({ params: Promise.resolve({ slug: 'missing' }) }),
    ],
    ['Career', () => CareerDetailPage({ params: Promise.resolve({ slug: 'missing' }) })],
  ])('does not present a query rejection as a missing %s record', async (_name, renderPage) => {
    await expect(renderPage()).rejects.toBe(readFailure);
  });

  it.each([
    ['Work', generateWorkMetadata],
    ['Build', generateBuildMetadata],
    ['Blueprint', generateBlueprintMetadata],
    ['Lab', generateLabMetadata],
    ['Note', generateNoteMetadata],
    ['Engineering Profile', generateEngineeringMetadata],
    ['Career', generateCareerMetadata],
  ])('terminates metadata for a genuinely missing %s record', async (_name, generateMetadata) => {
    queryMocks.getPublicDetail.mockResolvedValueOnce(null);
    await expect(
      generateMetadata({ params: Promise.resolve({ slug: 'does-not-exist' }) }),
    ).rejects.toMatchObject({ digest: 'NEXT_HTTP_ERROR_FALLBACK;404' });
  });
});
