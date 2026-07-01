import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cn } from "@/lib/utils";

const sizes = {
  body: "text-body",
  caption: "text-caption",
} as const;

const weights = {
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
} as const;

const tones = {
  default: "text-text",
  muted: "text-text-muted",
} as const;

export interface TextProps extends ComponentPropsWithoutRef<"p"> {
  as?: ElementType;
  /** @default "body" */
  size?: keyof typeof sizes;
  /** @default "regular" */
  weight?: keyof typeof weights;
  /** @default "default" */
  tone?: keyof typeof tones;
  /**
   * The recurring kicker/label pattern (e.g. "404", "HubZero v2") — caption
   * size, mono (genuinely technical-metadata use, §1), uppercase, wide
   * tracking. Overrides `size`/`weight` when set.
   */
  eyebrow?: boolean;
}

export function Text({
  as: Tag = "p",
  size = "body",
  weight = "regular",
  tone = "default",
  eyebrow = false,
  className,
  ...props
}: TextProps) {
  return (
    <Tag
      className={cn(
        eyebrow
          ? "text-caption font-mono tracking-widest uppercase"
          : cn(sizes[size], weights[weight]),
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
