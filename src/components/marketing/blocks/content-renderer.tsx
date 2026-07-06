import { BlockRenderer } from "@/components/marketing/blocks/block-renderer";
import { collectBlockMediaIds } from "@/lib/cms/blocks/guard";
import { resolveMediaMap } from "@/lib/cms/public-content";
import type { Block } from "@/lib/cms/blocks/types";

export interface ContentRendererProps {
  blocks: Block[];
}

/**
 * The generic entry point every narrative detail page renders through
 * (`ARCHITECTURE/20_CONTENT_BLOCKS.md` §7) — `<ContentRenderer blocks={doc.content} />`
 * is the entire integration a page needs, replacing the old fixed sequence
 * of `<RichText>{doc.problem}</RichText>`-style sections. No assumption
 * about section order or which blocks exist — it renders exactly the blocks
 * the author arranged, in that order.
 *
 * An async Server Component: media referenced anywhere in the tree is
 * resolved once, in a single batched query (`resolveMediaMap`), before any
 * block renders — never a `getMediaById` call per `BlockRenderer` instance.
 */
export async function ContentRenderer({ blocks }: ContentRendererProps) {
  const media = await resolveMediaMap(collectBlockMediaIds(blocks));

  return (
    <div className="flex flex-col gap-12 sm:gap-16 lg:gap-20">
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} media={media} />
      ))}
    </div>
  );
}
