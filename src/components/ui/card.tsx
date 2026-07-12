import type { ComponentPropsWithoutRef } from "react";

import { Surface } from "@/components/ui/surface";
import { cn } from "@/lib/utils";

export interface CardProps extends ComponentPropsWithoutRef<"div"> {
  /** Subtle hover shadow, for cards that sit inside a clickable link/button. @default false */
  interactive?: boolean;
}

export function Card({ interactive = false, className, ...props }: CardProps) {
  return (
    <Surface
      padding="lg"
      // Resting elevation is no shadow — a panel bounded by grid position
      // and a hairline rule, not a floating shadowed box (14_VISUAL_TOKENS
      // §5, 06_COMPONENT_LANGUAGE §2). `interactive` still lifts to the
      // Raised step on hover, since that's real state feedback, not
      // ambient decoration.
      shadow="none"
      className={cn(interactive && "hover:shadow-raised transition-shadow duration-150", className)}
      {...props}
    />
  );
}
