import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { BreadcrumbItem } from '@/lib/studio/navigation';

/**
 * CMS_PRODUCT_DESIGN.md §2 — every crumb before the last is a real link;
 * clicking it returns to that destination directly, not a reset state.
 */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 ? (
                <ChevronRight className="text-text-muted h-3.5 w-3.5" aria-hidden />
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-text-secondary duration-fast ease-standard hover:text-text-primary rounded-control -my-1.5 py-1.5 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-text-primary" aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
