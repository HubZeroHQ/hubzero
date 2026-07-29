import { ObjectId } from 'mongodb';
import { describe, expect, it } from 'vitest';
import type { DocumentRecord } from '@/lib/documents/schema';
import type { PublicDataSource } from './source';
import { toPublicDocuments } from './documents';

const mediaId = new ObjectId();
const termId = new ObjectId();

const source = {
  findMedia: async () => [
    {
      _id: mediaId,
      cloudinaryPublicId: 'hubzero/image',
      url: 'https://res.cloudinary.com/demo/image/upload/v1/image.png',
      altText: 'Architecture boundary',
      width: 1200,
      height: 800,
      folder: 'general',
      reuseTags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  findTaxonomy: async () => [
    {
      _id: termId,
      kind: 'technology',
      label: 'TypeScript',
      slug: 'typescript',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
} as unknown as PublicDataSource;

describe('public Document mapping', () => {
  it('resolves media and taxonomy once and removes every internal identifier', async () => {
    const document: DocumentRecord = {
      _id: new ObjectId(),
      ownerType: 'Build',
      ownerId: new ObjectId(),
      role: 'technical',
      blocks: [
        { id: 'heading', type: 'heading', data: { level: 2, text: 'Architecture' } },
        {
          id: 'image',
          type: 'image',
          data: {
            mediaId: mediaId.toString(),
            url: 'https://res.cloudinary.com/demo/image/upload/v1/image.png',
            altText: 'Architecture boundary',
          },
        },
        { id: 'stack', type: 'technologyStack', data: { technologyIds: [termId.toString()] } },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const [mapped] = await toPublicDocuments(source, [document]);
    const serialized = JSON.stringify(mapped);
    expect(mapped?.outline).toEqual([{ id: 'heading', level: 2, text: 'Architecture' }]);
    expect(serialized).not.toContain('mediaId');
    expect(serialized).not.toContain('technologyIds');
    expect(serialized).not.toContain('cloudinaryPublicId');
    expect(serialized).not.toContain(document._id.toString());
    expect(serialized).toContain('TypeScript');
  });

  it('omits wrong owner/role pairs', async () => {
    const document = {
      _id: new ObjectId(),
      ownerType: 'Build',
      ownerId: new ObjectId(),
      role: 'body',
      blocks: [{ id: 'p', type: 'paragraph', data: { text: 'Hidden role' } }],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as DocumentRecord;
    expect(await toPublicDocuments(source, [document])).toEqual([]);
  });
});
