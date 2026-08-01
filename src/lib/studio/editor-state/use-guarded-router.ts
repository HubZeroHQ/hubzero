'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useEditorRegistry } from './context';

export interface GuardedRouter {
  push: (href: string) => void;
  replace: (href: string) => void;
  back: () => void;
}

/**
 * The router every *programmatic* Studio navigation must use — the command
 * palette, the `g`-chord keyboard jumps, and anything added later that calls
 * `router.push` from an event handler.
 *
 * Anchor-based navigation (the sidebar, breadcrumbs, entry tables, dashboard
 * lists) needs no equivalent change: the guard intercepts those at the DOM
 * level in `EditorGuardProvider`, which is both fewer call sites to keep in
 * sync and the only approach that also covers links rendered by code that
 * doesn't know the guard exists. Programmatic navigation has no DOM event to
 * intercept, so it opts in here instead.
 */
export function useGuardedRouter(): GuardedRouter {
  const router = useRouter();
  const registry = useEditorRegistry();

  return useMemo<GuardedRouter>(
    () => ({
      push(href) {
        if (!registry) {
          router.push(href);
          return;
        }
        registry.requestNavigation({ perform: () => router.push(href), description: href });
      },
      replace(href) {
        if (!registry) {
          router.replace(href);
          return;
        }
        registry.requestNavigation({ perform: () => router.replace(href), description: href });
      },
      back() {
        if (!registry) {
          router.back();
          return;
        }
        registry.requestNavigation({ perform: () => router.back(), description: 'back' });
      },
    }),
    [registry, router],
  );
}
