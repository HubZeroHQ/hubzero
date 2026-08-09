import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  ensureMongoReady: vi.fn(),
}));

vi.mock('@/lib/db/mongodb', () => ({
  ensureMongoReady: mocks.ensureMongoReady,
}));
vi.mock('@/app/root-document', () => ({
  RootDocument: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Studio pre-stream readiness layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.ensureMongoReady.mockResolvedValue(undefined);
  });

  it('propagates readiness failures before creating the Studio root document', async () => {
    const readinessFailure = new Error('safe test failure');
    mocks.ensureMongoReady.mockRejectedValue(readinessFailure);
    const { default: StudioLayout } = await import('./layout');

    await expect(StudioLayout({ children: null })).rejects.toBe(readinessFailure);
  });

  it('preserves the editor subtree after successful readiness', async () => {
    const { default: StudioLayout } = await import('./layout');
    const editor = { type: 'editor-marker' } as unknown as React.ReactNode;

    const document = await StudioLayout({ children: editor });

    expect(mocks.ensureMongoReady).toHaveBeenCalledTimes(1);
    expect(document.props.children).toBe(editor);
  });
});
