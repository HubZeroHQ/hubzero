import { z } from "zod";

import { WorkflowStatusBadge } from "@/components/admin/workflow-status-badge";
import { Badge } from "@/components/ui/badge";
import { objectIdField } from "@/lib/cms/collections/shared-validation";
import type { FieldConfig, TableColumn } from "@/types/cms";

/**
 * `contributors`/`featured` (`ARCHITECTURE/20_CONTENT_BLOCKS.md` §3-4) are
 * identical — same Zod shape, same form field, same list column — across
 * every narrative collection (Case Study, Build, Labs Project, Blueprint,
 * Note). Extracted here once a fifth collection needed the exact same
 * definition, the same "avoid copy-paste" discipline `shared-options.ts`
 * already applies to `practiceArea` — a collection-specific field (e.g.
 * Blueprint's `demoStatus`) stays local to that collection's own
 * `*-fields.tsx`; this file is only for the two fields every narrative
 * collection shares verbatim.
 */

export const cardFieldsSchemaShape = {
  contributors: z.array(objectIdField()).max(30).default([]),
  featured: z.boolean().default(false),
};

export function contributorsFormField<TInput extends { contributors: string[] }>(
  description?: string,
): FieldConfig<TInput> {
  return {
    name: "contributors" as keyof TInput & string,
    label: "Contributors",
    type: "referenceArray",
    resource: "teamMember",
    labelField: "name",
    description: description ?? "Team members who worked on this.",
    group: "People",
  };
}

export function featuredFormField<TInput extends { featured: boolean }>(
  description?: string,
): FieldConfig<TInput> {
  return {
    name: "featured" as keyof TInput & string,
    label: "Feature on homepage",
    type: "boolean",
    description,
    group: "Card",
  };
}

export function featuredListColumn<T extends { featured: boolean }>(): TableColumn<T> {
  return {
    key: "featured" as keyof T & string,
    label: "Featured",
    render: (doc) => (doc.featured ? <Badge tone="success">Featured</Badge> : null),
  };
}

/** Every narrative collection's `status` list column renders identically — extracted alongside `featuredListColumn` since both are the same "one Badge render, five collections" shape. */
export function statusListColumn<T extends { status: string }>(): TableColumn<T> {
  return {
    key: "status" as keyof T & string,
    label: "Status",
    render: (doc) => <WorkflowStatusBadge status={doc.status} />,
  };
}
