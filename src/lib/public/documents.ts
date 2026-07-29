import { blockSchema, type Block } from '@/lib/documents/blocks';
import type { DocumentRecord } from '@/lib/documents/schema';
import type { TaxonomyEntry } from '@/types/studio';
import type { PublicBlock, PublicDocument, PublicDocumentRole } from './domain';
import { toPublicMedia } from './media';
import type { PublicDataSource } from './source';
import { isPublicDocumentRole } from './visibility';

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

export async function toPublicDocuments(
  source: PublicDataSource,
  documents: readonly DocumentRecord[],
): Promise<PublicDocument[]> {
  const readable = documents.filter(
    (document) =>
      isPublicDocumentRole(document.ownerType, document.role) && Array.isArray(document.blocks),
  );
  const blocks = readable.flatMap((document) =>
    document.blocks.flatMap((block) => {
      const parsed = blockSchema.safeParse(block);
      return parsed.success ? [parsed.data] : [];
    }),
  );
  const mediaIds = unique(
    blocks.flatMap((block) => {
      if (block.type === 'image') return [block.data.mediaId];
      if (block.type === 'imageGallery') return block.data.images.map((image) => image.mediaId);
      return [];
    }),
  );
  const taxonomyIds = unique(
    blocks.flatMap((block) => (block.type === 'technologyStack' ? block.data.technologyIds : [])),
  );
  const [media, taxonomy] = await Promise.all([
    source.findMedia(mediaIds),
    source.findTaxonomy(taxonomyIds),
  ]);
  const mediaById = new Map(media.map((asset) => [asset._id.toString(), asset]));
  const taxonomyById = new Map(taxonomy.map((term) => [term._id.toString(), term]));

  return readable.flatMap((document) => {
    const publicBlocks = document.blocks.flatMap((block) => {
      const parsed = blockSchema.safeParse(block);
      if (!parsed.success) return [];
      const mapped = mapBlock(parsed.data, mediaById, taxonomyById);
      return mapped ? [mapped] : [];
    });
    if (!publicBlocks.length) return [];
    const outline = publicBlocks.flatMap((block) =>
      block.type === 'heading'
        ? [{ id: block.id, level: block.data.level, text: block.data.text }]
        : [],
    );
    return [
      {
        role: document.role as PublicDocumentRole,
        blocks: publicBlocks,
        ...(outline.length ? { outline } : {}),
      },
    ];
  });
}

function mapBlock(
  block: Block,
  media: ReadonlyMap<string, Awaited<ReturnType<PublicDataSource['findMedia']>>[number]>,
  taxonomy: ReadonlyMap<string, TaxonomyEntry>,
): PublicBlock | null {
  if (block.type === 'image') {
    const descriptor = toPublicMedia(media.get(block.data.mediaId), 'inline', {
      alt: block.data.altText,
      ...(block.data.caption ? { caption: block.data.caption } : {}),
    });
    return descriptor ? { id: block.id, type: 'image', data: { media: descriptor } } : null;
  }
  if (block.type === 'imageGallery') {
    const images = block.data.images.flatMap((image) => {
      const descriptor = toPublicMedia(media.get(image.mediaId), 'gallery', { alt: image.altText });
      return descriptor ? [descriptor] : [];
    });
    return images.length ? { id: block.id, type: 'imageGallery', data: { images } } : null;
  }
  if (block.type === 'technologyStack') {
    const technologies = block.data.technologyIds.flatMap((id) => {
      const term = taxonomy.get(id);
      return term?.kind === 'technology'
        ? [{ kind: term.kind, label: term.label, slug: term.slug }]
        : [];
    });
    return technologies.length
      ? { id: block.id, type: 'technologyStack', data: { technologies } }
      : null;
  }
  return block;
}
