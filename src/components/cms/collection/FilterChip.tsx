import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

/**
 * DESIGN_SYSTEM.md §7 Filters (chips) — pill shape, mono label, neutral at
 * rest, amber border/tint/text when active. A plain `<Link>` rather than a
 * client-side toggle: filters live in the URL's search params (§4 — every
 * collection list view is server-rendered against `searchParams`), so a
 * chip is just a link to the same page with one param changed.
 */
export function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'duration-fast ease-standard inline-flex items-center rounded-full border px-3 py-1 font-mono text-[11px] tracking-[0.05em] uppercase transition-colors active:scale-95',
        active
          ? 'border-accent bg-accent-subtle text-accent'
          : 'border-border-default text-text-secondary hover:bg-surface-elevated',
      )}
    >
      {children}
    </Link>
  );
}
