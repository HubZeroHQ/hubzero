import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Heading, type HeadingProps } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps extends ComponentPropsWithoutRef<"div"> {
  /** The technical-label register line above the heading — a section number, pillar name, or date. */
  eyebrow: ReactNode;
  heading: ReactNode;
  /** Optional supporting line beneath the heading. */
  description?: ReactNode;
  /** @default 2 */
  headingLevel?: HeadingProps["level"];
  headingSize?: HeadingProps["size"];
}

/**
 * A section header is a compact title-block moment, not a standalone
 * hero-style headline repeated at every section boundary
 * (DESIGN/V3/06_COMPONENT_LANGUAGE.md §5) — the eyebrow line gives every
 * section the same "what is this, where does it sit" identity a drawing
 * sheet's title block gives a page.
 */
export function SectionHeader({
  eyebrow,
  heading,
  description,
  headingLevel = 2,
  headingSize,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div className={cn("max-w-2xl", className)} {...props}>
      <Text as="p" eyebrow tone="muted">
        {eyebrow}
      </Text>
      <Heading level={headingLevel} size={headingSize} className="mt-4">
        {heading}
      </Heading>
      {description && (
        <Text tone="muted" className="mt-5 max-w-xl">
          {description}
        </Text>
      )}
    </div>
  );
}
