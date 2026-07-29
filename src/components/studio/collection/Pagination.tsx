import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

/**
 * Generic prev/next pagination for any collection list view. Takes a
 * `buildHref` callback rather than assuming a fixed URL shape, since each
 * collection's list page carries its own combination of search params
 * (status, facets, query) that a page link must preserve.
 */
export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Pagination"
      className="border-border-muted flex items-center justify-between border-t pt-4"
    >
      <PageLink direction="prev" page={page} totalPages={totalPages} buildHref={buildHref} />
      <span className="text-text-muted font-mono text-xs tracking-[0.05em] uppercase">
        Page {page} of {totalPages}
      </span>
      <PageLink direction="next" page={page} totalPages={totalPages} buildHref={buildHref} />
    </nav>
  );
}

function PageLink({
  direction,
  page,
  totalPages,
  buildHref,
}: {
  direction: 'prev' | 'next';
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  const target = direction === 'prev' ? page - 1 : page + 1;
  const disabled = target < 1 || target > totalPages;
  const label = direction === 'prev' ? 'Previous' : 'Next';

  if (disabled) {
    return <span className="text-text-disabled text-sm">{label}</span>;
  }

  return (
    <Link
      href={buildHref(target)}
      className={cn(
        'text-text-secondary hover:text-text-primary duration-fast ease-standard text-sm transition-colors',
      )}
    >
      {label}
    </Link>
  );
}
