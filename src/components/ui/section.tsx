import type { ComponentPropsWithoutRef } from "react";

import { Container, type ContainerProps } from "@/components/ui/container";
import { cn } from "@/lib/utils";

const spacing = {
  /** Standard section rhythm — §3 (96-128px desktop, upper end as the default). */
  default: "py-24 md:py-32",
  /** Tighter rhythm for secondary/supporting sections. */
  sm: "py-16 md:py-20",
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
