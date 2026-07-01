import NextLink from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { isExternalHref } from "@/lib/is-external-link";
import { cn } from "@/lib/utils";

const tones = {
  default: "text-accent",
  muted: "text-text-muted hover:text-text",
} as const;

export interface LinkProps extends ComponentPropsWithoutRef<"a"> {
  href: string;
  /** @default "default" */
  tone?: keyof typeof tones;
}

/** Inline/nav text link. For a button styled as a link target, see Button's `href` prop. */
export function Link({ href, tone = "default", className, children, ...props }: LinkProps) {
  const external = isExternalHref(href);
  const classes = cn(
    tones[tone],
    "underline-offset-4 transition-colors duration-150 hover:underline",
    className,
  );

  if (!external) {
    return (
      <NextLink href={href} className={classes} {...props}>
        {children}
      </NextLink>
    );
  }

  // mailto:/tel: are "external" (not app-internal) but open in the same tab.
  const opensNewTab = /^https?:|^\/\//i.test(href);
  return (
    <a
      href={href}
      className={classes}
      {...(opensNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    >
      {children}
    </a>
  );
}
