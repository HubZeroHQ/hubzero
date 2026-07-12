import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

export type SkeletonProps = ComponentPropsWithoutRef<"div">;

/** Loading placeholder block — size it via className (e.g. `h-4 w-32`, `h-10 w-10 rounded-full`). */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("bg-bg-light animate-pulse rounded-md", className)}
      {...props}
    />
  );
}
