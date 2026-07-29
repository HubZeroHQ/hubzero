'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition, type ReactNode } from 'react';

/**
 * The About founder card's link into its Engineering Profile. On a browser
 * that supports the View Transitions API (and without prefers-reduced-motion
 * requested), the navigation is wrapped in `document.startViewTransition` so
 * the shared `view-transition-name` on the card's motif and the profile
 * hero's motif (`founderMotifViewTransitionStyle`) cross-fade/morph as one
 * continuous object instead of the motif restarting cold on the new page —
 * the "enter a deeper layer of the same system" requirement. Everywhere else
 * this is a plain `<Link>`.
 */
export function FounderProfileLink({ href, children }: { href: string; children: ReactNode }) {
  const router = useRouter();
  const [isPending, startReactTransition] = useTransition();
  const [supported, setSupported] = useState(false);
  const resolveRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setSupported(
      typeof document !== 'undefined' &&
        'startViewTransition' in document &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    );
  }, []);

  useEffect(() => {
    if (!isPending && resolveRef.current) {
      resolveRef.current();
      resolveRef.current = null;
    }
  }, [isPending]);

  if (!supported) {
    return <Link href={href}>{children}</Link>;
  }

  return (
    <a
      href={href}
      onClick={(event) => {
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.button !== 0) return;
        event.preventDefault();
        document.startViewTransition(
          () =>
            new Promise<void>((resolve) => {
              resolveRef.current = resolve;
              startReactTransition(() => {
                router.push(href);
              });
            }),
        );
      }}
    >
      {children}
    </a>
  );
}
