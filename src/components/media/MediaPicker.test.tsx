// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MediaAssetDTO } from '@/lib/media/dto';
import { MediaPicker } from './MediaPicker';

const { searchMediaAction } = vi.hoisted(() => ({ searchMediaAction: vi.fn() }));

vi.mock('@/lib/studio/actions/media', () => ({ searchMediaAction }));
vi.mock('@/components/ui/Dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('./MediaUploadDropzone', () => ({ MediaUploadDropzone: () => null }));
vi.mock('./MediaGrid', () => ({
  MediaGrid: ({ assets }: { assets: MediaAssetDTO[] }) => (
    <ul>
      {assets.map((asset) => (
        <li key={asset.id}>{asset.altText}</li>
      ))}
    </ul>
  ),
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

function asset(id: string, altText: string): MediaAssetDTO {
  return {
    id,
    cloudinaryPublicId: id,
    url: `https://example.com/${id}.png`,
    altText,
    folder: 'general',
    reuseTags: [],
    createdAt: '2026-08-14T00:00:00.000Z',
    updatedAt: '2026-08-14T00:00:00.000Z',
  };
}

describe('MediaPicker request ordering', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('keeps the latest search results and loading state when an older request finishes last', async () => {
    vi.useFakeTimers();
    const first = deferred<MediaAssetDTO[]>();
    const second = deferred<MediaAssetDTO[]>();
    searchMediaAction.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);

    render(<MediaPicker open onOpenChange={vi.fn()} onSelect={vi.fn()} />);

    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search media' }), {
      target: { value: 'new query' },
    });
    await act(async () => {
      vi.advanceTimersByTime(200);
      second.resolve([asset('new', 'New result')]);
      await second.promise;
    });

    expect(screen.getByText('New result')).toBeTruthy();

    await act(async () => {
      first.resolve([asset('old', 'Stale result')]);
      await first.promise;
    });

    expect(screen.queryByText('Stale result')).toBeNull();
    expect(screen.getByText('New result')).toBeTruthy();
  });

  it('keeps a newer folder request loading when the preceding request settles first', async () => {
    vi.useFakeTimers();
    const first = deferred<MediaAssetDTO[]>();
    const second = deferred<MediaAssetDTO[]>();
    searchMediaAction.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);

    render(<MediaPicker open onOpenChange={vi.fn()} onSelect={vi.fn()} />);

    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    fireEvent.click(screen.getByRole('button', { name: 'general' }));
    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    expect(searchMediaAction).toHaveBeenNthCalledWith(1, { query: '', folder: undefined });
    expect(searchMediaAction).toHaveBeenNthCalledWith(2, { query: '', folder: 'general' });

    await act(async () => {
      first.resolve([asset('old-folder', 'Stale folder result')]);
      await first.promise;
    });

    expect(screen.queryByText('Stale folder result')).toBeNull();
    expect(screen.getByText('Searching…')).toBeTruthy();

    await act(async () => {
      second.resolve([asset('current-folder', 'Current folder result')]);
      await second.promise;
    });

    expect(screen.queryByText('Searching…')).toBeNull();
    expect(screen.getByText('Current folder result')).toBeTruthy();
  });
});
