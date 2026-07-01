import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-accent text-accent-foreground hover:opacity-90",
  secondary: "border-border hover:border-accent hover:text-accent text-text border",
  ghost: "text-text-muted hover:text-text hover:bg-bg-light",
} as const;

const sizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
} as const;

export interface IconButtonProps extends ComponentPropsWithoutRef<"button"> {
  /** @default "ghost" */
  variant?: keyof typeof variants;
  /** @default "md" */
  size?: keyof typeof sizes;
  /** e.g. a lucide-react icon element — size it yourself (h-4 w-4 / h-5 w-5). */
  icon: ReactNode;
  /** Required, not optional — an icon-only control has no visible text (§6). */
  "aria-label": string;
}

export function IconButton({
  variant = "ghost",
  size = "md",
  icon,
  type = "button",
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        "transition-colors duration-150 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
