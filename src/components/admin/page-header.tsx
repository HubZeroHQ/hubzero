import type { ReactNode } from "react";

import { Breadcrumb, type BreadcrumbItem } from "@/components/admin/layout/breadcrumb";
import { Heading, Text } from "@/components/ui";

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[];
  /** e.g. a "New Case Study" <Button> — right-aligned, optional. */
  actions?: ReactNode;
}

/**
 * The one heading block every `/studio/**` page starts with — extracted
 * once the dashboard and (from Phase E onward) every collection's list page
 * needed the identical title/breadcrumb/actions arrangement, per
 * `ARCHITECTURE/19_CMS_FOUNDATION.md`'s brief for shared admin infrastructure.
 */
export function PageHeader({ title, description, breadcrumb, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {breadcrumb && breadcrumb.length > 0 && <Breadcrumb items={breadcrumb} className="mb-2" />}
        <Heading level={1} size="h2">
          {title}
        </Heading>
        {description && (
          <Text tone="muted" className="mt-1">
            {description}
          </Text>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  );
}
