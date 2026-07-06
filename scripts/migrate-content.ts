import { readFile } from "fs/promises";
import path from "path";

import "@/lib/cms/collections";
import { connectToDatabase } from "@/lib/db";
import {
  migrateCaseStudyContent,
  migrateSingleFieldContent,
} from "@/lib/cms/blocks/legacy-migration";
import { uploadMedia } from "@/lib/cms/media";
import { snapshotVersion } from "@/lib/cms/version-history";
import { CaseStudy } from "@/models/case-study";
import { LabsProject } from "@/models/labs-project";
import { User } from "@/models/user";

/**
 * CMS Foundation Phase H — one-time content migration
 * (`ARCHITECTURE/14_IMPLEMENTATION_ROADMAP.md`'s Phase G, `19_CMS_FOUNDATION.md`
 * §13's "real, scoped migration work"). Moves the two pieces of real,
 * already-approved content that predate the CMS — the Bhatkal Time Luxe case
 * study (`src/config/case-studies.ts` + the hand-written
 * `work/bhatkal-time-luxe` route) and the IoT Sensor Dashboard Labs project
 * (previously embedded on the Hardware page and About page) — into real,
 * published documents. Every fact below is copied from the existing
 * hand-written pages/`docs/research/`; the original problem/approach/result
 * framing is preserved as `content` blocks via `migrateCaseStudyContent()`
 * (`ARCHITECTURE/20_CONTENT_BLOCKS.md`) — nothing invented.
 *
 * Idempotent: safe to re-run (upserts by `slug`, `runValidators: true` so a
 * schema change — e.g. a new required field — fails loudly here rather than
 * silently writing an incomplete document).
 *
 * Usage: `npm run migrate-content` (after `npm run create-admin`, so a
 * `head_admin` exists to attribute `createdBy`/`uploadedBy` to).
 */
async function main() {
  await connectToDatabase();

  const admin = await User.findOne({ role: "head_admin" }).sort({ createdAt: 1 });
  if (!admin) {
    console.error('No head_admin account exists yet — run "npm run create-admin" first.');
    process.exit(1);
  }

  await migrateBhatkalTimeLuxe(admin._id.toString());
  await migrateIotSensorDashboard(admin._id.toString());

  process.exit(0);
}

async function migrateBhatkalTimeLuxe(adminId: string) {
  const heroPath = path.join(
    process.cwd(),
    "public/case-studies/bhatkal-time-luxe/hero-homepage.webp",
  );
  const heroBuffer = await readFile(heroPath);
  const media = await uploadMedia({
    buffer: heroBuffer,
    originalName: "bhatkal-time-luxe-hero-homepage.webp",
    mimeType: "image/webp",
    alt: "Bhatkal Time Luxe homepage — dark editorial storefront with gold accent and a featured Rolex Datejust listing",
    uploadedBy: adminId,
  });

  const problem =
    "A luxury watch retailer needed a storefront that read as premium as the timepieces it sells — a conversion-focused catalog experience across desktop and mobile, in the customer's own currency — and a back office the business could run independently, without calling a developer for day-to-day catalog, pricing, or homepage changes.";

  const approach = `The frontend runs on Next.js 16 (App Router) with React 19. There's no separate backend service — server logic runs as Next.js Route Handlers colocated in the same codebase, backed by MongoDB Atlas through Mongoose across 12 data models covering products, brands, orders, carts, and homepage curation. Admin sessions are JWT-based, enforced at the edge via middleware on every \`/admin\` route, with bcrypt-hashed credentials underneath.

Product and brand imagery is stored durably in Cloudinary, then served through a secondary CDN layer for automatic AVIF/WebP negotiation — toggled by a single environment variable. Rendering is mixed by design: static prerendering for content-stable pages, static generation for guide articles, and dynamic server rendering for catalog and API routes.

Rather than one responsive component per page, customer-facing pages render genuinely separate desktop and mobile component trees, switching at a 1024px breakpoint — tablet is handled as an enhancement layer on top of the mobile components, not a third parallel codebase.

Notable implementation decisions:
- A two-tier image pipeline with zero-downtime rollback — Cloudinary for durable storage, a CDN layer negotiating AVIF/WebP automatically. On a representative product photo, that took a 458KB source image down to 42KB in Chrome (AVIF) and 78KB in Safari (WebP).
- One pricing module for both checkout paths — cart checkout and the single-product "Buy Now" flow both route through the same order-pricing functions, so totals and WhatsApp order messages can never diverge between the two.
- Cascade-safe deletes — deleting a brand cleans up every dependent product and homepage curation entry that references it, handled as a single pre-delete hook.
- Self-healing client-side state — Wishlist and Recently Viewed live in localStorage for speed, but are verified against the live catalog on load, silently pruning any product that's since been removed.`;

  const result = `Checkout runs through WhatsApp: the cart generates a formatted order message — sequential order ID, line items, totals in the customer's chosen currency — and hands it off to a real conversation rather than a generic order-confirmation email.

Bhatkal Time Luxe now runs its own catalog, pricing, and homepage curation through its admin panel — the operational independence the project was built around. HubZero stays on for fixes, maintenance, and the next iteration.

Measured directly against the repository and a clean production build — no business, traffic, or revenue figures are claimed, since none are derivable from the code:
- 64 routes generated at build
- 44 API route handlers
- 12 Mongoose data models
- 32 shared UI components
- 11 currencies supported
- 5 published buying guides`;

  const doc = await CaseStudy.findOneAndUpdate(
    { slug: "bhatkal-time-luxe" },
    {
      slug: "bhatkal-time-luxe",
      client: "Bhatkal Time Luxe",
      industry: "Luxury retail — watches",
      practiceArea: "software",
      summary:
        "A luxury watch retailer needed a storefront that read as premium as the timepieces it sells, plus a back office the business could run independently.",
      content: migrateCaseStudyContent({ problem, approach, result }),
      techTags: ["Next.js", "React", "MongoDB", "Mongoose", "Cloudinary", "Tailwind CSS"],
      coverImage: media.id,
      status: "published",
      publishedAt: new Date(),
      createdBy: adminId,
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true, runValidators: true },
  );

  await snapshotVersion("caseStudy", doc.toObject() as unknown as Record<string, unknown>, adminId);
  console.log(`Migrated CaseStudy "bhatkal-time-luxe" (${doc._id.toString()})`);
}

async function migrateIotSensorDashboard(adminId: string) {
  const description =
    "A real-time environmental monitoring system built internally, end to end, by HubZero's electronics lead — a sensor node, a microcontroller bridge, and a live dashboard, with no client involved. Built between November 2024 and January 2025. It exists because the fastest way to trust a hardware-software bridge is to build one and watch it run for a few months — and because a new sensor protocol or dashboard pattern gets tested here first, not on a client's time.";

  const doc = await LabsProject.findOneAndUpdate(
    { slug: "iot-sensor-dashboard" },
    {
      slug: "iot-sensor-dashboard",
      title: "IoT Sensor Dashboard",
      practiceArea: "hardware",
      summary:
        "A real-time environmental monitoring system built internally — a sensor node, a microcontroller bridge, and a live dashboard, with no client involved.",
      content: migrateSingleFieldContent(description),
      techTags: ["Arduino", "Node.js", "Socket.IO", "Chart.js"],
      isClientWork: false,
      stage: "active",
      status: "published",
      publishedAt: new Date(),
      createdBy: adminId,
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true, runValidators: true },
  );

  await snapshotVersion(
    "labsProject",
    doc.toObject() as unknown as Record<string, unknown>,
    adminId,
  );
  console.log(`Migrated LabsProject "iot-sensor-dashboard" (${doc._id.toString()})`);
}

main().catch((error) => {
  console.error("Content migration failed:", error);
  process.exit(1);
});
