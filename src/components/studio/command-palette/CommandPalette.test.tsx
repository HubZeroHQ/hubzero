// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LayoutDashboard } from 'lucide-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CommandPalette } from './CommandPalette';

vi.mock('@/lib/studio/editor-state/use-guarded-router', () => ({
  useGuardedRouter: () => ({ push: vi.fn() }),
}));

vi.mock('cmdk', () => {
  const Root = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return {
    Command: Object.assign(Root, {
      Dialog: Root,
      Input: ({
        onValueChange,
        ...props
      }: React.InputHTMLAttributes<HTMLInputElement> & {
        onValueChange?: (value: string) => void;
      }) => <input {...props} onChange={(event) => onValueChange?.(event.currentTarget.value)} />,
      List: Root,
      Empty: Root,
      Group: Root,
      Item: Root,
    }),
  };
});

const nav = [
  {
    kind: 'leaf' as const,
    label: 'Dashboard',
    href: '/studio/dashboard',
    icon: LayoutDashboard,
  },
];

describe('CommandPalette content-index failures', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it.each([
    [
      '401 response',
      () => Promise.resolve(new Response('{"error":"Unauthorized"}', { status: 401 })),
    ],
    [
      '503 response',
      () => Promise.resolve(new Response('{"error":"Unavailable"}', { status: 503 })),
    ],
    ['malformed JSON', () => Promise.resolve(new Response('{', { status: 200 }))],
  ])('enters the existing degraded state for a %s', async (_label, response) => {
    vi.stubGlobal('fetch', vi.fn(response));
    render(<CommandPalette role="member" nav={nav} open onOpenChange={vi.fn()} />);

    expect(await screen.findByText(/Content search is unavailable right now/)).toBeTruthy();
  });

  it('loads content results from a successful response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              results: [
                {
                  id: 'work-1',
                  type: 'work',
                  title: 'A published record',
                  href: '/studio/content/work/work-1',
                },
              ],
            }),
            { status: 200 },
          ),
        ),
      ),
    );

    render(<CommandPalette role="member" nav={nav} open onOpenChange={vi.fn()} />);

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByPlaceholderText('Search, navigate, or create…'), {
      target: { value: 'published' },
    });
    expect(await screen.findByText('A published record')).toBeTruthy();
    expect(screen.queryByText(/Content search is unavailable right now/)).toBeNull();
  });
});
