import type { ReactNode } from "react";

export interface FormPanelProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * One named panel in a grouped `CmsForm` (`FieldConfig.group` —
 * `ARCHITECTURE/20_CONTENT_BLOCKS.md` §9) — purely a visual grouping, no
 * form logic of its own, so it stays a plain layout component rather than
 * something `CmsForm` needs to coordinate state through.
 */
export function FormPanel({ title, description, children }: FormPanelProps) {
  return (
    <section className="border-border-muted rounded-lg border">
      <div className="border-border-muted border-b px-5 py-3">
        <h2 className="text-body text-text font-medium">{title}</h2>
        {description && <p className="text-caption text-text-muted mt-0.5">{description}</p>}
      </div>
      <div className="flex flex-col gap-6 p-5">{children}</div>
    </section>
  );
}
