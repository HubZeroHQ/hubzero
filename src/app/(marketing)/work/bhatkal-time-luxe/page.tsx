import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Bhatkal Time Luxe",
  description:
    "A luxury watch eCommerce platform built by HubZero — an editorial storefront paired with a complete self-service admin back office.",
};

/**
 * The dedicated Bhatkal Time Luxe case study. Every fact, figure, and
 * screenshot on this page is sourced directly from
 * `docs/research/PROJECT_CASE_STUDY_ANALYSIS_BHATKAL_TIME_LUXE.md` — nothing
 * here is an invented metric, outcome, or testimonial. Where that document's
 * own confidentiality notes flag a detail as unverifiable (the build month)
 * or out of scope for a public page (client identity beyond the project
 * name, specific currency set, contract terms), this page follows those
 * notes rather than the original "April 2025" instruction.
 *
 * The HubZero × Bhatkal Time Luxe logo lockup appears exactly once, here in
 * the hero — per the task brief, it's a storytelling device marking this as
 * a featured collaboration, not a repeated branding element.
 */
export default function BhatkalTimeLuxeCaseStudy() {
  return (
    <div className="pb-32">
      {/* Hero — the one place the two brands appear together. */}
      <div className="pt-20 pb-16 sm:pt-24 lg:pt-28">
        <Container>
          <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
            Case study
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-6 sm:gap-8">
            <Logo />
            <span className="text-text-muted text-h3 font-serif italic" aria-hidden="true">
              ×
            </span>
            <span className="inline-flex items-center gap-3">
              <Image
                src="/case-studies/bhatkal-time-luxe/logo.png"
                alt="Bhatkal Time Luxe"
                width={128}
                height={125}
                className="size-7 shrink-0"
              />
              <span className="text-h3 text-text tracking-tight">Bhatkal Time Luxe</span>
            </span>
          </div>

          <h1 className="text-text mt-10 max-w-3xl text-[clamp(2.25rem,1rem+4.5vw,4.5rem)] leading-[1.08] font-normal tracking-tight">
            A storefront and the back office that runs it.
          </h1>
          <p className="text-body text-text-muted mt-6 max-w-xl">
            A full-stack luxury watch eCommerce platform pairing an editorial, dark-themed
            storefront with a complete self-service admin back office.
          </p>
          <p className="text-caption text-text-muted mt-8 font-mono">
            Bhatkal Time Luxe <span aria-hidden="true">·</span> Software Engineering{" "}
            <span aria-hidden="true">·</span> 2025
          </p>
        </Container>

        <Container size="full" className="mt-14 sm:mt-16 lg:mt-20">
          <div className="mx-auto w-full max-w-6xl">
            <Image
              src="/case-studies/bhatkal-time-luxe/hero-homepage.webp"
              alt="Bhatkal Time Luxe homepage — dark editorial storefront with gold accent and a featured Rolex Datejust listing"
              width={2557}
              height={1270}
              sizes="(min-width: 1024px) 72rem, 92vw"
              className="h-auto w-full"
              priority
            />
          </div>
        </Container>
      </div>

      {/* The brief. lg gap added: this follows the page's single largest
          image (the full-bleed hero), so it was landing tighter than every
          later image→text handoff on this page (which run ~lg:mt-24+) —
          brought in line with that established rhythm rather than left as
          the one outlier. */}
      <Container className="mt-8 sm:mt-12 lg:mt-16">
        <div className="max-w-[var(--content-prose)]">
          <h2 className="text-h2 text-text font-normal">The brief</h2>
          <p className="text-body text-text-muted mt-5">
            A luxury watch retailer needed a storefront that read as premium as the timepieces it
            sells — a conversion-focused catalog experience across desktop and mobile, in the
            customer&apos;s own currency — and a back office the business could run independently,
            without calling a developer for day-to-day catalog, pricing, or homepage changes.
          </p>
          <p className="text-h3 text-text mt-8 font-serif italic">
            Built to feel as considered as the watches it sells.
          </p>
        </div>
      </Container>

      {/* Interface craftsmanship */}
      <Container size="full" className="mt-16 sm:mt-20 lg:mt-24">
        <div className="mx-auto w-full max-w-6xl">
          <Image
            src="/case-studies/bhatkal-time-luxe/product-page.webp"
            alt="Bhatkal Time Luxe product detail page — Invicta Reserve watch with price, stock status, and Buy via WhatsApp action"
            width={2552}
            height={1252}
            sizes="(min-width: 1024px) 72rem, 92vw"
            className="h-auto w-full"
          />
        </div>
      </Container>
      <Container className="mt-8">
        <p className="text-caption text-text-muted max-w-md font-mono">
          Product detail — reference code, live stock status, WhatsApp checkout
        </p>
      </Container>

      {/* Approach */}
      <Container className="mt-24 sm:mt-28 lg:mt-32">
        <div className="max-w-[var(--content-prose)]">
          <h2 className="text-h2 text-text font-normal">Approach</h2>
          <p className="text-body text-text-muted mt-5">
            The frontend runs on Next.js 16 (App Router) with React 19. There&apos;s no separate
            backend service — server logic runs as Next.js Route Handlers colocated in the same
            codebase, backed by MongoDB Atlas through Mongoose across 12 data models covering
            products, brands, orders, carts, and homepage curation. Admin sessions are JWT-based,
            enforced at the edge via middleware on every <code>/admin</code> route, with
            bcrypt-hashed credentials underneath.
          </p>
          <p className="text-body text-text-muted mt-5">
            Product and brand imagery is stored durably in Cloudinary, then served through a
            secondary CDN layer for automatic AVIF/WebP negotiation — toggled by a single
            environment variable, so the entire delivery layer can be switched off instantly with no
            code change and no broken images if it&apos;s ever needed. Rendering is mixed by design:
            static prerendering for content-stable pages, static generation for guide articles, and
            dynamic server rendering for catalog and API routes.
          </p>
        </div>
      </Container>

      {/* Information architecture */}
      <Container size="full" className="mt-16 sm:mt-20 lg:mt-24">
        <div className="mx-auto w-full max-w-6xl">
          <Image
            src="/case-studies/bhatkal-time-luxe/brands-page.webp"
            alt="Bhatkal Time Luxe brands page — Horological Heritage editorial header above the brand grid"
            width={2557}
            height={1272}
            sizes="(min-width: 1024px) 72rem, 92vw"
            className="h-auto w-full"
          />
        </div>
      </Container>
      <Container className="mt-8">
        <p className="text-caption text-text-muted max-w-md font-mono">
          Brand-centric catalog structure — every product belongs to a brand page, not just a
          category
        </p>
      </Container>

      {/* Catalogue presentation */}
      <Container size="full" className="mt-16 sm:mt-20 lg:mt-24">
        <div className="mx-auto w-full max-w-6xl">
          <Image
            src="/case-studies/bhatkal-time-luxe/new-arrivals-page.webp"
            alt="Bhatkal Time Luxe New Arrivals page — Vault Additions editorial header"
            width={2552}
            height={1268}
            sizes="(min-width: 1024px) 72rem, 92vw"
            className="h-auto w-full"
          />
        </div>
      </Container>
      <Container className="mt-8">
        <div className="max-w-[var(--content-prose)]">
          <p className="text-caption text-text-muted font-mono">
            New Arrivals — sorted by most recently added stock
          </p>
          <p className="text-body text-text-muted mt-6">
            Full-catalog search pairs brand-chip filtering with a price-range slider and multiple
            sort options, matching against each product&apos;s reference code as well as its name —
            so support staff and customers can find a specific watch even from a code alone.
          </p>
        </div>
      </Container>

      {/* Implementation decisions — real facts, Geist Mono */}
      <Container className="mt-24 sm:mt-28 lg:mt-32">
        <div className="max-w-[var(--content-prose)]">
          <h2 className="text-h2 text-text font-normal">Implementation decisions</h2>
          <dl className="mt-8 space-y-8">
            <div>
              <dt className="text-body text-text font-medium">
                A two-tier image pipeline with a zero-downtime rollback
              </dt>
              <dd className="text-body text-text-muted mt-2">
                Cloudinary handles durable storage; a CDN layer in front of it negotiates AVIF/WebP
                automatically. On a representative product photo, that took a 458KB source image
                down to 42KB in Chrome (AVIF) and 78KB in Safari (WebP) — a size reduction of up to{" "}
                <span className="font-mono">~90%</span>, measured directly against a production
                build.
              </dd>
            </div>
            <div>
              <dt className="text-body text-text font-medium">
                One pricing module for both checkout paths
              </dt>
              <dd className="text-body text-text-muted mt-2">
                Cart checkout and the single-product &quot;Buy Now&quot; flow both route through the
                same order-pricing functions, so totals, line items, and WhatsApp order messages can
                never diverge between the two purchase paths.
              </dd>
            </div>
            <div>
              <dt className="text-body text-text font-medium">Cascade-safe deletes</dt>
              <dd className="text-body text-text-muted mt-2">
                Deleting a brand cleans up every dependent product and every homepage curation entry
                (Featured, Best Selling, Top Brands) that references it, handled as a single
                pre-delete hook rather than left as an application-layer afterthought.
              </dd>
            </div>
            <div>
              <dt className="text-body text-text font-medium">Self-healing client-side state</dt>
              <dd className="text-body text-text-muted mt-2">
                Wishlist and Recently Viewed live in <span className="font-mono">localStorage</span>{" "}
                for speed, but are verified against the live catalog on load — silently pruning any
                product that&apos;s since been removed, so a customer never sees a &quot;ghost&quot;
                card for a discontinued watch.
              </dd>
            </div>
          </dl>
        </div>
      </Container>

      {/* Purchasing experience */}
      <Container size="full" className="mt-24 sm:mt-28 lg:mt-32">
        <div className="mx-auto w-full max-w-6xl">
          <Image
            src="/case-studies/bhatkal-time-luxe/cart-page.webp"
            alt="Bhatkal Time Luxe cart page — order summary with Checkout with WhatsApp action"
            width={2557}
            height={1272}
            sizes="(min-width: 1024px) 72rem, 92vw"
            className="h-auto w-full"
          />
        </div>
      </Container>
      <Container className="mt-8">
        <div className="max-w-[var(--content-prose)]">
          <p className="text-caption text-text-muted font-mono">
            Cart — cookie-identified, no login required
          </p>
          <p className="text-body text-text-muted mt-6">
            Checkout runs through WhatsApp: the cart generates a formatted order message —
            sequential order ID, line items, totals in the customer&apos;s chosen currency — and
            hands it off to a real conversation rather than a generic order-confirmation email.
            It&apos;s a lower-friction path for a business whose customers already expect to reach a
            person about a purchase this considered.
          </p>
        </div>
      </Container>

      {/* Layered UI / motion system */}
      <Container size="full" className="mt-16 sm:mt-20 lg:mt-24">
        <div className="mx-auto w-full max-w-4xl">
          <Image
            src="/case-studies/bhatkal-time-luxe/quick-look-component.webp"
            alt="Bhatkal Time Luxe Quick Look modal — inline product preview over a blurred product grid"
            width={2557}
            height={1267}
            sizes="(min-width: 1024px) 56rem, 92vw"
            className="h-auto w-full"
          />
        </div>
      </Container>
      <Container className="mt-8">
        <div className="max-w-[var(--content-prose)]">
          <p className="text-caption text-text-muted font-mono">
            Quick View — inline preview, no page navigation
          </p>
          <p className="text-body text-text-muted mt-6">
            Every animation on the site is hand-built with CSS keyframes and Tailwind transitions —
            no animation library. Scroll-reveal for storytelling sections, CSS view-transitions for
            page navigation, a custom enter/exit system for modals like this one, and small
            conversion-reinforcing details (a wishlist &quot;heart pop,&quot; a cart-badge pop on
            add-to-cart) — all respecting <span className="font-mono">prefers-reduced-motion</span>.
          </p>
        </div>
      </Container>

      {/* Responsive strategy */}
      <Container className="mt-24 sm:mt-28 lg:mt-32">
        <div className="max-w-[var(--content-prose)]">
          <h2 className="text-h2 text-text font-normal">Independent by device, not by accident</h2>
          <p className="text-body text-text-muted mt-5">
            Rather than one responsive component per page, customer-facing pages render genuinely
            separate desktop and mobile component trees, switching at a 1024px breakpoint. Tablet
            doesn&apos;t get a third parallel codebase — it&apos;s handled as an enhancement layer
            on top of the mobile components via mid-range breakpoints, giving tablet users real
            two-column product and cart layouts (and a persistent admin sidebar) without tripling
            the maintenance surface.
          </p>
        </div>
      </Container>

      {/* Challenges — honest engineering narrative */}
      <Container className="mt-16 sm:mt-20">
        <div className="max-w-[var(--content-prose)]">
          <h2 className="text-h2 text-text font-normal">What made it hard</h2>
          <p className="text-body text-text-muted mt-5">
            Maintaining two full sets of UI components in sync is a real, ongoing cost of the
            deliberate mobile/desktop split — the codebase shows a dedicated desktop-stabilization
            QA pass to keep the two in parity. Currency handling added its own complexity: prices
            are stored in one base currency and converted for display and checkout across eleven
            world currencies, each with its own decimal-place rules, centralized in one formatting
            module rather than duplicated per component. And migrating an existing image catalog to
            Cloudinary without downtime meant purpose-built migration and rollback scripts with
            backup snapshots — a live-catalog migration handled carefully, not a greenfield build.
          </p>
        </div>
      </Container>

      {/* By the numbers — repo-verified, not business metrics */}
      <Container className="mt-24 sm:mt-28 lg:mt-32">
        <div className="max-w-[var(--content-prose)]">
          <p className="text-caption text-text-muted font-mono tracking-wide uppercase">
            By the numbers
          </p>
          <p className="text-caption text-text-muted mt-3 max-w-md">
            Measured directly against the repository and a clean production build — no business,
            traffic, or revenue figures are claimed here, since none are derivable from the code.
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
            {[
              ["64", "routes generated at build"],
              ["44", "API route handlers"],
              ["12", "Mongoose data models"],
              ["32", "shared UI components"],
              ["11", "currencies supported"],
              ["5", "published buying guides"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="text-h2 text-text font-mono font-normal">{value}</dt>
                <dd className="text-caption text-text-muted mt-1">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>

      {/* Ongoing relationship */}
      <Container className="mt-24 sm:mt-28 lg:mt-32">
        <div className="max-w-[var(--content-prose)]">
          <h2 className="text-h2 text-text font-normal">After launch</h2>
          <p className="text-body text-text-muted mt-5">
            Bhatkal Time Luxe now runs its own catalog, pricing, and homepage curation through its
            admin panel — the operational independence the project was built around. HubZero stays
            on for fixes, maintenance, and the next iteration, the same accountability we bring to
            every engagement.
          </p>
        </div>
      </Container>

      {/* CTA close */}
      <Container className="mt-32 sm:mt-40 lg:mt-48">
        <div className="border-border-muted border-t pt-12 text-center">
          <p className="text-h3 text-text font-normal">Building something similar?</p>
          <Link
            href="/contact"
            className="text-accent text-h2 mt-6 inline-flex items-center gap-2 font-serif italic no-underline hover:no-underline hover:opacity-80"
          >
            Start a project
            <ArrowUpRight className="size-5 not-italic" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </div>
  );
}
