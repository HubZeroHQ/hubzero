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
      shadow="sm"
      className={cn(interactive && "transition-shadow duration-150 hover:shadow-md", className)}
      {...props}
    />
  );
}
