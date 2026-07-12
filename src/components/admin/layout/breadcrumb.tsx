import { ChevronRight } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";

import { Link } from "@/components/ui/link";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps extends ComponentPropsWithoutRef<"nav"> {
  items: BreadcrumbItem[];
}

/**
 * Pure, data-driven — a page passes its own segment list (usually just
 * `[{ label: "Dashboard" }]` today; a future detail page would pass
 * `[{ label: "Case Studies", href: "/studio/case-studies" }, { label: doc.title }]`).
 * No route-parsing magic, so it never has to guess a segment's display name.
 */
export function Breadcrumb({ items, className, ...props }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1.5", className)} {...props}>
      <ol className="text-caption text-text-muted flex items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />}
              {item.href && !isLast ? (
                <Link href={item.href} tone="muted" className="no-underline hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? "text-text" : undefined}
                >
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
