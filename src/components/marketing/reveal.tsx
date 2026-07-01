"use client";

import type { ComponentPropsWithoutRef, ElementType } from "react";

import { useInView } from "@/lib/use-in-view";
import { cn } from "@/lib/utils";

export interface RevealProps extends ComponentPropsWithoutRef<"div"> {
  as?: ElementType;
  /** Travel distance in pixels before settling — §4's 8-16px range, never a long throw. @default 12 */
  distance?: number;
  /** Staggers multiple Reveals in the same beat without orchestration overhead. */
  delayMs?: number;
}

/**
 * Plain-CSS, one-shot, scroll-triggered reveal (ARCHITECTURE/15_HOMEPAGE_DESIGN.md
 * §8: below the fold is CSS, not Framer Motion). `prefers-reduced-motion` needs
 * no local check — the global rule in globals.css zeroes the transition duration.
 */
export function Reveal({
  as: Tag = "div",
  distance = 12,
  delayMs = 0,
  className,
  style,
  children,
  ...props
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <Tag
      ref={ref}
      className={cn("transition-[opacity,transform] duration-300 ease-out", className)}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : `translateY(${distance}px)`,
        transitionDelay: `${delayMs}ms`,
        ...style,
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}
