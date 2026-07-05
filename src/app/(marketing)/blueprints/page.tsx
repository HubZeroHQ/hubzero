import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

import "@/lib/cms/collections";

import { BlueprintsGrid, type BlueprintsGridItem } from "@/components/marketing/blueprints-grid";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { findPublished, resolveCoverImage } from "@/lib/cms/public-content";
import { pageMetadata } from "@/lib/seo";
import { firstLineTeaser } from "@/lib/utils";
import { Blueprint, type BlueprintDocument } from "@/models/blueprint";

export const metadata: Metadata = pageMetadata({
  title: "Blueprints",
  description: "Reusable, customizable, production-ready engineering foundations — not templates.",
  path: "/blueprints",
});

export const revalidate = 3600;

/**
 * `ARCHITECTURE/06_PAGE_SPECIFICATIONS.md`'s Blueprints index. Publishing a
 * Blueprint is already gated on `demoStatus === "live"`
 * (`lib/cms/collections/blueprint.config.ts`'s `publishGuard`), so every
 * published document here has a real, working demo behind it by
 * construction — the "a Blueprint with a dead demo actively damages the
 * 'not a template' claim" risk `05_CONTENT_STRATEGY.md` §2b names is already
 * closed at the publish boundary, not re-checked here.
 */
export default async function BlueprintsIndexPage() {
  const blueprints = await findPublished<BlueprintDocument>(Blueprint);

  const items: BlueprintsGridItem[] = await Promise.all(
    blueprints.map(async (doc) => ({
      slug: doc.slug,
      name: doc.name,
      category: doc.category,
      descriptionTeaser: firstLineTeaser(doc.description),
      hasLiveDemo: Boolean(doc.demoDeploymentUrl ?? doc.previewUrl),
      cover: await resolveCoverImage(doc.coverImage ? String(doc.coverImage) : undefined),
    })),
  );

  return (
    <div className="pt-16 pb-28 sm:pt-20 lg:pt-24">
      <Container>
        <p className="text-caption text-text-muted font-mono tracking-wide uppercase">Blueprints</p>
        <h1 className="text-text mt-4 max-w-2xl text-[clamp(2rem,1rem+4vw,3.5rem)] leading-[1.1] font-normal tracking-tight">
          Real foundations, not templates.
        </h1>
        <p className="text-body text-text-muted mt-6 max-w-xl">
          A Blueprint is a working starting point built from real client and Labs experience —
          customizable, not a theme you drop a logo onto. Every one shown here has a live demo you
          can actually try, not a screenshot.
        </p>
      </Container>

      <Container className="mt-16 lg:mt-20">
        <BlueprintsGrid items={items} />
      </Container>

      <Container className="mt-24 lg:mt-32">
        <div className="border-border-muted border-t pt-12">
          <p className="text-h3 text-text font-normal">Want to start a project on one of these?</p>
          <Link
            href="/contact"
            className="text-accent text-h3 mt-4 inline-flex items-center gap-2 font-serif italic no-underline hover:no-underline hover:opacity-80"
          >
            Start a project
            <ArrowUpRight className="size-4 not-italic" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </div>
  );
}
