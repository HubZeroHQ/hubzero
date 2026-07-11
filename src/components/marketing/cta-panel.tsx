import { ArrowUpRight } from "lucide-react";

import { Link } from "@/components/ui/link";

export interface CtaPanelProps {
  heading: string;
  primaryLabel: string;
  primaryHref: string;
  secondary?: { label: string; href: string };
}

/**
 * The border-top "commit to action" close — already identical, hand-rolled,
 * on Work, the case study, and (pre-redesign) Services/Software/Hardware.
 * Per ARCHITECTURE/07_DESIGN_SYSTEM.md §8, a shared *component* like this is
 * correct engineering and doesn't fail the Uniqueness Test on its own; it's
 * the page composition around it that has to differ, not this closing
 * primitive. Extracted here rather than left duplicated a fifth time.
 *
 * Software and Hardware aren't touched this session, so they still carry
 * their own inline copies — this component is ready for them to adopt when
 * they're next redesigned, not retrofitted onto them now.
 */
export function CtaPanel({ heading, primaryLabel, primaryHref, secondary }: CtaPanelProps) {
  return (
    <div className="border-border-muted border-t pt-12">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-h3 text-text font-normal">{heading}</p>
          <Link
            href={primaryHref}
            className="text-accent-text text-h2 mt-4 inline-flex items-center gap-2 font-serif italic no-underline hover:no-underline hover:opacity-80"
          >
            {primaryLabel}
            <ArrowUpRight className="size-5 not-italic" aria-hidden="true" />
          </Link>
        </div>
        {secondary && (
          <Link
            href={secondary.href}
            tone="muted"
            className="hover:text-text inline-flex items-center gap-1.5 no-underline hover:no-underline"
          >
            {secondary.label}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}
