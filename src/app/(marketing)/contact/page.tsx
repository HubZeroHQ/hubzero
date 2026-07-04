import type { Metadata } from "next";

import { ContactForm } from "@/components/marketing/contact-form";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell us what you're building. Every engagement starts as a conversation, not a commitment — here's what helps, and what happens after you send it.",
};

/**
 * ARCHITECTURE/06_PAGE_SPECIFICATIONS.md "Contact": pricing framing without
 * a number, the fixed field set (Name, Email, Company, Project type, Budget
 * range, Message), a Server Action that persists to the database. Per
 * DESIGN/00_AI_DESIGN_GUIDE.md §6, no page spec exists yet for Contact
 * specifically, so this composition is derived from the same method the
 * guide applies everywhere else: name the question this page uniquely
 * answers, then let the shape follow from that, not from any sibling page.
 *
 * The question here isn't "what does HubZero do" (Services/Software/
 * Hardware already answered that) or "who am I trusting" (About already
 * answered that) — by the time a visitor reaches this page, persuasion is
 * done. The only open question left is practical: "what do I actually send,
 * and what happens to it." So this is the one marketing page built around
 * two things happening at once instead of in sequence: context a visitor
 * might want *while* writing (what HubZero takes on, what helps, what
 * happens next, how pricing works) sits beside the form, not stacked above
 * it as another beat to scroll past first. On narrower tablet widths there
 * isn't room for that to breathe, so it collapses to context-then-form, the
 * same "recompose per breakpoint, don't just reflow" rule the Hardware
 * page's signal path already applies (ARCHITECTURE/16_RESPONSIVE_DESIGN_STANDARDS.md
 * §1) — landscape tablet and up is where the two-column reading gets its
 * own room, matching that document's own example of a side-by-side
 * arrangement that only works in landscape.
 *
 * No CtaPanel close, unlike every other page in this family — deliberately.
 * Every other page's CTA points *at* this page; this page has nowhere left
 * to point. Repeating the serif-italic "Start a project" device here, with
 * no page after it to send anyone to, would be the exact "device coasting
 * on its own credibility" failure DESIGN/00 §3.4 names — so it's left out
 * rather than reused out of habit.
 */
export default function ContactPage() {
  return (
    <div className="pb-28 sm:pb-32 lg:pb-40">
      {/* Opening */}
      <div className="pt-20 pb-16 sm:pt-24 lg:pt-28">
        <Container>
          <p className="text-caption text-text-muted font-mono tracking-wide uppercase">Contact</p>
          <h1 className="text-text mt-6 max-w-2xl text-[clamp(2.25rem,1rem+4.5vw,4.5rem)] leading-[1.08] font-normal tracking-tight">
            This starts as a conversation, not a commitment.
          </h1>
          <p className="text-body text-text-muted mt-6 max-w-xl">
            Tell us what you&apos;re building — the practice area, the rough shape of the problem,
            whatever you already know. We&apos;ll tell you honestly whether it&apos;s a fit before
            anything else happens.
          </p>
        </Container>
      </div>

      {/* Context + form, side by side from landscape-tablet up */}
      <Container>
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-16">
          <div className="flex flex-col gap-12 lg:col-span-5">
            <div>
              <h2 className="text-h3 text-text font-normal">What we take on</h2>
              <p className="text-body text-text-muted mt-3">
                Software engineering, hardware &amp; embedded engineering, or projects that
                genuinely need both — real, scoped engagements with technical decisions behind them,
                not ongoing maintenance-only requests or unpaid discovery work.
              </p>
            </div>

            <div>
              <h2 className="text-h3 text-text font-normal">What happens after you send this</h2>
              <p className="text-body text-text-muted mt-3">
                It reaches us directly, not a sales queue. We typically reply within two business
                days, and the first conversation is a discovery call — exploratory, not a commitment
                on either side.
              </p>
            </div>

            <div className="border-border-muted border-t pt-8">
              <p className="text-body text-text-muted">
                Every project is quoted individually after that conversation. There&apos;s no fixed
                price list here — the kinds of engagements above vary too much in scope for one to
                be honest.
              </p>
            </div>
          </div>

          <div className="mt-16 lg:col-span-7 lg:mt-0">
            <ContactForm />
          </div>
        </div>
      </Container>
    </div>
  );
}
