import type { ComponentPropsWithoutRef } from "react";

import { Container, type ContainerProps } from "@/components/ui/container";
import { cn } from "@/lib/utils";

/**
 * Section vertical padding, DESIGN/V3/14_VISUAL_TOKENS.md §1 — every step
 * pulled directly from the 9-step spacing scale (`--space-6/7/8`), never an
 * intermediate value invented for one section. Per the dimension-chain rule
 * (`02_VISUAL_LANGUAGE.md` §3), a page picks its single tallest beat first
 * and assigns it `lg` (step 8); every other beat is `sm` (step 6, the quiet
 * floor) or `default` (step 7, the standard) in proportion to its real
 * narrative weight — not chosen independently per section. Mobile values
 * step down one rung on the same scale rather than using an arbitrary
 * fraction, so the whole responsive range stays on-scale.
 */
const spacing = {
  /** Standard section rhythm — step 6 → step 7 (76px → 120px). */
  default: "py-19 md:py-30",
  /** Compact/quiet-beat floor — step 5 → step 6 (48px → 76px). */
  sm: "py-12 md:py-19",
  /** Tallest-beat padding — a page's one primary dimension. Step 7 → step 8 (120px → 188px). */
  lg: "py-30 md:py-47",
  /** No vertical padding — section only provides the landmark + container. */
  none: "",
} as const;

export interface SectionProps extends ComponentPropsWithoutRef<"section"> {
  /** @default "default" */
  spacing?: keyof typeof spacing;
  /** Nest a Container for horizontal constraint. Set false for full-bleed content. @default true */
  container?: boolean;
  /** Forwarded to the nested Container when `container` is true. */
  containerSize?: ContainerProps["size"];
}

export function Section({
  spacing: spacingKey = "default",
  container = true,
  containerSize,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn(spacing[spacingKey], className)} {...props}>
      {container ? <Container size={containerSize}>{children}</Container> : children}
    </section>
  );
}
