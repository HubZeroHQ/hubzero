import type { ComponentPropsWithoutRef } from "react";

import { Link } from "@/components/ui/link";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-accent text-accent-foreground hover:opacity-90",
  secondary: "border-border hover:border-accent hover:text-accent-text text-text border",
  ghost: "text-text-muted hover:text-text hover:bg-bg-light",
} as const;

const sizes = {
  sm: "px-4 py-1.5 text-caption",
  md: "px-5 py-2 text-body",
  lg: "px-6 py-3 text-body",
} as const;

export interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  /** @default "primary" */
  variant?: keyof typeof variants;
  /** @default "md" */
  size?: keyof typeof sizes;
  /** Disables the button, shows a Spinner, and sets aria-busy. */
  isLoading?: boolean;
  /** Renders as a Link instead of a <button> — same visual treatment, navigates instead of acting. */
  href?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  href,
  disabled = false,
  type = "button",
  className,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;
  const classes = cn(
    // Rectangle with the sitewide 4px radius, not a pill — a labeled
    // control on an instrument panel, not a consumer-app affordance
    // (DESIGN/V3/06_COMPONENT_LANGUAGE.md §1, 14_VISUAL_TOKENS.md §3).
    "rounded-sm inline-flex items-center justify-center gap-2 font-medium",
    "transition-colors duration-150 disabled:pointer-events-none",
    variants[variant],
    sizes[size],
    className,
  );

  const content = (
    <>
      {isLoading && <Spinner size="sm" label={null} />}
      <span
        className={cn(
          "inline-flex items-center gap-1.5 whitespace-nowrap",
          isLoading && "opacity-70",
        )}
      >
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        tone="default"
        aria-disabled={isDisabled || undefined}
        className={cn(classes, "no-underline hover:no-underline", isDisabled && "opacity-50")}
        // Button's own prop bag is HTMLButtonElement-shaped; the handful of
        // event handlers/aria/data attrs a caller passes here are valid on
        // an anchor too, so bridging the type is safe for this polymorphism.
        {...(props as ComponentPropsWithoutRef<"a">)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      className={classes}
      {...props}
    >
      {content}
    </button>
  );
}
