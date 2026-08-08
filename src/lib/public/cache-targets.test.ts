import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  work: vi.fn(),
  build: vi.fn(),
  blueprint: vi.fn(),
  lab: vi.fn(),
  note: vi.fn(),
  notes: vi.fn(),
  team: vi.fn(),
  profile: vi.fn(),
  profileByTeam: vi.fn(),
  career: vi.fn(),
}));

vi.mock('@/lib/db/repositories/work', () => ({
  workRepository: { findById: mocks.work },
}));
vi.mock('@/lib/db/repositories/build', () => ({
  buildRepository: { findById: mocks.build },
}));
vi.mock('@/lib/db/repositories/blueprint', () => ({
  blueprintRepository: { findById: mocks.blueprint },
}));
vi.mock('@/lib/db/repositories/lab', () => ({
  labRepository: { findById: mocks.lab },
}));
vi.mock('@/lib/db/repositories/note', () => ({
  noteRepository: { findById: mocks.note, list: mocks.notes },
}));
vi.mock('@/lib/db/repositories/team', () => ({
  teamRepository: { findById: mocks.team },
}));
vi.mock('@/lib/db/repositories/engineering-profile', () => ({
  engineeringProfileRepository: {
    findById: mocks.profile,
    findByTeamMemberId: mocks.profileByTeam,
  },
}));
vi.mock('@/lib/db/repositories/career', () => ({
  careerRepository: { findById: mocks.career },
}));

import { publicCacheTargetsForOwner, publicNoteCacheTargetsForAuthorUser } from './cache-targets';

describe('publicCacheTargetsForOwner', () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) {
      mock.mockReset().mockResolvedValue(null);
    }
  });

  it('returns a target only for a published status-gated owner', async () => {
    mocks.work.mockResolvedValueOnce({ status: 'draft', slug: 'alpha' });
    await expect(publicCacheTargetsForOwner('Work', '1')).resolves.toEqual([]);

    mocks.work.mockResolvedValueOnce({ status: 'published', slug: 'alpha' });
    await expect(publicCacheTargetsForOwner('Work', '1')).resolves.toEqual([
      {
        type: 'work',
        slug: 'alpha',
      },
    ]);
  });

  it('requires both a published Engineering Profile and a public Team owner', async () => {
    mocks.profile.mockResolvedValue({
      status: 'published',
      slug: 'ada',
      teamMemberId: { toString: () => 'team-1' },
    });
    mocks.team.mockResolvedValueOnce({ publicProfile: false, archived: false });
    await expect(publicCacheTargetsForOwner('EngineeringProfile', '1')).resolves.toEqual([]);

    mocks.team.mockResolvedValueOnce({ publicProfile: true, archived: false });
    await expect(publicCacheTargetsForOwner('EngineeringProfile', '1')).resolves.toEqual([
      {
        type: 'engineeringProfile',
        slug: 'ada',
      },
    ]);

    mocks.team.mockResolvedValueOnce({ publicProfile: true, archived: true });
    await expect(publicCacheTargetsForOwner('EngineeringProfile', '1')).resolves.toEqual([]);
  });

  it('expands a public Team owner to its Profile and authored Notes', async () => {
    mocks.team.mockResolvedValue({
      publicProfile: true,
      archived: false,
      userId: { toString: () => 'user-1' },
    });
    mocks.profileByTeam.mockResolvedValue({
      status: 'published',
      slug: 'ada',
    });
    mocks.notes.mockResolvedValue([
      {
        status: 'published',
        slug: 'authored-note',
        authorId: { toString: () => 'user-1' },
      },
      {
        status: 'draft',
        slug: 'draft-note',
        authorId: { toString: () => 'user-1' },
      },
    ]);

    await expect(publicCacheTargetsForOwner('Team', 'team-1')).resolves.toEqual([
      { type: 'teamMember' },
      { type: 'engineeringProfile', slug: 'ada' },
      { type: 'note', slug: 'authored-note' },
    ]);
  });

  it('resolves only published Notes for a deleted User author', async () => {
    mocks.notes.mockResolvedValue([
      {
        status: 'published',
        slug: 'public-note',
        authorId: { toString: () => 'user-1' },
      },
      {
        status: 'draft',
        slug: 'draft-note',
        authorId: { toString: () => 'user-1' },
      },
      {
        status: 'published',
        slug: 'someone-else',
        authorId: { toString: () => 'user-2' },
      },
    ]);

    await expect(publicNoteCacheTargetsForAuthorUser('user-1')).resolves.toEqual([
      { type: 'note', slug: 'public-note' },
    ]);
  });
});
